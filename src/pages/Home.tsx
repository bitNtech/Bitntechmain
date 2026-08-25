import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  GlyphNeural,
  GlyphAgent,
  GlyphStack,
  GlyphSurface,
  GlyphGear,
  GlyphArm,
} from '../components/icons/Glyphs'
import './Home.css'

const SERVICES = [
  { num: '01', Icon: GlyphNeural, title: 'Artificial Intelligence', body: 'Systems that decide, not just compute' },
  { num: '02', Icon: GlyphAgent, title: 'AI Agents', body: 'Autonomy with accountability' },
  { num: '03', Icon: GlyphStack, title: 'Software Engineering', body: 'Secure, scalable, tailored' },
  { num: '04', Icon: GlyphSurface, title: 'Web & Mobile', body: 'Every surface, one system' },
  { num: '05', Icon: GlyphGear, title: 'Automation', body: 'Remove the repeat' },
  { num: '06', Icon: GlyphArm, title: 'Robotics', body: 'Machines with judgement' },
] as const

const JOURNEY = [
  { num: '01', title: 'Discover', body: 'Understand the problem, the user, and the goal before a single line of code or a single part is drawn.' },
  { num: '02', title: 'Design', body: 'Define the product, the architecture and the experience — software, hardware, or both.' },
  { num: '03', title: 'Engineer', body: 'Build the software, AI, hardware or integrated system, with the right tool for each layer.' },
  { num: '04', title: 'Test', body: 'Validate against real conditions, iterate on what breaks, and improve what works.' },
  { num: '05', title: 'Deploy', body: 'Deliver a usable solution and prepare it for the growth that comes after launch.' },
] as const

const INDUSTRIES = [
  { title: 'Healthcare', body: 'Digital platforms, monitoring and intelligent systems.' },
  { title: 'Agriculture', body: 'Smart farming, crop monitoring, agricultural robotics and IoT.' },
  { title: 'Manufacturing', body: 'Automation, robotics, embedded systems and Industry 4.0 solutions.' },
  { title: 'Education', body: 'Academic technology, engineering prototypes and research projects.' },
  { title: 'Startups', body: 'MVPs, prototypes, websites, software and AI products.' },
  { title: 'SMBs', body: 'Business websites, automation, software and digital transformation.' },
  { title: 'Security', body: 'Surveillance, computer vision and intelligent monitoring.' },
] as const

const WHY = [
  { title: 'Engineering First', body: 'We understand the technology underneath the interface.' },
  { title: 'Built Around You', body: 'Solutions are designed around the actual problem instead of forcing a fixed package.' },
  { title: 'Software + Hardware', body: 'One technology partner across digital products, AI, embedded systems and robotics.' },
  { title: 'Experimentation', body: 'Prototypes turn uncertain ideas into something testable and real.' },
  { title: 'Future Ready', body: 'Build for today’s needs without losing sight of tomorrow.' },
] as const

const TECH_GROUPS = [
  { title: 'Software', items: ['Python', 'JavaScript / TypeScript', 'React', 'Next.js', 'Node.js', 'Flask', 'FastAPI'] },
  { title: 'AI', items: ['Computer Vision', 'YOLO', 'OpenCV', 'Machine Learning', 'Generative AI', 'Intelligent Assistants'] },
  { title: 'Hardware', items: ['ESP32', 'Arduino', 'Raspberry Pi', 'Sensors', 'Motor Drivers', 'Embedded Platforms'] },
  { title: 'Robotics', items: ['Robotic Arms', 'Autonomous Systems', 'MediaPipe', 'Webots', 'Control Systems', 'Custom Mechanisms'] },
] as const

export default function Home() {
  const heroVideoRef = useRef<HTMLVideoElement>(null)

  return (
    <>
      <section className="hero">
        <video
          ref={heroVideoRef}
          className="hero-video"
          src="/assets/transparent.webm"
          muted
          loop
          playsInline
        />
        <div className="hero-copy">
          <p className="hero-eyebrow">Engineering the Next Evolution</p>
          <h1 className="hero-headline">Technology That Evolves With You.</h1>
          <p className="hero-sub">
            We design, engineer and build intelligent digital and physical solutions for businesses, startups and innovators.
          </p>
          <div className="hero-cta-row">
            <Link
              className="hero-cta hero-cta--primary"
              to="/contact"
              onClick={() => heroVideoRef.current?.play()}
            >
              Start a Project
            </Link>
          </div>
        </div>
        <div className="melt" aria-hidden="true" />
      </section>

      <section className="value-statement">
        <h2>We build what comes next.</h2>
        <p>
          bitNtech turns real-world problems and ideas into practical technology — from websites and software
          platforms to AI systems, robotics, IoT and custom engineering prototypes.
        </p>
        <div className="value-keywords">
          <span>Imagine.</span>
          <span>Engineer.</span>
          <span>Evolve.</span>
        </div>
      </section>

      <section className="vision-mission">
        <div className="vm-card">
          <h3>Vision</h3>
          <p>A global leader in intelligent technology.</p>
          <p>Innovation that empowers businesses and improves everyday life.</p>
        </div>
        <div className="vm-card">
          <h3>Mission</h3>
          <p>Cutting-edge products, reliably delivered.</p>
          <p>AI, robotics, embedded systems and cloud, combined into solutions that scale.</p>
        </div>
      </section>

      <section className="section-intro">
        <h2>What we do</h2>
        <p>
          Digital engineering, AI and intelligent systems, robotics and automation, embedded and IoT hardware, and
          the R&amp;D that turns an early concept into a working prototype — one technology partner across every layer.
        </p>
      </section>

      <section className="services-grid" id="solutions">
        {SERVICES.map((s) => (
          <div className="service-cell" key={s.num}>
            <div className="service-content">
              <div className="service-top">
                <s.Icon size={40} />
                <span className="service-num">{s.num}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="journey">
        <h2>How we build</h2>
        <ol className="journey-list">
          {JOURNEY.map((j) => (
            <li key={j.num} className="journey-step">
              <span className="journey-num">{j.num}</span>
              <div>
                <h3>{j.title}</h3>
                <p>{j.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="industries" id="industries">
        <h2>Who we build for</h2>
        <div className="industries-grid">
          {INDUSTRIES.map((i) => (
            <div className="industry-card" key={i.title}>
              <h3>{i.title}</h3>
              <p>{i.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="why-us">
        <h2>Why bitNtech</h2>
        <div className="why-grid">
          {WHY.map((w) => (
            <div className="why-card" key={w.title}>
              <h3>{w.title}</h3>
              <p>{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tech-stack">
        <h2>Technology</h2>
        <div className="tech-groups">
          {TECH_GROUPS.map((g) => (
            <div className="tech-group" key={g.title}>
              <h3>{g.title}</h3>
              <div className="tech-chips">
                {g.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </>
  )
}
