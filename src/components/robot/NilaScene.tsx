import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import ErrorBoundary from '../ErrorBoundary'
import NilaModel from './NilaModel'
import type { NilaModelProps } from './NilaModel'

type Props = NilaModelProps & { className?: string }

/**
 * Nila's body. Kept deliberately small: one directional key light, one fill,
 * and a capped DPR — she is rendered up to three times on a page, so each
 * canvas has to stay cheap.
 */
export default function NilaScene({ className, ...model }: Props) {
  /* On a phone she is a 56px puck: a 3x device pixel ratio and MSAA on top of
     that is a lot of fragments for something the size of a thumbnail, and it
     is the GPU cost you feel as battery. Half the resolution, no antialiasing,
     and at that size nothing about her looks any different. */
  const small = typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches

  return (
    <div className={`nila-scene${className ? ' ' + className : ''}`} aria-hidden="true">
      <ErrorBoundary fallback={null}>
        <Canvas
          dpr={small ? [1, 1.4] : [1, 1.6]}
          camera={{ position: [0, 0.05, 2.6], fov: 32 }}
          gl={{ alpha: true, antialias: !small, powerPreference: 'low-power' }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[2.5, 3.5, 3]} intensity={2.4} color="#fff6ec" />
          <directionalLight position={[-3, -1, -2]} intensity={0.7} color="#9fd8ff" />
          <Suspense fallback={null}>
            <NilaModel {...model} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
