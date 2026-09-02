import {
  Box3,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Shape,
  ShapeGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import type { NilaMood } from './nilaBrain'

export const MODEL_URL = '/assets/newrobo.glb'

/* This export carries geometry only — no materials, no textures, no rig and no
 * baked animation clips — so the shell is materialled here and every movement
 * stays procedural.
 *
 * Two things about it drive the whole file:
 *
 * 1. It faces +X, and its ear-to-ear axis is Z. The camera looks down -Z, so
 *    the model is yawed a quarter turn to face front. That rotation sits on an
 *    inner group, leaving the outer wrapper free for the body animation.
 *    Everything INSIDE keeps the model's own axes, which is why the head nods
 *    around Z and the arms swing around X rather than the other way about.
 * 2. It already has a usable hierarchy — one `Head` group holding shell and
 *    face, and an `ARM_L`/`ARM_R` per side — so almost all of the joint
 *    building an unrigged export needs is gone. The arms are the exception:
 *    their origins sit at the middle of the arm, not the shoulder, so a raw
 *    rotation would spin them about their own waist.
 *
 * The face is drawn here rather than used from the export. The authored eyes
 * and mouth are fixed shapes; these are built from plain geometry so every
 * expression is ours to animate, and so they can be the rounded-rectangle eyes
 * and open smile the design asks for.
 */

const SHELL = '#faf7f0'
const VISOR = '#14100e'
const ACCENT = '#ff6e42'
const FEATURE = '#faf7f0'

export type Parts = {
  /** Outer wrapper: normalised to a unit tall and centred. Body animation. */
  root: Group
  /** The head group. Its own origin already sits at the base of the neck. */
  neck: Object3D | null
  /** Holds both eyes, and carries the gaze wander. */
  eyes: Group
  eyeL: Mesh
  eyeR: Mesh
  mouth: Mesh
  cheeks: Group
  armL: Group | null
  armR: Group | null
  /** One step of eye wander, in face units. */
  gaze: number
  /** Where the mouth sits at rest, and what one "drop" step is worth. */
  mouthRestY: number
  mouthDrop: number
}

export const FACE: Record<NilaMood, { eye: number; mouthX: number; mouthY: number; mouthDrop: number; cheeks: number }> = {
  idle: { eye: 1, mouthX: 0.9, mouthY: 0.55, mouthDrop: 0, cheeks: 0 },
  happy: { eye: 1.02, mouthX: 1.15, mouthY: 0.9, mouthDrop: -2, cheeks: 1 },
  excited: { eye: 1.18, mouthX: 1.05, mouthY: 1.15, mouthDrop: -2, cheeks: 1 },
  watching: { eye: 0.7, mouthX: 0.6, mouthY: 0.45, mouthDrop: 0, cheeks: 0 },
  thinking: { eye: 0.8, mouthX: 0.55, mouthY: 0.35, mouthDrop: 2, cheeks: 0 },
  success: { eye: 0.45, mouthX: 1.25, mouthY: 1.05, mouthDrop: -3, cheeks: 1 },
  // Scrolled far too fast: eyes screwed shut, small round mouth, flushed.
  dizzy: { eye: 0.34, mouthX: 0.5, mouthY: 0.85, mouthDrop: 1, cheeks: 1 },
}

/* GLTFLoader does not hand back the names the exporter wrote: spaces become
   underscores, and a repeated name gets a numeric suffix. Look nodes up by the
   authored name and let the suffix float. */
export function findAll(root: Object3D, name: string): Object3D[] {
  const want = name.replace(/\s/g, '_')
  const out: Object3D[] = []
  root.traverse((child) => {
    if (child.name === want) {
      out.push(child)
      return
    }
    /* The prefix has to be checked, not just the tail. Testing only
       `slice(want.length)` matches any name of the right length ending in
       "_1" — which is how looking for "Light" deleted "Scene_1", and with it
       the entire robot. */
    if (child.name.startsWith(want) && /^_\d+$/.test(child.name.slice(want.length))) out.push(child)
  })
  return out
}

/**
 * Hangs `nodes` off a fresh group whose origin sits at the top or bottom of
 * what they enclose, keeping their world transform.
 *
 * Only the arms need this. `ARM_L` and `ARM_R` have their origins at the
 * centre of the arm, so rotating them directly swings the limb about its own
 * middle — the hand goes up and the shoulder goes down. Re-hung from a joint
 * at the top of their bounds, they pivot at the shoulder like a shoulder.
 */
function joint(parent: Object3D, nodes: Object3D[], anchor: 'top' | 'bottom'): Group {
  parent.updateMatrixWorld(true)
  const box = new Box3()
  for (const node of nodes) box.expandByObject(node)
  const centre = box.getCenter(new Vector3())
  const g = new Group()
  parent.add(g)
  g.position.copy(parent.worldToLocal(new Vector3(centre.x, anchor === 'top' ? box.max.y : box.min.y, centre.z)))
  g.updateMatrixWorld(true)
  for (const node of nodes) g.attach(node)
  return g
}

/** A rounded rectangle, centred on its own origin. */
function roundedRect(halfW: number, halfH: number, radius: number): Shape {
  const r = Math.min(radius, halfW, halfH)
  const s = new Shape()
  s.moveTo(-halfW + r, -halfH)
  s.lineTo(halfW - r, -halfH)
  s.quadraticCurveTo(halfW, -halfH, halfW, -halfH + r)
  s.lineTo(halfW, halfH - r)
  s.quadraticCurveTo(halfW, halfH, halfW - r, halfH)
  s.lineTo(-halfW + r, halfH)
  s.quadraticCurveTo(-halfW, halfH, -halfW, halfH - r)
  s.lineTo(-halfW, -halfH + r)
  s.quadraticCurveTo(-halfW, -halfH, -halfW + r, -halfH)
  return s
}

/**
 * The face: two rounded-rectangle eyes and an open smile, laid out against the
 * dark visor and sized from it, so a re-cut export still lands right.
 *
 * Everything is authored in world units and the group undoes the head's scale,
 * which keeps the numbers below readable instead of being multiples of 98.
 */
function buildFace(head: Object3D, plate: Object3D | undefined) {
  head.updateMatrixWorld(true)
  const box = plate ? new Box3().setFromObject(plate) : new Box3().setFromObject(head)
  const centre = box.getCenter(new Vector3())
  // Pre-yaw the model still faces +X, so "across" is Z and depth is X.
  const across = box.max.z - box.min.z
  const tall = box.max.y - box.min.y

  const decal = { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }
  const feature = new MeshStandardMaterial({
    color: FEATURE,
    emissive: new Color(FEATURE),
    emissiveIntensity: 0.4,
    roughness: 0.9,
    ...decal,
  })
  const blush = new MeshStandardMaterial({
    color: ACCENT,
    emissive: new Color(ACCENT),
    emissiveIntensity: 0.4,
    roughness: 1,
    transparent: true,
    opacity: 0.85,
    ...decal,
  })

  const face = new Group()
  head.add(face)
  // A Shape lies in XY facing +Z; this model looks down +X.
  face.rotation.y = Math.PI / 2
  const headScale = head.getWorldScale(new Vector3()).x || 1
  face.scale.setScalar(1 / headScale)
  face.position.copy(head.worldToLocal(new Vector3(box.max.x + across * 0.012, centre.y, centre.z)))

  /* Near-square with a generous corner radius, set wide enough apart to read
     as two eyes rather than one visor slot, and lifted to leave the lower
     third of the screen for the smile. */
  const eyeW = across * 0.105
  const eyeH = tall * 0.155
  const eyeGap = across * 0.185
  const eyeLift = tall * 0.1

  const eyeGeometry = new ShapeGeometry(roundedRect(eyeW, eyeH, Math.min(eyeW, eyeH) * 0.66), 8)
  const eyes = new Group()
  eyes.position.y = eyeLift
  const eyeL = new Mesh(eyeGeometry, feature)
  const eyeR = new Mesh(eyeGeometry, feature)
  eyeL.position.x = -eyeGap
  eyeR.position.x = eyeGap
  eyeL.renderOrder = 2
  eyeR.renderOrder = 2
  eyes.add(eyeL, eyeR)

  /* An open smile: a tube bent through the bottom of a circle. TorusGeometry
     always starts at angle 0, so the arc is rotated into place rather than
     offset — and its round cross-section gives the stroke soft ends for free,
     where a flat crescent would cut them square. */
  const smileR = across * 0.12
  const smileArc = Math.PI * 0.74
  const mouth = new Mesh(new TorusGeometry(smileR, across * 0.028, 8, 28, smileArc), feature)
  mouth.rotation.z = Math.PI + (Math.PI - smileArc) / 2
  mouth.renderOrder = 2
  const mouthRestY = -tall * 0.19

  /* Under each eye and outside the smile's tips. There is only so much dark
     screen to work with: further out and they spill onto the white shell,
     higher and they hide behind the eye, lower and they meet the smile. */
  const cheeks = new Group()
  cheeks.visible = false
  for (const side of [-1, 1]) {
    const disc = new Mesh(new CircleGeometry(across * 0.045, 20), blush)
    disc.position.set(side * across * 0.21, -tall * 0.175, -across * 0.004)
    disc.renderOrder = 1
    cheeks.add(disc)
  }

  face.add(eyes, mouth, cheeks)
  return {
    eyes,
    eyeL,
    eyeR,
    mouth,
    cheeks,
    gaze: across * 0.012,
    mouthRestY,
    mouthDrop: tall * 0.014,
  }
}

export function prepare(source: Object3D): Parts {
  const inner = source.clone(true)

  // The exporter's own camera and lights: the scene supplies its own so she
  // lights the same on every page, and a baked camera is dead weight.
  for (const name of ['Camera', 'Light', 'Directional Light', 'Default Ambient Light']) {
    findAll(inner, name).forEach((node) => node.removeFromParent())
  }
  inner.traverse((node) => {
    if ((node as { isCamera?: boolean }).isCamera || (node as { isLight?: boolean }).isLight) node.removeFromParent()
  })

  /* The headphone ears go, and so do the authored eyes and mouth that the
     drawn face replaces. Between them that is over a quarter of the model's
     vertices and five draw calls, on something that renders as a 56px puck on
     a phone — the cheapest frame time available here. */
  for (const name of ['New Headphone', 'Eyes', 'Mouth', 'Eyes Move', 'Mouth Move 2']) {
    findAll(inner, name).forEach((node) => node.removeFromParent())
  }

  /* Everything below measures in world space — joint pivots, the face layout,
     the final centring. A clone carries its source's world matrices, and
     detaching nodes leaves them stale, so establish them once here rather than
     letting each step trust whatever it happens to find. */
  inner.updateMatrixWorld(true)

  const shell = new MeshStandardMaterial({ color: SHELL, roughness: 0.42, metalness: 0.04 })
  const visorMat = new MeshStandardMaterial({ color: VISOR, roughness: 0.28, metalness: 0.1 })

  const facePlate = inner.getObjectByName('Head_2')

  inner.traverse((child) => {
    if (!(child as Mesh).isMesh) return
    const mesh = child as Mesh
    mesh.castShadow = false
    mesh.receiveShadow = false
    mesh.material = mesh === facePlate ? visorMat : shell
  })

  const robot = inner.getObjectByName('RoBOT_(Duplicate)') ?? inner
  const neck = inner.getObjectByName('Head') ?? null

  const armFor = (name: string) => {
    const arm = inner.getObjectByName(name)
    return arm ? joint(robot, [arm], 'top') : null
  }
  // Named from the robot's own point of view, which is why ARM_R ends up on
  // the viewer's left once she has turned to face front.
  const armR = armFor('ARM_R')
  const armL = armFor('ARM_L')

  const face = buildFace(neck ?? inner, facePlate)

  // Face front. This lives on the inner group so the wrapper's rotation.y is
  // free for the body turn that the frame loop drives.
  inner.rotation.y = -Math.PI / 2
  inner.updateMatrixWorld(true)

  // Normalise: the export is in centimetre-scale units with an arbitrary
  // origin, so centre it and scale to roughly one unit tall. Measured after
  // the yaw, so the box is the one that actually faces the camera.
  const box = new Box3().setFromObject(inner)
  const size = box.getSize(new Vector3())
  const centre = box.getCenter(new Vector3())
  const wrapper = new Group()
  // Applied after the rotation in the local matrix, so this still centres it.
  inner.position.sub(centre)
  wrapper.add(inner)
  wrapper.scale.setScalar(1 / Math.max(size.y, 0.0001))

  return { root: wrapper, neck, armL, armR, ...face }
}
