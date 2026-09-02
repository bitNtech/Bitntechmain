import {
  Box3,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three'
import type { NilaMood } from './nilaBrain'

export const MODEL_URL = '/assets/happy_robot_button_copy.glb'

/* The Spline export carries geometry only — no materials, no textures, and the
   two stacked "ESTADO" plates are identical rounded cubes that Spline used to
   swap face art. So the shell gets materials here and the face is built from
   flat discs parented to the visor, which also makes every expression ours to
   animate rather than a baked texture we cannot change. */
const SHELL = '#faf7f0'
const VISOR = '#14100e'
const ACCENT = '#ff6e42'

export type Parts = {
  root: Object3D
  head: Object3D | null
  /** Head shell, visor and ears on one hinge at the top of the neck. */
  neck: Group | null
  visor: Mesh | null
  /** Half-width of the squared-off face screen, for anything laying out on it. */
  faceHalf: number
  eyes: Group
  eyeL: Mesh
  eyeR: Mesh
  mouth: Mesh
  cheeks: Group
  armL: Group | null
  armR: Group | null
}

/** Mouth and eye shape per mood, in visor-local units. */
/** Feature radii, in plate units — the frame loop scales against these. */
export const EYE = 20
export const MOUTH = 16

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

function buildFace(visor: Mesh | null) {
  // One disc geometry, reused and scaled — eyes and cheeks are circles.
  const disc = new CircleGeometry(1, 32)
  // The mouth is the bottom half of a disc: a flat top with a round bottom
  // reads as a smile at any size, where a full ellipse reads as a hole.
  const smile = new CircleGeometry(1, 32, Math.PI, Math.PI)

  // The face is a decal on a rounded plate: a couple of units of clearance is
  // not enough to beat depth precision on its own, so the offset does it.
  const decal = { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }
  const light = new MeshStandardMaterial({ color: SHELL, emissive: new Color(SHELL), emissiveIntensity: 0.35, roughness: 0.9, ...decal })
  const blush = new MeshStandardMaterial({ color: ACCENT, emissive: new Color(ACCENT), emissiveIntensity: 0.4, roughness: 1, transparent: true, opacity: 0.85, ...decal })

  const mk = (mat: MeshStandardMaterial, r: number, x: number, y: number, geometry = disc) => {
    const m = new Mesh(geometry, mat)
    m.scale.setScalar(r)
    m.position.set(x, y, 0)
    m.renderOrder = 2
    return m
  }

  /* The exported plate is a 211 x 142 rounded cube — a letterbox, not the
     square screen this face wants. Narrowing the plate squares it off; the
     face then hangs in a group that undoes that squash, so the eyes stay
     round and can be laid out in plain square coordinates. */
  const plate = visor?.geometry.boundingBox
  const half = plate ? Math.min(plate.max.x, plate.max.y) : 71.1
  const squash = plate ? half / plate.max.x : 1
  if (visor) visor.scale.x *= squash

  const face = new Group()
  face.scale.x = 1 / squash
  // Clear of the plate's rounded front, which sits at its z half-extent.
  face.position.z = (plate?.max.z ?? 81.5) + 9

  const eyes = new Group()
  const eyeL = mk(light, EYE, -30, 10)
  const eyeR = mk(light, EYE, 30, 10)
  eyes.add(eyeL, eyeR)

  const mouth = mk(light, MOUTH, 0, -24, smile)

  const cheeks = new Group()
  cheeks.add(mk(blush, 10, -52, -16), mk(blush, 10, 52, -16))
  cheeks.position.z = -2
  cheeks.visible = false

  face.add(eyes, mouth, cheeks)
  visor?.add(face)
  return { eyes, eyeL, eyeR, mouth, cheeks, faceHalf: half }
}

/**
 * Hangs `nodes` off a fresh group whose origin sits at the top or bottom of
 * what they enclose, keeping their world transform.
 *
 * The export has no rig: the head shell (CABEZA) is a sibling of the ears and
 * visor (Compornentes), so turning the head used to leave the face behind, and
 * the hands live under MANOS, whose scale is (0.82, 1.01, 3.31) — rotating a
 * child of that shears it. A joint parented into uniformly-scaled space fixes
 * both: everything on the hinge turns as one solid piece.
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

/* GLTFLoader does not hand back the names Spline wrote: spaces become
   underscores and a repeated name gets a numeric suffix, so this file's two
   "NORMAL" plates arrive as NORMAL and NORMAL_1. Look them up by the exported
   name and let the suffix float. */
export function findAll(root: Object3D, name: string): Object3D[] {
  const want = name.replace(/\s/g, '_')
  const out: Object3D[] = []
  root.traverse((child) => {
    if (child.name === want || /^_\d+$/.test(child.name.slice(want.length))) out.push(child)
  })
  return out
}

export function prepare(source: Object3D): Parts {
  const root = source.clone(true)

  // Drop the exporter's backdrop plane, camera rig and baked lights: the scene
  // supplies its own so the robot lights the same on every page. The second
  // ESTADO plate is the same cube at the same transform and would z-fight.
  for (const name of ['REACCIONES', 'Directional Light', 'Default Ambient Light', 'feliz 3']) {
    findAll(root, name).forEach((node) => node.removeFromParent())
  }

  const shell = new MeshStandardMaterial({ color: SHELL, roughness: 0.42, metalness: 0.04 })
  const visorMat = new MeshStandardMaterial({ color: VISOR, roughness: 0.28, metalness: 0.1 })
  const accent = new MeshStandardMaterial({ color: ACCENT, roughness: 0.45, metalness: 0.05 })

  // The surviving plate is the visor. Both NORMAL nodes are meshes, but the
  // backdrop one went out with REACCIONES above.
  const visor = (findAll(root, 'NORMAL').find((node) => (node as Mesh).isMesh) as Mesh) ?? null

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

  // The rig the export never had. Torso ("Robot") and body ("Cuerpo") are both
  // uniformly scaled, so rotation applied at a joint stays rigid.
  const head = root.getObjectByName('CABEZA') ?? null
  const crown = root.getObjectByName('Compornentes')
  const torso = root.getObjectByName('Robot')
  const body = root.getObjectByName('Cuerpo')
  const neck = torso && head && crown ? joint(torso, [head, crown], 'bottom') : null
  const arm = (name: string) => {
    const hand = root.getObjectByName(name)
    return body && hand ? joint(body, [hand], 'top') : null
  }
  const armL = arm('IZ')
  const armR = arm('DER')

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

  return { root: wrapper, head, neck, visor, armL, armR, ...face }
}

