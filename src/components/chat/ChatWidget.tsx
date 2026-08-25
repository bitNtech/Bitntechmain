import { useEffect, useRef, useState } from 'react'
import { matchFaq } from './chatFaq'
import './ChatWidget.css'

type Message = { from: 'bot' | 'user'; text: string }

const GREETING = "Hi. I'm Nila. Ask me about our services, pricing, careers, or the team!"

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [blink, setBlink] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlink(true)
      window.setTimeout(() => setBlink(false), 150)
    }, 2600 + Math.random() * 2600)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: 'bot', text: GREETING }])
      setMood('happy')
    }
  }, [open, messages.length])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [messages])

  const toggle = () => setOpen((o) => !o)

  const onSend = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    setMood('watching')
    setMessages((m) => [...m, { from: 'user', text }])

    window.setTimeout(() => {
      const reply = matchFaq(text)
      setMood(reply.mood)
      setMessages((m) => [...m, { from: 'bot', text: reply.answer }])
    }, 380)
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-widget__panel" role="dialog" aria-label="Chat with Nila">
          <div className="chat-widget__panel-head">
            <span>Nila</span>
            <button type="button" onClick={toggle} aria-label="Close chat">×</button>
          </div>
          <div className="chat-widget__log" ref={logRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-widget__msg chat-widget__msg--${m.from}`}>{m.text}</div>
            ))}
          </div>
          <form className="chat-widget__form" onSubmit={onSend}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              aria-label="Message"
              autoComplete="off"
            />
            <button type="submit" aria-label="Send">➤</button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-widget__toggle"
        onClick={toggle}
        aria-label={open ? 'Close chat' : 'Chat with Nila'}
        data-mood={mood}
      >
        <div className="chat-widget__head">
          <span className="chat-widget__ear chat-widget__ear--l" />
          <span className="chat-widget__ear chat-widget__ear--r" />
          <div className="chat-widget__face">
            <div className="chat-widget__visor">
              <div className={`chat-widget__eyes${blink ? ' is-blink' : ''}`}>
                <span className="chat-widget__eye chat-widget__eye--l" />
                <span className="chat-widget__eye chat-widget__eye--r" />
              </div>
              <span className="chat-widget__cheek chat-widget__cheek--l" />
              <span className="chat-widget__cheek chat-widget__cheek--r" />
              <span className="chat-widget__mouth" />
            </div>
          </div>
        </div>
        {!open && <span className="chat-widget__ping" aria-hidden="true" />}
      </button>
    </div>
  )
}
