import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const NAV = [
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/tints',    label: 'Tints'    },
  { to: '/admin/orders',   label: 'Orders'   },
]

/**
 * Shared chrome for all admin pages.
 * Renders a sticky left sidebar on desktop and a horizontal strip on mobile.
 *
 * Props:
 *   title    — large heading
 *   eyebrow  — small label above heading (defaults to "Admin")
 *   action   — optional React node rendered top-right of the header (e.g. a CTA button)
 *   children — page content
 */
export default function AdminLayout({ title, eyebrow = 'Admin', action, children }) {
  const navigate = useNavigate()

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="bg-obsidian min-h-screen flex pt-20">

      {/* ══════════════════════════════
          Desktop sidebar
      ══════════════════════════════ */}
      <aside className="hidden lg:flex w-52 shrink-0 border-r border-champagne/10 flex-col
                        sticky top-20 self-start h-[calc(100vh-5rem)]">

        {/* Brand mark */}
        <div className="px-6 py-7 border-b border-champagne/10">
          <p className="font-mono text-[0.42rem] tracking-widest3 uppercase text-champagne/70 leading-loose">
            The Lens Atelier
          </p>
          <p className="font-mono text-[0.4rem] tracking-widest2 uppercase text-smoke/35">
            Admin Console
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-0.5">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                'flex items-center px-3 py-2.5 transition-colors duration-200 ' +
                'font-mono text-[0.48rem] tracking-widest2 uppercase border-l ' +
                (isActive
                  ? 'text-champagne bg-champagne/[0.07] border-champagne pl-[11px]'
                  : 'text-smoke/45 hover:text-silver hover:bg-white/[0.025] border-transparent')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-6 py-5 border-t border-champagne/10">
          <button
            onClick={signOut}
            className="font-mono text-[0.44rem] tracking-widest2 uppercase
                       text-smoke/35 hover:text-smoke transition-colors duration-300"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════
          Content column
      ══════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile nav strip */}
        <div className="lg:hidden flex items-center border-b border-champagne/10 overflow-x-auto">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                'shrink-0 px-5 py-3.5 font-mono text-[0.46rem] tracking-widest2 uppercase ' +
                'border-b-2 transition-colors duration-200 ' +
                (isActive
                  ? 'text-champagne border-champagne'
                  : 'text-smoke/45 border-transparent hover:text-silver')
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={signOut}
            className="shrink-0 ml-auto px-5 font-mono text-[0.44rem] tracking-widest2
                       uppercase text-smoke/35 hover:text-smoke transition-colors duration-300"
          >
            Sign Out
          </button>
        </div>

        {/* Page header */}
        <header className="px-8 lg:px-10 py-8 border-b border-champagne/10
                           flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[0.46rem] tracking-widest3 uppercase text-champagne mb-2">
              {eyebrow}
            </p>
            <h1 className="font-display font-light leading-[0.95] tracking-tight text-pearl
                           text-[clamp(1.8rem,3.5vw,3rem)]">
              {title}
            </h1>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>

        {/* Page body */}
        <div className="flex-1 px-8 lg:px-10 py-8">
          {children}
        </div>

      </div>
    </div>
  )
}
