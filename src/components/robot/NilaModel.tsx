import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { MathUtils } from 'three'
import { FACE, MODEL_URL, prepare } from './nilaModelPrep'
import type { NilaMood } from './nilaBrain'

/** Where the pointer is inside her section, -1..1 from the centre. */
export type NilaLook = { x: number; y: number; active: boolean }

export type NilaModelProps = {
  mood: NilaMood
  /** Raised hand + bigger bob, used when Nila is trying to get attention. */
  waving?: boolean
  /** Which way she is facing: -1 left, 0 straight at you, 1 right. */
  facing?: number
  /** True while she is crossing the page — she leans into the trip. */
  travelling?: boolean
  /** Planted: no float, no sway, no idle drift. She still waves and blinks. */
  still?: boolean
  /* Give her this and her eyes follow the pointer instead of wandering. A ref
     rather than a prop on purpose: pointer moves would otherwise re-render the
     component sixty times a second to hand three.js two numbers. */
  lookRef?: RefObject<NilaLook>
}

/**
 * How much movement to spend. On a phone she renders as a 56px puck, where the
 * secondary drifts are a few pixels of travel nobody can resolve, so they are
 * dropped rather than scaled — and with reduced motion she holds still and just
 * changes expression.
 */
function motionBudget() {
  if (typeof window === 'undefined' || !window.matchMedia) return { drift: 1, calm: false, reduced: false }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return { drift: 0, calm: true, reduced: true }
  return { drift: window.matchMedia('(max-width: 720px)').matches ? 0 : 1, calm: false, reduced: false }
}

