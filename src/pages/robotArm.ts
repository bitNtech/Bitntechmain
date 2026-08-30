import { MeshStandardMaterial } from 'three'
import type { Mesh, Object3D } from 'three'

// three's GLTFLoader runs every node name through PropertyBinding.sanitizeNodeName,
// which turns spaces into underscores ("Base Y Rotation" -> "Base_Y_Rotation") and
// suffixes duplicates ("Star" -> "Star_1"). Match on a normalised form so the names
// here can stay readable and keep working against either spelling.
const normalise = (name: string) => name.replace(/[\s_]+/g, ' ').trim().toLowerCase()

export function findArmNode(root: Object3D, name: string): Object3D | undefined {
  const wanted = normalise(name)
  let found: Object3D | undefined
  root.traverse((child) => {
    if (!found && normalise(child.name) === wanted) found = child
  })
  return found
}

// The .glb is a raw Spline scene export: alongside the arm rig it carries Spline's
// own floor plane, UI overlay, camera target, decorative sphere halo and baked
// lights. The floor/target sit ~100 units out and wreck auto-framing; the lights
// wash out ours.
export const ARM_CLUTTER = ['Floor', 'UI', 'Target', 'Sphere Clones', 'Directional Light', 'Directional Light 2', 'Default Ambient Light']

// Joint nodes the pointer drives, in the order base -> wrist.
export const ARM_JOINT_NAMES = ['Base Y Rotation', '1 Hand X rotation', '2 Hand X Rotation', '3 Hand X Rotate'] as const

const BODY_MATERIAL = new MeshStandardMaterial({ color: '#123444', metalness: 0.55, roughness: 0.35 })
const ACCENT_MATERIAL = new MeshStandardMaterial({ color: '#ff6e42', metalness: 0.3, roughness: 0.3 })

function isInsideGrab(node: Object3D) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (normalise(parent.name) === 'grab') return true
  }
  return false
}

export type ArmJoint = { node: Object3D; restX: number; restY: number }

/** Strips Spline's scene furniture, applies brand materials, and captures the
 *  pointer-driven joints with their authored rest pose. Mutates `root`. */
export function prepareArmScene(root: Object3D) {
  const clutter: Object3D[] = []
  for (const name of ARM_CLUTTER) {
    const node = findArmNode(root, name)
    if (node) clutter.push(node)
  }
  clutter.forEach((node) => node.parent?.remove(node))

  root.traverse((child) => {
    if ((child as Mesh).isMesh) {
      (child as Mesh).material = normalise(child.name).startsWith('star') || isInsideGrab(child) ? ACCENT_MATERIAL : BODY_MATERIAL
    }
  })

  const joints = ARM_JOINT_NAMES.map((name) => {
    const node = findArmNode(root, name)
    return node ? { node, restX: node.rotation.x, restY: node.rotation.y } : null
  })
  return joints
}
