import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import { supabase } from '../lib/supabaseClient'

/* ════════════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════════════ */
function Toast({ status, onDismiss }) {
  if (!status) return null
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-4 px-5 py-3.5 border max-w-sm
                     shadow-xl shadow-obsidian/60 ${
      status.type === 'error'
        ? 'border-red-400/25 bg-[#0e0b0b] text-red-400/80'
        : 'border-champagne/25 bg-[#0e0c08] text-champagne'
    }`}>
      <p className="font-mono text-[0.48rem] tracking-wider uppercase flex-1">{status.message}</p>
      <button onClick={onDismiss} className="font-mono text-[0.5rem] opacity-50 hover:opacity-100 transition-opacity" aria-label="Dismiss">✕</button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   LOOK CARD
════════════════════════════════════════════════════════════════════ */
function LookCard({ look, onApprove, onDelete }) {
  const [acting, setActing] = useState(false)

  const act = async fn => {
    setActing(true)
    await fn()
    setActing(false)
  }

  return (
    <div className="border border-champagne/10 bg-charcoal/30 flex flex-col overflow-hidden">
      {/* Photo */}
      <div className="w-full overflow-hidden bg-[#F7F5F2]" style={{ aspectRatio: '4/3' }}>
        <img
          src={look.image_url}
          alt="Customer submission"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Meta */}
      <div className="px-4 py-3 border-t border-champagne/8 flex flex-col gap-1">
        <p className="font-sans text-[0.82rem] text-pearl leading-tight">
          {look.frames?.name ?? '—'}
        </p>
        {look.frames?.maison && (
          <p className="font-mono text-[0.42rem] tracking-widest2 uppercase text-champagne/60">
            {look.frames.maison}
          </p>
        )}
        <p className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/35 mt-0.5">
          {new Date(look.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => act(onApprove)}
          disabled={acting}
          className="flex-1 py-2 border border-champagne/30 text-champagne
                     font-mono text-[0.44rem] tracking-widest2 uppercase
                     hover:bg-champagne/10 transition-colors duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Approve
        </button>
        <button
          onClick={() => act(onDelete)}
          disabled={acting}
          className="flex-1 py-2 border border-red-400/20 text-red-400/70
                     font-mono text-[0.44rem] tracking-widest2 uppercase
                     hover:bg-red-400/10 transition-colors duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   ADMIN MODERATION PAGE
════════════════════════════════════════════════════════════════════ */
export default function AdminModeration() {
  const [looks,   setLooks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('customer_looks')
      .select('*, frames(name, maison)')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) showToast(error.message, 'error')
    else setLooks(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async look => {
    const { error } = await supabase
      .from('customer_looks')
      .update({ is_approved: true })
      .eq('id', look.id)

    if (error) showToast(error.message, 'error')
    else {
      showToast('Look approved.')
      setLooks(prev => prev.filter(l => l.id !== look.id))
    }
  }

  const handleDelete = async look => {
    // Extract storage path from the public URL
    const path = look.image_url.split('/customer_photos/')[1]

    if (path) {
      await supabase.storage.from('customer_photos').remove([path])
    }

    const { error } = await supabase
      .from('customer_looks')
      .delete()
      .eq('id', look.id)

    if (error) showToast(error.message, 'error')
    else {
      showToast('Look deleted.')
      setLooks(prev => prev.filter(l => l.id !== look.id))
    }
  }

  return (
    <AdminLayout title="Moderation" eyebrow="Customer Looks">

      {loading ? (
        <p className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke/35 py-20 text-center animate-pulse">
          Loading…
        </p>
      ) : looks.length === 0 ? (
        <div className="border border-champagne/10 bg-charcoal/20 py-20 text-center">
          <p className="font-mono text-[0.5rem] tracking-widest3 uppercase text-champagne mb-2">
            All clear
          </p>
          <p className="font-sans text-[0.82rem] text-smoke/50">
            No submissions pending review.
          </p>
        </div>
      ) : (
        <>
          <p className="font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/40 mb-6">
            {looks.length} pending {looks.length === 1 ? 'submission' : 'submissions'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {looks.map(look => (
              <LookCard
                key={look.id}
                look={look}
                onApprove={() => handleApprove(look)}
                onDelete={() => handleDelete(look)}
              />
            ))}
          </div>
        </>
      )}

      <Toast status={toast} onDismiss={() => setToast(null)} />
    </AdminLayout>
  )
}
