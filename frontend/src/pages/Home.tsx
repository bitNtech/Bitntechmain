import { useEffect, useRef } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  useScrollAnimation('.tag, h1, h2, .body-text, .stat-row, .cta, .cta-back, .h-line')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        '.rocket-lottie',
        {
          y: 0,
          opacity: 1,
        },
        {
          y: '-80vh',
          opacity: 0,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: '#s0',
            start: 'top top-=150',
            end: 'bottom top',
            scrub: 1,
          },
        }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <>
      <section className="hero">
        <video
          className="hero-video"
          src="/assets/transparent.webm"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="melt" aria-hidden="true" />
      </section>

      <div className="story-section" ref={rootRef}>
        <div id="scroll_container">
          <section id="s0" className="scroll-section">
            <div className="text-card">
              <div className="tag">01 — Artificial Intelligence</div>
              <h1>ARTIFICIAL<br/>INTELLIGENCE</h1>
              <p className="body-text">
                Systems that decide, not just compute
              </p>
              <div className="cta-row">
                <a className="cta" href="#">
                  Explore
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M1 6h10M6 1l5 5-5 5" />
                  </svg>
                </a>
              </div>
            </div>

            <DotLottieReact
              className="rocket-lottie"
              src="/assets/rocket.lottie"
              loop
              autoplay
            />
          </section>

          <section id="s1" className="scroll-section">
            <div className="text-card right">
              <div className="h-line"></div>
              <div className="tag">02 — AI Agents</div>
              <h2>AI<br/>AGENTS</h2>
              <p className="body-text">
                Autonomy with accountability
              </p>
              <div className="cta-row">
                <a className="cta" href="#">
                  Explore
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M1 6h10M6 1l5 5-5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          <section id="s2" className="scroll-section">
            <div className="text-card">
              <div className="h-line"></div>
              <div className="tag">03 — Software Engineering</div>
              <h2>SOFTWARE<br/>ENGINEERING</h2>
              <p className="body-text">
                Secure, scalable, tailored
              </p>
              <div className="cta-row">
                <a className="cta" href="#">
                  Explore
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M1 6h10M6 1l5 5-5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          <section id="s3" className="scroll-section">
            <div className="text-card right">
              <div className="h-line"></div>
              <div className="tag">04 — Web & Mobile</div>
              <h2>WEB &<br/>MOBILE</h2>
              <p className="body-text">
                Every surface, one system
              </p>
              <div className="cta-row">
                <a className="cta" href="#">
                  Explore
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M1 6h10M6 1l5 5-5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          <section id="s4" className="scroll-section">
            <div className="text-card">
              <div className="h-line"></div>
              <div className="tag">05 — Automation</div>
              <h2>AUTOMATION</h2>
              <p className="body-text">
                Remove the repeat
              </p>
              <div className="cta-row">
                <a className="cta" href="#">
                  Explore
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M1 6h10M6 1l5 5-5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          <section id="s5" className="scroll-section">
            <div className="text-card right">
              <div className="h-line"></div>
              <div className="tag">06 — Robotics</div>
              <h2>ROBOTICS</h2>
              <p className="body-text">
                Machines with judgement
              </p>
              <div className="cta-row">
                <a className="cta" href="#">
                  Explore
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M1 6h10M6 1l5 5-5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
