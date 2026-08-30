// Run: node src/pages/robotArm.test.ts
// Guards the one thing that silently broke before: three's GLTFLoader rewrites
// node names ("Base Y Rotation" -> "Base_Y_Rotation"), so raw-name lookups
// returned undefined and the arm never moved.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ARM_CLUTTER, ARM_JOINT_NAMES, findArmNode, prepareArmScene } from './robotArm.ts'

const glb = readFileSync(new URL('../../public/assets/robot_arm.glb', import.meta.url))
const scene = await new Promise<any>((resolve, reject) => {
  new GLTFLoader().parse(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), '', (g) => resolve(g.scene), reject)
})

// GLTFLoader really does mangle the names -- if this stops holding, the
// normalising lookup is no longer needed.
assert.ok(!scene.getObjectByName('Base Y Rotation'), 'expected raw spaced name to be unavailable after load')
assert.ok(scene.getObjectByName('Base_Y_Rotation'), 'expected underscored name after load')

for (const name of ARM_JOINT_NAMES) {
  assert.ok(findArmNode(scene, name), `joint not found: ${name}`)
}

const joints = prepareArmScene(scene)
assert.equal(joints.length, ARM_JOINT_NAMES.length)
assert.ok(joints.every((j) => j), 'every joint must resolve, else the arm cannot move')

for (const name of ARM_CLUTTER) {
  assert.ok(!findArmNode(scene, name), `clutter not removed: ${name}`)
}

// Joints must be nested, so driving each one carries the end effector with it.
// Measured at the gripper: the upper joints sit near the base's own rotation
// axis, so they barely translate even when the rig is working correctly.
const { Vector3 } = await import('three')
const gripper = findArmNode(scene, 'Grab')!
assert.ok(gripper, 'gripper node missing')

const tipPosition = () => {
  scene.updateMatrixWorld(true)
  return gripper.getWorldPosition(new Vector3()).clone()
}

const [base, hand1, hand2, hand3] = joints
for (const [label, joint, axis] of [
  ['base', base, 'y'],
  ['hand1', hand1, 'x'],
  ['hand2', hand2, 'x'],
  ['hand3', hand3, 'x'],
] as const) {
  const before = tipPosition()
  const rest = axis === 'y' ? joint!.restY : joint!.restX
  joint!.node.rotation[axis] = rest + 0.4
  const moved = before.distanceTo(tipPosition())
  joint!.node.rotation[axis] = rest
  assert.ok(moved > 0.02, `${label} rotation must move the gripper (moved ${moved.toFixed(4)})`)
}

console.log('robotArm: ok')
