// Run: node --experimental-strip-types src/components/robot/nilaModel.test.ts
// The model is geometry only, so everything that makes her read as a character
// is built in prepare(). These are the things that broke while wiring the
// export up: names that matched the wrong nodes, arms that pivot at their own
// middle, a face buried inside its own plate, and rotations on the wrong axis.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Box3, Vector3 } from 'three'
import { FACE, MODEL_URL, findAll, prepare } from './nilaModelPrep.ts'

const glb = readFileSync(new URL('../../../public' + MODEL_URL, import.meta.url))
const scene = await new Promise<any>((resolve, reject) => {
  new GLTFLoader().parse(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), '', (g) => resolve(g.scene), reject)
})

// GLTFLoader rewrites authored names: spaces become underscores.
assert.ok(findAll(scene, 'Eyes Move').length === 1, 'sanitised space lookup must hit')
/* A suffix match must still check the prefix. Matching on the tail alone made
   "Light" match "Scene_1" — same length, ends in _1 — so stripping the baked
   lights deleted the node the whole robot hangs off. */
assert.deepEqual(findAll(scene, 'Light').map((n) => n.name), ['Light'], 'a suffix match must not match a different name')
assert.equal(findAll(scene, 'Directional Light').length, 3, 'numbered siblings must all be found')

const parts = prepare(scene)

// --- the rig -------------------------------------------------------------
assert.ok(parts.neck, 'the head group must be found')
assert.ok(parts.armL && parts.armR, 'both arm joints must exist')

// Everything on the face has to ride the head, or it is left behind on a turn.
for (const [label, node] of [['eyes', parts.eyes], ['mouth', parts.mouth], ['cheeks', parts.cheeks]] as const) {
  let onHead = false
  parts.neck!.traverse((child) => { if (child === node) onHead = true })
  assert.ok(onHead, `${label} must hang off the head group`)
}

// Rotating a child of a non-uniformly scaled parent shears it.
for (const [label, node] of [['armL', parts.armL], ['armR', parts.armR], ['neck', parts.neck]] as const) {
  const s = node!.parent!.scale
  assert.ok(Math.abs(s.x - s.y) < 1e-6 && Math.abs(s.y - s.z) < 1e-6, `${label} must hang in uniformly scaled space`)
}

/* The arms' own origins sit at the middle of the arm: rotating them there
   swings the hand up and the shoulder down. The joint has to be at the top. */
for (const [label, arm] of [['armL', parts.armL], ['armR', parts.armR]] as const) {
  const box = new Box3().setFromObject(arm!)
  const pivot = arm!.getWorldPosition(new Vector3())
  const height = box.max.y - box.min.y
  assert.ok(
    Math.abs(pivot.y - box.max.y) < height * 0.15,
    `${label} must pivot at the shoulder, not its middle (pivot ${pivot.y.toFixed(3)} vs top ${box.max.y.toFixed(3)})`,
  )
}

// --- what the design asked to go ----------------------------------------
// The headphone ears, and the authored face the drawn one replaces.
for (const gone of ['New Headphone', 'Ears', 'Eyes', 'Mouth', 'Eyes Move', 'Mouth Move 2']) {
  assert.equal(findAll(parts.root, gone).length, 0, `${gone} must be stripped`)
}

// --- facing --------------------------------------------------------------
/* The export faces +X while the camera looks down -Z. Unrotated she presents
   her ear. The face must end up on the +Z side of the head. */
parts.root.updateMatrixWorld(true)
/* Bounds, not getWorldPosition: these meshes carry their geometry away from
   their own origin, so an origin says nothing about where they are. */
const eyeAt = new Box3().setFromObject(parts.eyes).getCenter(new Vector3())
const headBox = new Box3().setFromObject(parts.neck!)
const headMid = headBox.getCenter(new Vector3())
assert.ok(
  eyeAt.z > headMid.z + (headBox.max.z - headBox.min.z) * 0.15,
  `she must face the camera: eyes at z=${eyeAt.z.toFixed(3)} vs head centre ${headMid.z.toFixed(3)}`,
)
assert.ok(Math.abs(eyeAt.x - headMid.x) < (headBox.max.x - headBox.min.x) * 0.2, 'eyes must be centred across the face')

// The arms have to end up either side of her, not one in front of the other.
const armLAt = parts.armL!.getWorldPosition(new Vector3())
const armRAt = parts.armR!.getWorldPosition(new Vector3())
assert.ok(Math.abs(armLAt.x - armRAt.x) > Math.abs(armLAt.z - armRAt.z), 'arms must separate across the screen')
assert.ok(armRAt.x < armLAt.x, "her right arm belongs on the viewer's left")

