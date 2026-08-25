import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

export default function Header() {
  const openNav = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    e.currentTarget.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: left + width / 2,
        clientY: top + height / 2,
      }),
    )
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4">
      <Link to="/" className="text-lg font-semibold text-neutral-900">
        BitN<em>Tech</em>
      </Link>
      <button
        type="button"
        onClick={openNav}
        aria-label="Open navigation"
        className="flex items-center justify-center size-10 rounded-full bg-neutral-100 text-neutral-700 shadow hover:bg-neutral-200"
      >
        <Menu size={18} />
      </button>
    </header>
  )
}
