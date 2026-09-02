import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { MathUtils } from 'three'
import { EYE, FACE, MODEL_URL, MOUTH, prepare } from './nilaModelPrep'
import type { NilaMood } from './nilaBrain'

export type NilaModelProps = {
  mood: NilaMood
  /** Raised hand + bigger bob, used when Nila is trying to get attention. */
  waving?: boolean
  /** Which way she is facing: -1 left, 0 straight at you, 1 right. */
  facing?: number
  /** True while she is crossing the page — she leans into the trip. */
  travelling?: boolean
}

export default function NilaModel({ mood, waving = false, facing = 0, travelling = false }: NilaModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const parts = useMemo(() => prepare(scene), [scene])
  const blink = useRef({ next: 2, closed: 0 })

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const { root, neck, eyes, eyeL, eyeR, mouth, cheeks, armL, armR } = parts
    const dizzy = mood === 'dizzy'
    // Ease every drive with the frame's own length, so a slow frame doesn't
    // make her snap and a fast one doesn't freeze her mid-turn.
    const ease = (rate: number) => 1 - Math.exp(-rate * delta)

    // Idle float — the whole reason it reads as alive rather than placed.
    root.position.y = Math.sin(t * (dizzy ? 3.4 : 1.6)) * (waving || dizzy ? 0.045 : 0.022)

    /* Turning. The body swings a third of the way and the head the rest, one
       beat ahead of it, which is what selling a turn as a turn rather than a
       sprite flip comes down to. Leaning into the trip does the same for the
       travel: she banks the way she is going, then levels out on arrival. */
    const bodyYaw = dizzy ? Math.sin(t * 2.7) * 0.3 : facing * 0.34
    const bodyRoll = dizzy ? Math.sin(t * 4.1) * 0.14 : (travelling ? -facing * 0.17 : 0) + Math.sin(t * 0.9) * 0.03
    root.rotation.y = MathUtils.lerp(root.rotation.y, bodyYaw, ease(dizzy ? 7 : 2.6))
    root.rotation.z = MathUtils.lerp(root.rotation.z, bodyRoll, ease(dizzy ? 7 : 3.2))

    if (neck) {
      // Head, visor and ears ride one hinge, so the face never drifts off the
      // skull — it turns with it, expression and all.
      const lead = dizzy
        ? { y: Math.sin(t * 3.6) * 0.34, x: Math.sin(t * 2.2) * 0.12, z: Math.sin(t * 5.1) * 0.26 }
        : {
            y: facing * 0.26 + Math.sin(t * 0.41) * 0.07,
            x: Math.sin(t * 0.63) * 0.035 + (mood === 'thinking' ? -0.08 : 0),
            z: Math.sin(t * 0.52) * 0.025 + (mood === 'thinking' ? 0.17 : 0) - (travelling ? facing * 0.08 : 0),
          }
      neck.rotation.y = MathUtils.lerp(neck.rotation.y, lead.y, ease(dizzy ? 9 : 4))
      neck.rotation.x = MathUtils.lerp(neck.rotation.x, lead.x, ease(4))
      neck.rotation.z = MathUtils.lerp(neck.rotation.z, lead.z, ease(dizzy ? 9 : 4))
    }

    // Eyes wander a little on their own. They do not follow the pointer: being
    // stared at by the furniture is unsettling, and glancing about is not.
    const gaze = dizzy ? Math.sin(t * 6.2) * 6 : Math.sin(t * 0.37) * 3 + facing * 4
    eyes.position.x = MathUtils.lerp(eyes.position.x, gaze, ease(3))
    eyes.position.y = MathUtils.lerp(eyes.position.y, dizzy ? Math.cos(t * 6.2) * 4 : Math.sin(t * 0.29) * 2, ease(3))

    const face = FACE[mood]

    blink.current.next -= delta
    if (blink.current.next <= 0) {
      blink.current.closed = 0.12
      blink.current.next = 2.4 + Math.random() * 3.4
    }
    blink.current.closed = Math.max(0, blink.current.closed - delta)
    const lid = blink.current.closed > 0 ? 0.12 : 1

    for (const eye of [eyeL, eyeR]) {
      eye.scale.x = MathUtils.lerp(eye.scale.x, EYE * face.eye, ease(11))
      eye.scale.y = MathUtils.lerp(eye.scale.y, EYE * face.eye * lid, ease(25))
    }

    mouth.scale.x = MathUtils.lerp(mouth.scale.x, MOUTH * face.mouthX, ease(10))
    mouth.scale.y = MathUtils.lerp(mouth.scale.y, MOUTH * face.mouthY, ease(10))
    mouth.position.y = MathUtils.lerp(mouth.position.y, -24 + face.mouthDrop, ease(10))
    cheeks.visible = face.cheeks > 0

    // Arms hang off shoulder joints, so this is a swing rather than a shear.
    const swing = dizzy ? 0.5 + Math.sin(t * 5.5) * 0.35 : waving ? 1.15 + Math.sin(t * 9) * 0.45 : 0
    if (armR) armR.rotation.z = MathUtils.lerp(armR.rotation.z, -swing, ease(8))
    if (armL) armL.rotation.z = MathUtils.lerp(armL.rotation.z, dizzy ? swing : 0, ease(8))
  })

  return <primitive object={parts.root} />
}

useGLTF.preload(MODEL_URL)
