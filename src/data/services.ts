import {
  GlyphNeural, GlyphAgent, GlyphStack, GlyphSurface, GlyphGear, GlyphArm,
  GlyphChip, GlyphCircuit, GlyphCloud, GlyphChart, GlyphShield, GlyphCompass,
} from '../components/icons/Glyphs'

export const SERVICES = [
  {
    num: '01', Icon: GlyphNeural, title: 'Artificial Intelligence', body: 'Systems that decide, not just compute.',
    desc: 'Intelligent systems that automate decision-making and enhance productivity across the enterprise stack.',
    items: ['Custom AI applications', 'Machine Learning solutions', 'Deep Learning models', 'Computer Vision systems', 'Natural Language Processing', 'Speech Recognition', 'Recommendation Systems', 'Predictive Analytics', 'Generative AI', 'LLM Integration', 'AI Chatbots & Assistants', 'RAG Systems', 'AI Workflow Automation'],
    domain: 'software',
  },
  {
    num: '02', Icon: GlyphAgent, title: 'AI Agents', body: 'Autonomy with accountability.',
    desc: 'Agents that understand, reason, and execute tasks independently — with human oversight where it matters.',
    items: ['Customer Support Agents', 'Sales Agents', 'HR Assistants', 'Healthcare Assistants', 'Research Agents', 'Coding Assistants', 'Voice Agents', 'Multi-Agent Systems', 'Autonomous Decision Systems', 'Business Intelligence Agents'],
    domain: 'software',
  },
  {
    num: '03', Icon: GlyphStack, title: 'Software Engineering', body: 'Secure, scalable, tailored.',
    desc: 'High-performance platforms engineered around the way an organisation actually operates.',
    items: ['Enterprise Software', 'SaaS Platforms', 'CRM & ERP Systems', 'Inventory Management', 'Hospital Management', 'School Management', 'Financial Applications', 'POS Systems', 'HRMS', 'Custom Dashboards', 'Admin Panels & Portals', 'Desktop Applications'],
    domain: 'software',
  },
  {
    num: '04', Icon: GlyphSurface, title: 'Web & Mobile', body: 'Every surface, one system.',
    desc: 'Responsive web platforms and native or cross-platform mobile products built on shared architecture.',
    items: ['Corporate Websites', 'E-Commerce Platforms', 'Progressive Web Apps', 'Booking & Marketplace Platforms', 'CMS & API Development', 'Android · iOS', 'Flutter · React Native', 'Healthcare & FinTech Apps', 'Educational Apps', 'Delivery Platforms', 'IoT Control Apps'],
    domain: 'software',
  },
  {
    num: '05', Icon: GlyphGear, title: 'Automation', body: 'Remove the repeat.',
    desc: 'Process, workflow and industrial automation that compounds operational efficiency month over month.',
    items: ['Business Process Automation', 'Workflow Automation', 'Robotic Process Automation', 'AI Automation', 'Industrial Automation', 'Smart Office Automation', 'Manufacturing Automation', 'Document Processing', 'Email & CRM Automation'],
    domain: 'software',
  },
  {
    num: '06', Icon: GlyphArm, title: 'Robotics', body: 'Machines with judgement.',
    desc: 'Intelligent robotic systems for industry, education, healthcare and research — from arm to fleet.',
    items: ['Autonomous Robots', 'Industrial Robots', 'Service Robots', 'Educational Robotics', 'Mobile Robots', 'Robotic Arms', 'Warehouse Automation', 'Drone Systems', 'Agricultural Robots', 'Healthcare Robotics', 'Human-Robot Interaction'],
    domain: 'hardware',
  },
  {
    num: '07', Icon: GlyphChip, title: 'Embedded & IoT', body: 'Where software meets silicon.',
    desc: 'Connected devices in which firmware, sensing and cloud behave as a single designed product.',
    items: ['IoT Products', 'Smart Devices', 'Edge AI Systems', 'Embedded Firmware', 'Sensor Networks', 'Industrial IoT', 'Home Automation', 'Smart Agriculture', 'Smart Energy Systems'],
    domain: 'hardware',
  },
  {
    num: '08', Icon: GlyphCircuit, title: 'Electronics & Hardware', body: 'Concept to production.',
    desc: 'Complete hardware product development, prototyped fast and engineered for manufacture.',
    items: ['PCB Design', 'Circuit Design', 'Prototype Development', 'Product Engineering', 'Device Testing', 'Embedded Programming', 'FPGA Solutions', 'Power Electronics', 'Wireless Communication Devices'],
    domain: 'hardware',
  },
  {
    num: '09', Icon: GlyphCloud, title: 'Cloud & DevOps', body: 'Infrastructure that stays up.',
    desc: 'Cloud-native foundations with automated delivery, observability and high availability by default.',
    items: ['Cloud Migration', 'AWS · Azure · GCP', 'Docker · Kubernetes', 'CI/CD Pipelines', 'Infrastructure Automation', 'Monitoring', 'High Availability Systems'],
    domain: 'software',
  },
  {
    num: '10', Icon: GlyphChart, title: 'Data & Analytics', body: 'Decisions, evidenced.',
    desc: 'Pipelines, warehouses and visual intelligence that turn raw operational exhaust into direction.',
    items: ['Data Warehousing', 'Data Pipelines', 'ETL Solutions', 'Big Data Processing', 'Dashboard Development', 'BI Solutions', 'Data Visualization'],
    domain: 'software',
  },
  {
    num: '11', Icon: GlyphShield, title: 'Cybersecurity', body: 'Assume adversaries.',
    desc: 'Security built into the system, not bolted on — audited, monitored and continuously hardened.',
    items: ['Penetration Testing', 'Vulnerability Assessment', 'Security Audits', 'SOC Monitoring', 'Threat Intelligence', 'Cloud Security', 'Application Security', 'Incident Response', 'Identity & Access Management'],
    domain: 'software',
  },
  {
    num: '12', Icon: GlyphCompass, title: 'Research & Innovation', body: 'Writing the next chapter.',
    desc: 'Continuous internal research programmes that seed the products we ship two years from now.',
    items: ['Artificial Intelligence', 'Computer Vision', 'Smart Manufacturing', 'Future Mobility', 'Robotics', 'Human-Computer Interaction', 'Digital Twins', 'Autonomous Systems', 'Edge Computing', 'Industry 4.0'],
    domain: 'hardware',
  },
] as const
