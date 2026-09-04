/**
 * One source of truth for everything the site tells a crawler: the canonical
 * origin, the per-route metadata, and the structured data. `scripts/seo-build.ts`
 * reads this same file to emit sitemap.xml and to stamp static <head> tags into
 * one HTML file per route, so what a JS-less crawler (which is most AI answer
 * engines) reads and what React renders can never drift apart.
 */
export const SITE_URL = 'https://bitntech.in'
export const SITE_NAME = 'BitNTech'
export const OG_IMAGE = `${SITE_URL}/og-cover.png`

export type RouteSeo = {
  path: string
  title: string
  description: string
  keywords: string
  /** Routes that render the same page under a second URL point their canonical here. */
  canonical?: string
  /** Left out of the sitemap: duplicate URLs. */
  noSitemap?: boolean
  priority?: string
}

export const ROUTES: RouteSeo[] = [
  {
    path: '/',
    title: 'BitNTech — AI, Software & Robotics Engineering Company',
    description:
      'BitNTech is an engineering studio building AI systems, custom software, web and mobile apps, automation, IoT and robotics — from prototype to production.',
    keywords:
      'AI development company, custom software development, AI agents, robotics engineering, IoT development, embedded systems, automation, web and mobile app development, India',
    priority: '1.0',
  },
  {
    path: '/software',
    title: 'Software & AI Development Services | BitNTech',
    description:
      'Custom software, AI systems and agents, web and mobile apps, cloud and DevOps, data analytics and cybersecurity, built around how your organisation operates.',
    keywords:
      'custom software development, AI development services, AI agents, SaaS development, web app development, mobile app development, cloud and DevOps, data analytics, cybersecurity services',
    priority: '0.9',
  },
  {
    path: '/hardware',
    title: 'Robotics, IoT & Embedded Hardware Engineering | BitNTech',
    description:
      'Robotic systems, embedded firmware, IoT devices, sensor networks, PCB and circuit design — physical products taken from concept through prototype to manufacture.',
    keywords:
      'robotics development company, IoT product development, embedded systems engineering, PCB design, edge AI, industrial automation, sensor networks, hardware prototyping',
    priority: '0.9',
  },
  {
    path: '/about',
    title: 'About BitNTech — The Engineering Team Behind the Work',
    description:
      'Meet the seven-person BitNTech team: founders and engineers in AI, software, robotics and operations, and the story of how the studio came together.',
    keywords: 'about BitNTech, engineering team, AI startup India, founders, technology company',
    priority: '0.6',
  },
  {
    path: '/contact',
    title: 'Contact BitNTech — Start a Project',
    description:
      'Tell us what you are building. Reach BitNTech by email, phone or the project brief form and get a scoped reply on your AI, software, hardware or robotics idea.',
    keywords:
      'contact BitNTech, start a project, hire AI developers, software development quote, technology consultation',
    priority: '0.7',
  },
  {
    path: '/get-started',
    title: 'Start a Project with BitNTech',
    description:
      'Tell us what you are building. Reach BitNTech by email, phone or the project brief form and get a scoped reply on your AI, software, hardware or robotics idea.',
    keywords: 'start a project, contact BitNTech, software development quote',
    canonical: '/contact',
    noSitemap: true,
  },
]

export const routeSeo = (path: string): RouteSeo => ROUTES.find((r) => r.path === path) ?? ROUTES[0]

/* --- Structured data -----------------------------------------------------
   Organization and WebSite go on every page; the rest are page-specific.
   Answer engines read these even when they never execute a line of the app's
   JavaScript, which is most of the reason they exist. */

export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'BitNTech',
  alternateName: 'bitNtech',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: OG_IMAGE,
  description:
    'BitNTech is an engineering studio building AI systems, custom software, automation, IoT and robotics — from first prototype to production deployment.',
  email: 'support@bitntech.in',
  telephone: '+91-86102-37292',
  address: { '@type': 'PostalAddress', addressCountry: 'IN' },
  sameAs: [
    'https://linkedin.com/company/bitntech',
    'https://www.instagram.com/bitntech.in/',
    'https://github.com/BitNTechadmin',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-86102-37292',
      email: 'support@bitntech.in',
      contactType: 'sales',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Tamil'],
    },
  ],
  knowsAbout: [
    'Artificial Intelligence',
    'AI Agents',
    'Machine Learning',
    'Computer Vision',
    'Custom Software Engineering',
    'Web and Mobile Development',
    'Business Process Automation',
    'Robotics',
    'Embedded Systems',
    'Internet of Things',
    'Cloud and DevOps',
    'Data Analytics',
    'Cybersecurity',
  ],
}

