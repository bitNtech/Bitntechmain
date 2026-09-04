import { Suspense } from 'react'
import { Bounds } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import RobotArmModel from './RobotArmModel'
import CuteComputerModel from './InteractiveWorkspaceModel'
import ErrorBoundary from '../ErrorBoundary'

/**
 * Everything WebGL on the hardware and software heroes, in one module so it is
 * one dynamically imported chunk: three.js, drei and the GLB loaders leave the
 * page's own chunk entirely and are fetched only for a visit that will show
 * them (see `canAffordHeavyMedia`).
 *
 * ponytail: the models themselves are unquantised float32 geometry —
 * cute_computer_follow_cursor.glb alone is 17 MB with no textures in it. Run
 * them through `gltf-transform optimize --compress draco` if the download
 * matters more than keeping the toolchain dependency-free; deferring the fetch
 * is what is done here instead.
 */
type Props = {
  mode: 'hardware' | 'software'
  pointerRef: React.MutableRefObject<{ x: number; y: number }>
}

const ARM_FACING = Math.PI

export default function HeroModels({ mode, pointerRef }: Props) {
  return (
    <ErrorBoundary fallback={null}>
      {mode === 'hardware' ? (
        // Capped DPR: phones report 3x and would render 9x the pixels for a
        // decorative model, which is where the scroll jank comes from.
        <Canvas dpr={[1, 1.6]} camera={{ position: [2.5, 1.8, 3.5], fov: 40 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 2]} intensity={1.6} />
          <directionalLight position={[-4, -2, -3]} intensity={0.4} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.5}>
              <group rotation-y={ARM_FACING}>
                <RobotArmModel pointerRef={pointerRef} />
              </group>
            </Bounds>
          </Suspense>
        </Canvas>
      ) : (
        <Canvas dpr={[1, 1.6]} camera={{ position: [4, 3, 6], fov: 40 }}>
          <ambientLight intensity={2} />
          <directionalLight position={[4, 8, 4]} intensity={3} color="#fff5e6" />
          <directionalLight position={[-5, 3, -2]} intensity={1.2} color="#8ce5ff" />
          <pointLight position={[0, 2, -3]} intensity={1.5} color="#ab8cff" />
          <hemisphereLight args={['#ffffff', '#2a1a3a', 1.5]} />
          <Suspense fallback={null}>
            <CuteComputerModel pointerRef={pointerRef} />
          </Suspense>
        </Canvas>
      )}
    </ErrorBoundary>
  )
}
