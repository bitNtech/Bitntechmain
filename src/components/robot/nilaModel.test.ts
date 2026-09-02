// Run: node src/components/robot/nilaModel.test.ts
// Same trap the arm fell into: GLTFLoader rewrites node names, and a repeated
// name ("NORMAL" twice) gets a numeric suffix. Raw-name lookups found nothing,
// so Nila lost her visor, her face and kept the exporter's baked lights.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Mesh } from 'three'
import { findAll, prepare } from './nilaModelPrep.ts'

const glb = readFileSync(new URL('../../../public/assets/happy_robot_button_copy.glb', import.meta.url))
const scene = await new Promise<any>((resolve, reject) => {
  new GLTFLoader().parse(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), '', (g) => resolve(g.scene), reject)
})

// The de-duplicated name is exactly what a plain getObjectByName misses.
assert.equal(scene.getObjectByName('NORMAL_1')?.name, 'NORMAL_1')
assert.ok(findAll(scene, 'feliz 3').length === 1, 'sanitised space lookup must hit')

const parts = prepare(scene)
assert.ok(parts.visor && (parts.visor as Mesh).isMesh, 'visor plate must be found')
assert.ok(parts.head, 'head must be found')

// The export has no rig: the head shell was a sibling of the visor, so turning
// the head left the face floating where it was. Both have to ride one hinge.
assert.ok(parts.neck, 'the neck joint must exist')
assert.equal(parts.head!.parent, parts.neck, 'the head shell hangs off the neck')
assert.equal(parts.visor!.parent?.parent?.parent, parts.neck, 'the visor hangs off the same neck')
// Rotating a child of a non-uniformly scaled parent shears it, which is what
// the arms used to do inside MANOS (0.82, 1.01, 3.31).
for (const [label, arm] of [['armL', parts.armL], ['armR', parts.armR]] as const) {
  assert.ok(arm, `${label} joint must exist`)
  const s = arm!.parent!.scale
  assert.ok(Math.abs(s.x - s.y) < 1e-6 && Math.abs(s.y - s.z) < 1e-6, `${label} must hang in uniformly scaled space`)
}
const ns = parts.neck!.parent!.scale
assert.ok(Math.abs(ns.x - ns.y) < 1e-6 && Math.abs(ns.y - ns.z) < 1e-6, 'the neck must hang in uniformly scaled space')
assert.equal(findAll(parts.root, 'feliz 3').length, 0, 'the z-fighting twin plate must be gone')
for (const name of ['REACCIONES', 'Directional Light', 'Default Ambient Light']) {
  assert.equal(findAll(parts.root, name).length, 0, `${name} must be stripped`)
}

// The face lives on the visor, in front of its plate — off by a sign and she
// stares out the back of her own head.
assert.equal(parts.eyes.parent?.parent, parts.visor, 'the face group must hang off the visor')

// The screen has to be square, or the "face" is a letterbox with eyes in it.
const plate = (parts.visor as Mesh).geometry.boundingBox!
const screen = { w: plate.max.x * parts.visor!.scale.x, h: plate.max.y * parts.visor!.scale.y }
assert.ok(Math.abs(screen.w - screen.h) < 0.5, `screen must be square (${screen.w} x ${screen.h})`)

// Features that run off the plate are the "bad face" failure: a disc hanging
// over the edge of the screen floats in mid-air.
const face = parts.eyes.parent!
for (const [label, mesh, group] of [
  ['eyeL', parts.eyeL, parts.eyes],
  ['eyeR', parts.eyeR, parts.eyes],
  ['mouth', parts.mouth, null],
  ['cheek', parts.cheeks.children[0] as Mesh, parts.cheeks],
] as const) {
  const x = Math.abs(mesh.position.x + (group?.position.x ?? 0)) + mesh.scale.x
  const y = Math.abs(mesh.position.y + (group?.position.y ?? 0)) + mesh.scale.y
  assert.ok(x <= parts.faceHalf, `${label} must stay on the screen (x ${x.toFixed(1)} > ${parts.faceHalf})`)
  assert.ok(y <= parts.faceHalf, `${label} must stay on the screen (y ${y.toFixed(1)} > ${parts.faceHalf})`)
}

// The squash on the plate has to be undone on the face, or the eyes are eggs.
assert.ok(Math.abs(face.scale.x * parts.visor!.scale.x - parts.visor!.scale.y) < 1e-6, 'eyes must stay round')
// ...and the face has to sit clear in front of the plate it decals.
assert.ok(face.position.z > plate.max.z, 'face must sit in front of the screen')

console.log('nilaModel: ok')