export const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en',
}

/* The questions a person actually asks an answer engine about a studio like
   this, answered in full sentences that stand on their own out of context —
   which is the form an AI answer can quote. */
export const FAQ = [
  {
    q: 'What does BitNTech do?',
    a: 'BitNTech is an engineering studio that builds AI systems, custom software, web and mobile products, business automation, IoT devices and robotics. One team covers the whole stack, so hardware, firmware, software and AI are designed together rather than integrated after the fact.',
  },
  {
    q: 'What services does BitNTech offer?',
    a: 'Twelve service lines across two domains. Software: artificial intelligence, AI agents, software engineering, web and mobile, automation, cloud and DevOps, data and analytics, and cybersecurity. Hardware: robotics, embedded and IoT, electronics and hardware product development, and applied research.',
  },
  {
    q: 'Which industries does BitNTech build for?',
    a: 'Healthcare, agriculture, manufacturing, education, security, startups and small and medium businesses. The approach is sector-agnostic by design — the same engineering method is applied to whichever domain the problem lives in.',
  },
  {
    q: 'How much does a BitNTech project cost?',
    a: 'Pricing depends on scope. Send a project brief through the contact form with your budget range and timeline, and BitNTech replies with a scoped estimate rather than a fixed price list.',
  },
  {
    q: 'How does BitNTech run a project?',
    a: 'Five stages: Discover maps the problem and the people, Design gives every moving part a job, Engineer brings software, AI and hardware into one system, Test puts it into real conditions, and Deploy launches with the next version already in view.',
  },
  {
    q: 'How do I contact BitNTech?',
    a: 'Email support@bitntech.in, call +91 86102 37292, or submit a project brief at https://bitntech.in/contact. BitNTech is currently available for new projects.',
  },
  {
    q: 'Does BitNTech build both hardware and software?',
    a: 'Yes, and that combination is the point of the studio: robotics, embedded firmware and IoT hardware on one side, AI and software platforms on the other, built by one team so the two halves are designed against each other from the start.',
  },
]

export const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

/* What each domain page sells, in the vocabulary a search or answer engine
   indexes services by. Kept here rather than derived from `data/services.ts`
   so the build script can read it without pulling in the icon components. */
const OFFERINGS: Record<'software' | 'hardware', string[]> = {
  software: [
    'Artificial Intelligence',
    'AI Agents',
    'Software Engineering',
    'Web & Mobile Development',
    'Automation',
    'Cloud & DevOps',
    'Data & Analytics',
    'Cybersecurity',
  ],
  hardware: [
    'Robotics',
    'Embedded & IoT',
    'Electronics & Hardware',
    'Research & Innovation',
  ],
}

const serviceLd = (mode: 'software' | 'hardware', name: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/${mode}#service`,
  name,
  serviceType: name,
  provider: { '@id': `${SITE_URL}/#organization` },
  areaServed: 'Worldwide',
  description: routeSeo(`/${mode}`).description,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: `${name} — BitNTech`,
    itemListElement: OFFERINGS[mode].map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s },
    })),
  },
})

const breadcrumbLd = (path: string, name: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
    { '@type': 'ListItem', position: 2, name, item: SITE_URL + path },
  ],
})

/** Structured data specific to one route, on top of Organization + WebSite. */
export function pageLd(path: string): object[] {
  switch (path) {
    case '/':
      return [FAQ_LD]
    case '/software':
      return [serviceLd('software', 'Software & AI Development'), breadcrumbLd(path, 'Software')]
    case '/hardware':
      return [serviceLd('hardware', 'Robotics & Hardware Engineering'), breadcrumbLd(path, 'Hardware')]
    case '/about':
      return [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          url: `${SITE_URL}/about`,
          name: routeSeo('/about').title,
          description: routeSeo('/about').description,
          about: { '@id': `${SITE_URL}/#organization` },
        },
        breadcrumbLd(path, 'About'),
      ]
    case '/contact':
    case '/get-started':
      return [
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          url: `${SITE_URL}/contact`,
          name: routeSeo('/contact').title,
          description: routeSeo('/contact').description,
          mainEntity: { '@id': `${SITE_URL}/#organization` },
        },
        breadcrumbLd('/contact', 'Contact'),
      ]
    default:
      return []
  }
}
