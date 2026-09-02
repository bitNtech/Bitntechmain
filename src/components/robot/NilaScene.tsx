import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import ErrorBoundary from '../ErrorBoundary'
import NilaModel from './NilaModel'
import type { NilaModelProps } from './NilaModel'

type Props = NilaModelProps & { className?: string; fit?: 'body' | 'head' | 'hero' }

/* Two framings of the same model.
 *
 * 'head' is the hero: cropped to the top of her head down to just below the
 * eyes, so she reads as peeking over the bottom of the section. The numbers
 * come from the prepared model, which normalises to one unit tall — her head
 * runs y -0.03..0.50 and her eyes 0.19..0.29, so showing 0.17..0.50 is the
 * crop, and the camera is aimed at the middle of it. A long lens on purpose:
 * up close a wide one bulges the front of her face.
 *
 * The crop is the camera's, not a CSS clip, so nothing below the eyeline is
 * ever rasterised. Its container has to keep the matching aspect ratio or the
 * head runs past the sides — 0.33 tall by 1.95 is the shape being framed.
 */
const FRAME = {
  body: { position: [0, 0.05, 2.6] as const, fov: 32, aim: 0 },
  /* `aim` shifts the model, rather than raising the camera. A camera moved up
     the y axis gets pointed back at the scene origin, so it tilts down instead
     of panning up and the crop lands on her mouth. Sliding the model down by
     the same amount frames it with no ambiguity about where the lens looks. */
  head: { position: [0, 0, 1.25] as const, fov: 15, aim: 0.335 },
  /* The hero: the whole of her, arms included, because she waves there. She
     stands on the bottom edge of her container, which is a ruled line, so the
     framing is solved rather than eyeballed: the model is one unit tall and
     centred, so shifting it down by `aim` puts its base at the bottom of the
     frame when the half-height is 0.5 + aim, and leaves 2 x aim of headroom
     over the raised hand. 0.075 up top, and 0.575 / tan(13°) back. */
  hero: { position: [0, 0, 2.49] as const, fov: 26, aim: 0.075 },
}

/**
 * Nila's body. Kept deliberately small: one directional key light, one fill,
 * and a capped DPR — she is rendered up to three times on a page, so each
 * canvas has to stay cheap.
 */
export default function NilaScene({ className, fit = 'body', ...model }: Props) {
  const frame = FRAME[fit]
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
          camera={{ position: [...frame.position], fov: frame.fov }}
          gl={{ alpha: true, antialias: !small, powerPreference: 'low-power' }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[2.5, 3.5, 3]} intensity={2.4} color="#fff6ec" />
          <directionalLight position={[-3, -1, -2]} intensity={0.7} color="#9fd8ff" />
          <Suspense fallback={null}>
            <group position={[0, -frame.aim, 0]}>
              <NilaModel {...model} />
            </group>
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
