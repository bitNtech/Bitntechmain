import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  Box3,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  MathUtils,
  Object3D,
  Vector3,
} from 'three'
import type { NilaMood } from './nilaBrain'

const MODEL_URL = '/assets/happy_robot_button_copy.glb'

/* The Spline export carries geometry only — no materials, no textures, and the
   two stacked "ESTADO" plates are identical rounded cubes that Spline used to
   swap face art. So the shell gets materials here and the face is built from
   flat discs parented to the visor, which also makes every expression ours to
   animate rather than a baked texture we cannot change. */
const SHELL = '#faf7f0'
const VISOR = '#14100e'
const ACCENT = '#ff6e42'

type Parts = {
  root: Object3D
  head: Object3D | null
  visor: Object3D | null
  eyes: Group
  eyeL: Mesh
  eyeR: Mesh
  mouth: Mesh
  cheeks: Group
  handL: Object3D | null
  handR: Object3D | null
}

/** Mouth and eye shape per mood, in visor-local units. */
const FACE: Record<NilaMood, { eye: number; mouthX: number; mouthY: number; mouthDrop: number; cheeks: number }> = {
  idle: { eye: 1, mouthX: 1.1, mouthY: 0.42, mouthDrop: 0, cheeks: 0 },
  happy: { eye: 1.05, mouthX: 1.5, mouthY: 1.05, mouthDrop: -4, cheeks: 1 },
  excited: { eye: 1.25, mouthX: 1.35, mouthY: 1.5, mouthDrop: -3, cheeks: 1 },
  watching: { eye: 0.72, mouthX: 0.55, mouthY: 0.5, mouthDrop: 0, cheeks: 0 },
  thinking: { eye: 0.85, mouthX: 0.7, mouthY: 0.3, mouthDrop: 2, cheeks: 0 },
  success: { eye: 0.5, mouthX: 1.7, mouthY: 1.3, mouthDrop: -5, cheeks: 1 },
}

function buildFace(visor: Object3D | null) {
  // One disc geometry, reused and scaled — eyes, mouth and cheeks are all
  // ellipses, exactly like the CSS robot this replaces.
  const disc = new CircleGeometry(1, 24)
  const light = new MeshStandardMaterial({ color: SHELL, emissive: new Color(SHELL), emissiveIntensity: 0.55, roughness: 0.9 })
  const blush = new MeshStandardMaterial({ color: ACCENT, emissive: new Color(ACCENT), emissiveIntensity: 0.4, roughness: 1, transparent: true, opacity: 0.85 })

  const mk = (mat: MeshStandardMaterial, r: number, x: number, y: number) => {
    const m = new Mesh(disc, mat)
    m.scale.setScalar(r)
    m.position.set(x, y, 0)
    return m
  }

  // The visor plate is a 211 x 142 x 163 rounded cube centred on its own
  // origin, so its front face sits at z = 81.5 in local units.
  const Z = 84
  const eyes = new Group()
  const eyeL = mk(light, 17, -44, 12)
  const eyeR = mk(light, 17, 44, 12)
  eyes.add(eyeL, eyeR)
  eyes.position.z = Z

  const mouth = mk(light, 14, 0, -30)
  mouth.position.z = Z

  const cheeks = new Group()
  cheeks.add(mk(blush, 11, -74, -14), mk(blush, 11, 74, -14))
  cheeks.position.z = Z - 1
  cheeks.visible = false

  visor?.add(eyes, mouth, cheeks)
  return { eyes, eyeL, eyeR, mouth, cheeks }
}