// --- the face reads ------------------------------------------------------
// Features buried inside the plate are invisible; they must sit proud of it.
const plateBox = new Box3().setFromObject(parts.neck!.getObjectByName('Head_2')!)
for (const [label, node] of [['eyes', parts.eyes], ['mouth', parts.mouth]] as const) {
  const front = new Box3().setFromObject(node).max.z
  assert.ok(front >= plateBox.max.z - 1e-4, `${label} must not be buried in the face plate`)
}
// ...and inside it, or they float off the side of her head.
for (const [label, node] of [['eyes', parts.eyes], ['mouth', parts.mouth], ['cheeks', parts.cheeks]] as const) {
  const b = new Box3().setFromObject(node)
  assert.ok(b.min.x >= plateBox.min.x && b.max.x <= plateBox.max.x, `${label} must stay on the screen across`)
  assert.ok(b.min.y >= plateBox.min.y && b.max.y <= plateBox.max.y, `${label} must stay on the screen vertically`)
}
// Two eyes, level with each other and either side of centre.
assert.ok(parts.eyeL.position.x < 0 && parts.eyeR.position.x > 0, 'the eyes must sit either side of centre')
assert.equal(parts.eyeL.position.y, parts.eyeR.position.y, 'the eyes must be level')
assert.equal(parts.cheeks.children.length, 2, 'two cheeks')
assert.equal(parts.cheeks.visible, false, 'cheeks start off — idle does not blush')
// The smile has to curve upward at the ends, or it is a frown.
const smile = new Box3().setFromObject(parts.mouth)
assert.ok(smile.getCenter(new Vector3()).y < eyeAt.y, 'the mouth belongs below the eyes')

// --- normalisation -------------------------------------------------------
const whole = new Box3().setFromObject(parts.root)
const size = whole.getSize(new Vector3())
assert.ok(Math.abs(size.y - 1) < 0.02, `must normalise to a unit tall (got ${size.y.toFixed(3)})`)
const centre = whole.getCenter(new Vector3())
assert.ok(centre.length() < 0.02, `must be centred on its own origin (got ${centre.length().toFixed(3)})`)

let strays = 0
parts.root.traverse((n: any) => { if (n.isLight || n.isCamera) strays++ })
assert.equal(strays, 0, 'baked cameras and lights must be stripped')

// --- the mood table still drives something -------------------------------
for (const mood of Object.keys(FACE) as (keyof typeof FACE)[]) {
  const f = FACE[mood]
  assert.ok(f.eye > 0 && f.mouthX > 0 && f.mouthY > 0, `${mood} must have a drawable face`)
}
assert.ok(parts.gaze > 0, 'the eyes must have room to wander')
assert.ok(parts.mouthDrop > 0, 'the mouth must have a drop step')

/* --- the axis remap ------------------------------------------------------
   This export faces +X with ear-to-ear on Z, where the old one faced +Z. Every
   rotation in the frame loop had to move axis, and getting one backwards is
   invisible to a type checker and easy to miss in a still: she waves into her
   own chest, or nods when she should shake. Drive each joint and check the
   part actually goes where the animation claims. */
const centreOf = (o: any) => new Box3().setFromObject(o).getCenter(new Vector3())
const settle = () => parts.root.updateMatrixWorld(true)

// Arms swing about X, and the two sides take opposite signs so both go out.
for (const [label, arm, side] of [['armR', parts.armR!, -1], ['armL', parts.armL!, 1]] as const) {
  arm.rotation.set(0, 0, 0)
  settle()
  const down = centreOf(arm)
  // The sign the frame loop uses for a wave on this side.
  arm.rotation.x = side === -1 ? -1.2 : 1.2
  settle()
  const up = centreOf(arm)
  assert.ok(up.y > down.y + 0.02, `${label} must rise when it swings (${down.y.toFixed(3)} -> ${up.y.toFixed(3)})`)
  assert.ok(
    Math.abs(up.x) > Math.abs(down.x),
    `${label} must swing outward, away from her body (|${down.x.toFixed(3)}| -> |${up.x.toFixed(3)}|)`,
  )
  arm.rotation.set(0, 0, 0)
}
settle()

// Head: yaw is Y, the nod is Z and the tilt is X — the last two swapped from
// the old model. Measured on the eyes, which is what a viewer reads.
const neutral = centreOf(parts.eyes)
parts.neck!.rotation.set(0, 0.5, 0)
settle()
const yawed = centreOf(parts.eyes)
assert.ok(Math.abs(yawed.x - neutral.x) > 0.02, 'yawing the head must turn the face across the screen')
assert.ok(Math.abs(yawed.y - neutral.y) < 0.02, 'yawing must not raise or lower the face')

/* The frame loop writes -nod to rotation.z, because the head's local +Z points
   at world -X once she is facing front. Drive it the way the loop does and the
   chin must go down. */
parts.neck!.rotation.set(0, 0, -0.5)
settle()
const nodded = centreOf(parts.eyes)
assert.ok(nodded.y < neutral.y - 0.02, 'nodding must drop the face, not lift it')
parts.neck!.rotation.set(0, 0, 0)
settle()

console.log('nilaModel: ok')
