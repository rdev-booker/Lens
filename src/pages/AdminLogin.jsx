import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const FIELD = [
  'w-full bg-charcoal border border-champagne/15 text-pearl',
  'font-sans text-[0.88rem] px-4 py-3',
  'placeholder:text-smoke/40 focus:outline-none',
  'focus:border-champagne/50 transition-colors duration-300',
].join(' ')

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(true) // true while checking existing session

  // Redirect immediately if already authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/admin', { replace: true })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/admin', { replace: true })
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, onAuthStateChange fires → navigate('/admin') above
  }

  // Show nothing while resolving an existing session to avoid flash
  if (loading) {
    return (
      <main className="bg-obsidian min-h-screen flex items-center justify-center">
        <p className="font-mono text-[0.5rem] tracking-widest3 uppercase text-smoke/40 animate-pulse">
          Checking session…
        </p>
      </main>
    )
  }

  return (
    <main className="bg-obsidian min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <p className="font-mono text-[0.52rem] tracking-widest3 uppercase text-champagne mb-3">
          Admin
        </p>
        <h1 className="font-display font-light text-[2.8rem] leading-tight text-pearl mb-2">
          Sign In
        </h1>
        <span className="block h-px bg-champagne/15 mb-8" aria-hidden />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke mb-1.5 block"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={FIELD}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke mb-1.5 block"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={FIELD}
            />
          </div>

          {error && (
            <div className="border border-red-400/20 bg-red-400/5 px-4 py-3">
              <p className="font-mono text-[0.52rem] tracking-wider uppercase text-red-400/80">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative inline-flex items-center justify-center mt-1
                       px-8 py-4 bg-champagne text-obsidian
                       font-sans text-[0.68rem] tracking-widest2 uppercase
                       overflow-hidden group transition-colors duration-400
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              className="absolute inset-0 bg-[#e8c98a] translate-x-[-101%]
                         group-hover:translate-x-0 transition-transform duration-400 ease-luxury"
            />
            <span className="relative">
              {loading ? 'Signing in…' : 'Sign In'}
            </span>
          </button>
        </form>

      </div>
    </main>
  )
}
