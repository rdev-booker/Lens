import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

/**
 * Wraps a route and:
 *  - Redirects unauthenticated users to /admin/login
 *  - Redirects authenticated non-admins to /
 *  - Renders children only when session.user.app_metadata.role === 'admin'
 *
 * Admin role is set server-side via:
 *   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
 *   WHERE id = '<uuid>';
 */
export default function ProtectedRoute({ children }) {
  // 'resolving' | 'no-session' | 'forbidden' | 'ok'
  const [status, setStatus] = useState('resolving')

  useEffect(() => {
    const check = session => {
      if (!session)                                       return setStatus('no-session')
      const role = session.user?.app_metadata?.role
      setStatus(role === 'admin' ? 'ok' : 'forbidden')
    }

    supabase.auth.getSession().then(({ data }) => check(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (status === 'resolving') {
    return (
      <main className="bg-obsidian min-h-screen flex items-center justify-center">
        <p className="font-mono text-[0.5rem] tracking-widest3 uppercase text-smoke/40 animate-pulse">
          Checking session…
        </p>
      </main>
    )
  }

  if (status === 'no-session') return <Navigate to="/admin/login" replace />
  if (status === 'forbidden')  return <Navigate to="/" replace />

  return children
}
