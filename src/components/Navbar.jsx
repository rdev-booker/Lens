import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Shop',           to: '/shop'        },
  { label: 'Philosophy',     to: '/philosophy'  },
  { label: 'The Experience', to: '/experience'  },
  { label: 'Contact',        to: '/contact'     },
]

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const location = useLocation()

  // Collapse mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Detect scroll to switch nav background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-600',
        scrolled
          ? 'bg-obsidian/95 backdrop-blur-md border-b border-champagne/10 py-3'
          : 'bg-transparent py-5',
      ].join(' ')}
    >
      <nav className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex flex-col items-start gap-0 group shrink-0"
          aria-label="The Lens Atelier — Home"
        >
          {/* Wordmark */}
          <span className="font-display text-[1.45rem] font-light tracking-[0.18em] text-pearl leading-none
                           group-hover:text-champagne transition-colors duration-400">
            THE LENS
          </span>
          <span className="font-mono text-[0.52rem] tracking-widest3 text-champagne uppercase leading-none mt-0.5">
            ATELIER
          </span>
        </Link>

        {/* ── Desktop links ── */}
        <ul className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => [
                  'font-sans text-[0.72rem] tracking-widest2 uppercase',
                  'relative pb-0.5 transition-colors duration-300',
                  'after:absolute after:inset-x-0 after:bottom-0 after:h-px',
                  'after:bg-champagne after:origin-left after:scale-x-0',
                  'after:transition-transform after:duration-300 hover:after:scale-x-100',
                  isActive
                    ? 'text-champagne after:scale-x-100'
                    : 'text-silver hover:text-pearl',
                ].join(' ')}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Book Appointment CTA ── */}
        <div className="hidden lg:flex items-center">
          <Link
            to="/contact"
            className="relative inline-flex items-center px-6 py-2.5
                       font-sans text-[0.68rem] tracking-widest2 uppercase
                       border border-champagne text-champagne
                       overflow-hidden group transition-colors duration-400"
          >
            {/* Fill sweep on hover */}
            <span
              className="absolute inset-0 bg-champagne translate-x-[-101%]
                         group-hover:translate-x-0 transition-transform duration-400 ease-luxury"
            />
            <span className="relative group-hover:text-obsidian transition-colors duration-400">
              Book Appointment
            </span>
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={[
            'block w-6 h-px bg-pearl transition-all duration-300',
            menuOpen ? 'rotate-45 translate-y-[5px]' : '',
          ].join(' ')} />
          <span className={[
            'block w-6 h-px bg-pearl transition-all duration-300',
            menuOpen ? 'opacity-0 w-0' : '',
          ].join(' ')} />
          <span className={[
            'block w-6 h-px bg-pearl transition-all duration-300',
            menuOpen ? '-rotate-45 -translate-y-[5px]' : '',
          ].join(' ')} />
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className={[
          'lg:hidden fixed inset-x-0 top-[56px] bg-obsidian/98 backdrop-blur-xl',
          'border-t border-champagne/10 transition-all duration-400 overflow-hidden',
          menuOpen ? 'max-h-screen py-8' : 'max-h-0 py-0',
        ].join(' ')}
      >
        <ul className="flex flex-col items-center gap-8 px-6">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `font-sans text-sm tracking-widest2 uppercase transition-colors duration-300 ${
                    isActive ? 'text-champagne' : 'text-silver hover:text-pearl'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li className="pt-2">
            <Link
              to="/contact"
              className="inline-block px-8 py-3 border border-champagne
                         text-champagne font-sans text-xs tracking-widest2 uppercase
                         hover:bg-champagne hover:text-obsidian transition-all duration-400"
            >
              Book Appointment
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
