import { Suspense, type MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import ErrorBoundary from '../ErrorBoundary'
import NilaModel from './NilaModel'
import type { NilaMood } from './nilaBrain'

type Props = {
  pointerRef: MutableRefObject<{ x: number; y: number }>
  mood: NilaMood
  waving?: boolean
  className?: string
}

/**
 * Nila's body. Kept deliberately small: one directional key light, one fill,
 * and a capped DPR — she is rendered up to three times on a page, so each
 * canvas has to stay cheap.
 */
export default function NilaScene({ pointerRef, mood, waving, className }: Props) {
  return (
    <div className={`nila-scene${className ? ' ' + className : ''}`} aria-hidden="true">
      <ErrorBoundary fallback={null}>
        <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.05, 2.6], fov: 32 }} gl={{ alpha: true, antialias: true }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[2.5, 3.5, 3]} intensity={2.4} color="#fff6ec" />
          <directionalLight position={[-3, -1, -2]} intensity={0.7} color="#9fd8ff" />
          <Suspense fallback={null}>
            <NilaModel pointerRef={pointerRef} mood={mood} waving={waving} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
