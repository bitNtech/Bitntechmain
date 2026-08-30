import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Box3, MathUtils, Vector3 } from 'three'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'

type MaterialStyle = {
  color: string
  emissive?: string
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
}

const DESK_WIDTH = 4.6

function materialStyleFor(name: string): MaterialStyle {
  if (name === 'ellipse') return { color: '#171b20', metalness: 0.52, roughness: 0.3 }
  if (name === 'screen') return { color: '#111825', emissive: '#063d46', emissiveIntensity: 0.45, metalness: 0.2, roughness: 0.24 }
  if (name === 'cube_68' || name === 'sphere') return { color: '#55f5de', emissive: '#24f6d7', emissiveIntensity: 2.2, metalness: 0.05, roughness: 0.2 }
  if (name.includes('leaf') || name === 'cactus') return { color: '#4fa44a', metalness: 0, roughness: 0.72 }
  if (name.includes('petal')) return { color: '#ef5d85', metalness: 0, roughness: 0.52 }
  if (name === 'basket') return { color: '#9b673f', metalness: 0.05, roughness: 0.68 }
  if (name.includes('coffee') || name.includes('paper_cup')) return { color: '#f28b2a', metalness: 0.03, roughness: 0.5 }
  if (name.includes('lower_arm') || name.includes('upper_arm') || name.includes('center_hinge') || name.includes('head_attachment') || name.includes('switch1') || name === 'grip' || name.includes('bolt') || name === 'shade' || name === 'base_2' || name === 'stack_1') return { color: '#f47721', metalness: 0.12, roughness: 0.42 }
  if (name.startsWith('cover')) return { color: '#1c3134', metalness: 0.18, roughness: 0.42 }
  if (name.includes('pages') || name === 'paper') return { color: '#f7f3e8', metalness: 0, roughness: 0.8 }
  if (name.includes('eraser')) return { color: '#f39ab4', metalness: 0, roughness: 0.7 }
  if (name === 'graphite' || name === 'metal') return { color: '#4d5559', metalness: 0.65, roughness: 0.34 }
  if (name === 'tip' || name === 'body') return { color: '#f6bc2d', metalness: 0.08, roughness: 0.46 }
  if (name.startsWith('ring')) return { color: '#ffaf33', metalness: 0.18, roughness: 0.4 }
  if (name === 'mouse' || name.startsWith('path')) return { color: '#e8f1ed', metalness: 0.15, roughness: 0.38 }
  return { color: '#f1f0e8', metalness: 0.12, roughness: 0.44 }
}

function colorizeWorkspace(model: THREE.Object3D) {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    const style = materialStyleFor(object.name.toLowerCase())
    const decorate = (source: THREE.Material) => {
      const material = source.clone() as THREE.MeshStandardMaterial
      material.color.set(style.color)
      material.metalness = style.metalness ?? 0.08
      material.roughness = style.roughness ?? 0.5
      material.emissive.set(style.emissive ?? '#000000')
      material.emissiveIntensity = style.emissiveIntensity ?? 0
      return material
    }

    object.material = Array.isArray(object.material)
      ? object.material.map(decorate)
      : decorate(object.material)
  })
}

function ComputerFace() {
  return (
    <group position={[0.06, 0.2, -0.1]}>
      <mesh position={[-0.1, 0.025, 0]}>
        <capsuleGeometry args={[0.025, 0.065, 6, 12]} />
        <meshStandardMaterial color="#55f5de" emissive="#24f6d7" emissiveIntensity={2.6} toneMapped={false} />
      </mesh>
      <mesh position={[0.1, 0.025, 0]}>
        <capsuleGeometry args={[0.025, 0.065, 6, 12]} />
        <meshStandardMaterial color="#55f5de" emissive="#24f6d7" emissiveIntensity={2.6} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.065, 0.002]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.052, 0.008, 6, 18, Math.PI * 0.86]} />
        <meshStandardMaterial color="#55f5de" emissive="#24f6d7" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function CuteComputerModel({ pointerRef }: { pointerRef: MutableRefObject<{ x: number; y: number }> }) {
  const { scene } = useGLTF('/assets/cute_computer_follow_cursor.glb')
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  const model = useMemo(() => {
    const clone = scene.clone(true)

    // The export includes a huge invisible backdrop mesh. Remove it before
    // measuring so the desk—not that backdrop—is framed in the hero.
    clone.getObjectByName('Backdrop')?.removeFromParent()
    colorizeWorkspace(clone)

    clone.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(clone)
    const size = bounds.getSize(new Vector3())
    const center = bounds.getCenter(new Vector3())
    const scale = DESK_WIDTH / Math.max(size.x, size.z)

    clone.scale.setScalar(scale)
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    return clone
  }, [scene])

  useEffect(() => {
    camera.position.set(4.9, 3.8, 6.2)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  useFrame(() => {
    if (!groupRef.current) return
    const pointer = pointerRef.current
    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.12, 0.06)
    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.05, 0.06)
  })

  return (
    <group ref={groupRef}>
      <primitive object={model} />
      <ComputerFace />
    </group>
  )
}