function prepare(source: Object3D): Parts {
  const root = source.clone(true)

  // Drop the exporter's backdrop plane, camera rig and baked lights: the scene
  // supplies its own so the robot lights the same on every page.
  for (const name of ['REACCIONES', 'Directional Light', 'Default Ambient Light']) {
    const node = root.getObjectByName(name)
    node?.removeFromParent()
  }

  const shell = new MeshStandardMaterial({ color: SHELL, roughness: 0.42, metalness: 0.04 })
  const visorMat = new MeshStandardMaterial({ color: VISOR, roughness: 0.28, metalness: 0.1 })
  const accent = new MeshStandardMaterial({ color: ACCENT, roughness: 0.45, metalness: 0.05 })

  // Both ESTADO plates are the same cube at the same transform; keeping both
  // would z-fight, so one becomes the visor and the other goes.
  const visor = root.getObjectByName('NORMAL') ?? null
  root.getObjectByName('feliz 3')?.removeFromParent()

  root.traverse((child) => {
    if (!(child as Mesh).isMesh) return
    const mesh = child as Mesh
    mesh.castShadow = false
    mesh.receiveShadow = false
    if (mesh === visor) mesh.material = visorMat
    else if (mesh.name.startsWith('OREJA')) mesh.material = accent
    else mesh.material = shell
  })

  const face = buildFace(visor)

  // Normalise: the export is in centimetre-scale units with an arbitrary
  // origin, so centre it and scale to roughly one unit tall.
  const box = new Box3().setFromObject(root)
  const size = new Vector3()
  const centre = new Vector3()
  box.getSize(size)
  box.getCenter(centre)
  const wrapper = new Group()
  root.position.sub(centre)
  wrapper.add(root)
  wrapper.scale.setScalar(1 / Math.max(size.y, 0.0001))

  return {
    root: wrapper,
    head: root.getObjectByName('CABEZA') ?? null,
    visor,
    handL: root.getObjectByName('IZ') ?? null,
    handR: root.getObjectByName('DER') ?? null,
    ...face,
  }
}

export type NilaModelProps = {
  /** Pointer in -1..1 view space; the head and eyes track it. */
  pointerRef: React.MutableRefObject<{ x: number; y: number }>
  mood: NilaMood
  /** Raised hand + bigger bob, used when Nila is trying to get attention. */
  waving?: boolean
}

export default function NilaModel({ pointerRef, mood, waving = false }: NilaModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const parts = useMemo(() => prepare(scene), [scene])
  const blink = useRef({ next: 2, closed: 0 })

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const p = pointerRef.current
    const { root, head, eyes, eyeL, eyeR, mouth, cheeks, handR } = parts

    // Idle float — the whole reason it reads as alive rather than placed.
    root.position.y = Math.sin(t * 1.6) * (waving ? 0.045 : 0.022)
    root.rotation.z = Math.sin(t * 0.9) * 0.03

    if (head) {
      head.rotation.y = MathUtils.lerp(head.rotation.y, p.x * 0.5, 0.08)
      head.rotation.x = MathUtils.lerp(head.rotation.x, p.y * 0.32, 0.08)
    }

    // Eyes drift a little further than the head, so it reads as looking rather
    // than just turning.
    eyes.position.x = MathUtils.lerp(eyes.position.x, p.x * 9, 0.1)
    eyes.position.y = MathUtils.lerp(eyes.position.y, -p.y * 6, 0.1)

    const face = FACE[mood]

    blink.current.next -= delta
    if (blink.current.next <= 0) {
      blink.current.closed = 0.12
      blink.current.next = 2.4 + Math.random() * 3.4
    }
    blink.current.closed = Math.max(0, blink.current.closed - delta)
    const lid = blink.current.closed > 0 ? 0.12 : 1

    for (const eye of [eyeL, eyeR]) {
      eye.scale.x = MathUtils.lerp(eye.scale.x, 17 * face.eye, 0.18)
      eye.scale.y = MathUtils.lerp(eye.scale.y, 17 * face.eye * lid, 0.35)
    }

    mouth.scale.x = MathUtils.lerp(mouth.scale.x, 14 * face.mouthX, 0.16)
    mouth.scale.y = MathUtils.lerp(mouth.scale.y, 14 * face.mouthY, 0.16)
    mouth.position.y = MathUtils.lerp(mouth.position.y, -30 + face.mouthDrop, 0.16)
    cheeks.visible = face.cheeks > 0

    if (handR) {
      const wave = waving ? Math.sin(t * 9) * 0.6 - 0.7 : 0
      handR.rotation.z = MathUtils.lerp(handR.rotation.z, wave, 0.12)
      handR.position.y = MathUtils.lerp(handR.position.y, waving ? 60 : 0, 0.12)
    }
  })

  return <primitive object={parts.root} />
}

useGLTF.preload(MODEL_URL)