export default function NilaModel({ mood, waving = false, facing = 0, travelling = false, still = false, lookRef }: NilaModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const parts = useMemo(() => prepare(scene), [scene])
  /* `still` borrows the reduced-motion path — same zeroed drift and float —
     without claiming the user asked for it, so the wave survives. */
  const budget = useMemo(() => {
    const b = motionBudget()
    return still ? { ...b, drift: 0, calm: true } : b
  }, [still])
  const blink = useRef({ next: 2, closed: 0 })

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const { root, neck, eyes, eyeL, eyeR, mouth, cheeks, armL, armR } = parts
    const dizzy = mood === 'dizzy'
    const { drift, calm, reduced } = budget
    // Dizzy overrides being looked at: she cannot focus on anything.
    const look = !dizzy && lookRef?.current?.active ? lookRef.current : null
    // Ease every drive with the frame's own length, so a slow frame doesn't
    // make her snap and a fast one doesn't freeze her mid-turn.
    const ease = (rate: number) => 1 - Math.exp(-rate * delta)

    // Idle float — the whole reason it reads as alive rather than placed.
    root.position.y = calm ? 0 : Math.sin(t * (dizzy ? 3.4 : 1.6)) * (waving || dizzy ? 0.045 : 0.022)

    /* Turning. The body swings a third of the way and the head the rest, one
       beat ahead of it, which is what selling a turn as a turn rather than a
       sprite flip comes down to. Leaning into the trip does the same for the
       travel: she banks the way she is going, then levels out on arrival.
       This is the wrapper, which sits outside the model's quarter-turn, so
       here y really is yaw and z really is roll. */
    const bodyYaw = dizzy ? Math.sin(t * 2.7) * 0.3 : facing * 0.34
    const bodyRoll = dizzy ? Math.sin(t * 4.1) * 0.14 : (travelling ? -facing * 0.17 : 0) + Math.sin(t * 0.9) * 0.03 * drift
    root.rotation.y = MathUtils.lerp(root.rotation.y, bodyYaw, ease(dizzy ? 7 : 2.6))
    root.rotation.z = MathUtils.lerp(root.rotation.z, bodyRoll, ease(dizzy ? 7 : 3.2))

    if (neck) {
      /* One group holds shell and face, and its origin already sits at the
         base of the neck, so the whole head turns as a piece.
         Inside the model, forward is X and ear-to-ear is Z: yaw is still Y,
         but the nod is Z and the tilt is X — the swap of the two the old
         model used. */
      const lead = dizzy
        ? { yaw: Math.sin(t * 3.6) * 0.34, nod: Math.sin(t * 2.2) * 0.12, tilt: Math.sin(t * 5.1) * 0.26 }
        : {
            // A little head follows the eyes. Only a little: the eyes do the
            // looking, and a head that tracks one-for-one reads as a turret.
            yaw: facing * 0.26 + Math.sin(t * 0.41) * 0.07 * drift + (look ? look.x * 0.16 : 0),
            nod: Math.sin(t * 0.63) * 0.035 * drift + (mood === 'thinking' ? -0.08 : 0) - (look ? look.y * 0.1 : 0),
            tilt: Math.sin(t * 0.52) * 0.025 * drift + (mood === 'thinking' ? 0.17 : 0) - (travelling ? facing * 0.08 : 0),
          }
      neck.rotation.y = MathUtils.lerp(neck.rotation.y, lead.yaw, ease(dizzy ? 9 : 4))
      // Negated: the head's local +Z points at world -X once she has turned to
      // face front, so a positive nod would tip her chin up rather than down.
      neck.rotation.z = MathUtils.lerp(neck.rotation.z, -lead.nod, ease(4))
      neck.rotation.x = MathUtils.lerp(neck.rotation.x, lead.tilt, ease(dizzy ? 9 : 4))
    }

    /* Given a pointer she watches it; otherwise the eyes drift on their own,
       because a face that only ever stares dead ahead reads as switched off.
       The face group's net rotation is zero — the model's quarter-turn and the
       face plane's cancel — so its local x and y really are screen right and
       up, and the pointer maps straight onto them. */
    const wander = look
      ? look.x * 7
      : dizzy ? Math.sin(t * 6.2) * 5 : (Math.sin(t * 0.37) * 2.4 + facing * 3) * drift
    const rise = look
      ? look.y * 4.5
      : dizzy ? Math.cos(t * 6.2) * 3.4 : Math.sin(t * 0.29) * 1.6 * drift
    // Snappier when tracking: an eye that lags the cursor looks broken.
    eyes.position.x = MathUtils.lerp(eyes.position.x, wander * parts.gaze, ease(look ? 9 : 3))
    eyes.position.y = MathUtils.lerp(eyes.position.y, rise * parts.gaze, ease(look ? 9 : 3))

    const face = FACE[mood]

    blink.current.next -= delta
    if (blink.current.next <= 0) {
      blink.current.closed = 0.12
      blink.current.next = 2.4 + Math.random() * 3.4
    }
    blink.current.closed = Math.max(0, blink.current.closed - delta)
    const lid = blink.current.closed > 0 ? 0.12 : 1

    for (const eye of [eyeL, eyeR]) {
      eye.scale.x = MathUtils.lerp(eye.scale.x, face.eye, ease(11))
      eye.scale.y = MathUtils.lerp(eye.scale.y, face.eye * lid, ease(25))
    }

    mouth.scale.x = MathUtils.lerp(mouth.scale.x, face.mouthX, ease(10))
    mouth.scale.y = MathUtils.lerp(mouth.scale.y, face.mouthY, ease(10))
    mouth.position.y = MathUtils.lerp(mouth.position.y, parts.mouthRestY - face.mouthDrop * parts.mouthDrop, ease(10))
    cheeks.visible = face.cheeks > 0

    /* Arms hang off shoulder joints, so this is a swing rather than a shear.
       They separate along Z, so raising one is a rotation about X, and the two
       sides take opposite signs to both swing outwards. */
    /* A wave is the hand up beside the head, not an arm held out sideways:
       from hanging down that is most of a half turn, with the oscillation on
       top of it. 1.15 rad only reached horizontal, which read as a limp arm. */
    const swing = dizzy ? 0.5 + Math.sin(t * 5.5) * 0.35 : (waving && !reduced) ? 2.3 + Math.sin(t * 7.5) * 0.32 : 0
    if (armR) armR.rotation.x = MathUtils.lerp(armR.rotation.x, -swing, ease(8))
    if (armL) armL.rotation.x = MathUtils.lerp(armL.rotation.x, dizzy ? swing : 0, ease(8))
  })

  return <primitive object={parts.root} />
}

useGLTF.preload(MODEL_URL)
