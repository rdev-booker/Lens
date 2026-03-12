import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

/**
 * Wraps a route and redirects unauthenticated visitors to /admin/login.
 * Renders a minimal loading state while the session is being resolved.
 * Reacts to signOut automatically via onAuthStateChange.
 */
export default function ProtectedRoute({ children }) {
  // undefined = resolving, null = no session, object = authenticated
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <main className="bg-obsidian min-h-screen flex items-center justify-center">
        <p className="font-mono text-[0.5rem] tracking-widest3 uppercase text-smoke/40 animate-pulse">
          Checking session…
        </p>
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
