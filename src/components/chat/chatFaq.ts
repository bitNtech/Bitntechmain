/* Explicit extension: this module is imported by scripts/test-chat-faq.ts,
   which runs under node's ESM resolver rather than Vite's. */
import { CONTACT } from '../../contact.ts'

export type FaqReply = { answer: string; mood: string }

type FaqEntry = { keywords: string[]; answer: string; mood?: string }

const FAQ: FaqEntry[] = [
  { keywords: ['hi', 'hello', 'hey'], answer: "Hii! I'm Nila. Ask me about our services, pricing, careers, or how to reach the team.", mood: 'happy' },
  { keywords: ['service', 'offer', 'what do you do', 'what can you'], answer: 'We build AI systems, AI agents, software, web & mobile apps, automation, and robotics — see the Home page for the full lineup.', mood: 'happy' },
  { keywords: ['price', 'cost', 'pricing', 'budget', 'quote'], answer: "Pricing depends on scope. Tell us about your project on the Contact page and we'll get back with a quote.", mood: 'watching' },
  { keywords: ['contact', 'email', 'phone', 'reach', 'call'], answer: `You can reach us at ${CONTACT.email} or ${CONTACT.phone}, or use the form on the Contact page.`, mood: 'watching' },
  { keywords: ['career', 'job', 'hiring', 'join', 'work with you'], answer: "We're always scouting talent. Head to the Contact page and pick \"Careers\" as your reason.", mood: 'excited' },
  { keywords: ['team', 'who are you', 'about', 'founder'], answer: "We're an 8-person crew of AI, software and robotics builders — see the About page to meet everyone.", mood: 'happy' },
  { keywords: ['thank'], answer: 'Anytime! 🩵', mood: 'happy' },
]

const FALLBACK: FaqReply = { answer: `Hmm, not sure about that one. Email ${CONTACT.email} and a human will help.`, mood: 'watching' }

function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)
}

export function matchFaq(input: string): FaqReply {
  const q = input.toLowerCase()
  for (const entry of FAQ) {
    if (entry.keywords.some((k) => hasWord(q, k))) return { answer: entry.answer, mood: entry.mood ?? 'happy' }
  }
  return FALLBACK
}
