import { useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { MathUtils } from 'three'
import { prepareArmScene } from '../../pages/robotArm'

// How far each joint swings, base -> wrist. Signs verified against the rendered
// model: base follows the cursor horizontally, and the three segments bend so
// the gripper reaches down as the cursor moves down.
const ARM_JOINT_SWING = [
  { axis: 'y', from: 'x', amount: -0.75 },
  { axis: 'x', from: 'y', amount: 0.55 },
  { axis: 'x', from: 'y', amount: 0.45 },
  { axis: 'x', from: 'y', amount: 0.35 },
] as const

export default function RobotArmModel({ pointerRef }: { pointerRef: MutableRefObject<{ x: number; y: number }> }) {
  const { scene } = useGLTF('/assets/robot_arm.glb')
  const { model, joints } = useMemo(() => {
    const clone = scene.clone(true)
    return { model: clone, joints: prepareArmScene(clone) }
  }, [scene])

  useFrame(() => {
    const pointer = pointerRef.current
    joints.forEach((joint, index) => {
      if (!joint) return
      const { axis, from, amount } = ARM_JOINT_SWING[index]
      const rest = axis === 'y' ? joint.restY : joint.restX
      joint.node.rotation[axis] = MathUtils.lerp(joint.node.rotation[axis], rest + pointer[from] * amount, 0.1)
    })
  })

  return <primitive object={model} />
}
