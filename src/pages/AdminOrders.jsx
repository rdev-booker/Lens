import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import { supabase } from '../lib/supabaseClient'

/* ─── Order lifecycle ──────────────────────────────────────────────── */
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLES = {
  pending:    'border-smoke/20   text-smoke/50',
  confirmed:  'border-champagne/30 text-champagne/70',
  processing: 'border-blue-400/30  text-blue-400/70',
  shipped:    'border-emerald-400/30 text-emerald-400/70',
  delivered:  'border-green-400/30  text-green-400/70',
  cancelled:  'border-red-400/25    text-red-400/60',
}

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
      <button onClick={onDismiss} className="font-mono text-[0.5rem] opacity-50 hover:opacity-100">✕</button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   CONFIG DETAIL CELL
   Renders a compact summary of what the customer designed
════════════════════════════════════════════════════════════════════ */
function ConfigCell({ order }) {
  const cfg      = order.configurations
  const product  = cfg?.products
  const settings = cfg?.settings ?? {}

  if (!cfg) {
    return <span className="font-mono text-[0.42rem] text-smoke/30">No config</span>
  }

  const opacityPct = settings.opacity !== undefined
    ? `${Math.round(settings.opacity * 100)}% opacity`
    : null

  const gradAngle = settings.gradient_angle !== undefined
    ? `${settings.gradient_angle}° angle`
    : null

  return (
    <div className="flex flex-col gap-0.5 max-w-[13rem]">
      <span className="font-sans text-[0.8rem] text-pearl leading-snug">
        {product ? `${product.name}` : 'Unknown frame'}
        {product?.brand
          ? <span className="text-smoke/50 text-[0.72rem]"> · {product.brand}</span>
          : null}
      </span>
      {(opacityPct || gradAngle) && (
        <div className="flex items-center gap-2 flex-wrap">
          {opacityPct && (
            <span className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/45">
              {opacityPct}
            </span>
          )}
          {gradAngle && (
            <span className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/40">
              {gradAngle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   ADMIN ORDERS PAGE
════════════════════════════════════════════════════════════════════ */
export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [toast,   setToast]   = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_price,
        placed_at,
        profiles!user_id ( full_name ),
        configurations!configuration_id (
          settings,
          products!product_id ( name, brand )
        )
      `)
      .order('placed_at', { ascending: false })

    if (error) showToast(error.message, 'error')
    else setOrders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /* Inline status update — optimistic UI, confirmed by Supabase */
  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast(`Status → "${newStatus}".`)
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      )
    }
  }

  /* Status summary counts for the overview cards */
  const counts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {})
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total_price), 0)

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  return (
    <AdminLayout title="Orders" eyebrow="Order Oversight">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">

        {/* Revenue card */}
        <div
          className="col-span-2 sm:col-span-1 border border-champagne/15
                     bg-champagne/[0.04] px-5 py-4 flex flex-col gap-1"
        >
          <p className="font-mono text-[0.42rem] tracking-widest2 uppercase text-champagne/60">
            Revenue (excl. cancelled)
          </p>
          <p className="font-display font-light text-[1.6rem] text-champagne leading-none">
            ${totalRevenue.toFixed(2)}
          </p>
          <p className="font-mono text-[0.4rem] tracking-widest uppercase text-smoke/35 mt-0.5">
            {orders.filter(o => o.status !== 'cancelled').length} orders
          </p>
        </div>

        {/* Per-status cards */}
        {ORDER_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? 'all' : s)}
            className={`text-left px-4 py-3.5 border transition-colors duration-200 ${
              filter === s
                ? 'border-champagne/30 bg-champagne/[0.06]'
                : 'border-champagne/10 bg-charcoal/20 hover:border-champagne/20'
            }`}
          >
            <p className="font-mono text-[0.4rem] tracking-widest2 uppercase text-smoke/50 mb-1 capitalize">
              {s}
            </p>
            <p className="font-sans text-[1.25rem] text-pearl leading-none">
              {counts[s] ?? 0}
            </p>
          </button>
        ))}
      </div>

      {/* Active filter indicator */}
      {filter !== 'all' && (
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/40">
            Filtering:
          </span>
          <span className={`inline-block px-2.5 py-1 border font-mono text-[0.42rem]
                            tracking-widest uppercase capitalize
                            ${STATUS_STYLES[filter] ?? 'border-smoke/20 text-smoke/50'}`}>
            {filter}
          </span>
          <button
            onClick={() => setFilter('all')}
            className="font-mono text-[0.42rem] tracking-widest2 uppercase
                       text-smoke/35 hover:text-smoke transition-colors duration-200"
          >
            Clear ✕
          </button>
        </div>
      )}

      {/* ── Orders table ── */}
      <div className="border border-champagne/10 bg-charcoal/20">
        <div className="px-6 py-4 border-b border-champagne/10 flex items-center gap-3">
          <span className="font-mono text-[0.46rem] tracking-widest3 uppercase text-champagne">
            {filter === 'all' ? 'All Orders' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`}
          </span>
          <span className="flex-1 h-px bg-champagne/8" aria-hidden />
          <span className="font-mono text-[0.42rem] tracking-widest uppercase text-smoke/35">
            {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <p className="font-mono text-[0.5rem] tracking-widest2 uppercase
                          text-smoke/35 py-16 text-center animate-pulse">
              Loading…
            </p>
          ) : filtered.length === 0 ? (
            <p className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke/35 py-16 text-center">
              No orders{filter !== 'all' ? ` with status "${filter}"` : ' yet'}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-champagne/10">
                    {['Customer', 'Configuration', 'Total', 'Placed', 'Status'].map(h => (
                      <th
                        key={h}
                        className="font-mono text-[0.42rem] tracking-widest2 uppercase
                                   text-smoke/50 pb-3 pr-6 font-normal whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr
                      key={order.id}
                      className="border-b border-champagne/[0.06] hover:bg-white/[0.012] transition-colors duration-200"
                    >
                      {/* Customer */}
                      <td className="py-4 pr-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-sans text-[0.82rem] text-pearl whitespace-nowrap">
                            {order.profiles?.full_name ?? 'Anonymous'}
                          </span>
                          <span
                            className="font-mono text-[0.38rem] tracking-wider text-smoke/30
                                       truncate max-w-[8rem]"
                            title={order.id}
                          >
                            #{order.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      {/* Configuration summary */}
                      <td className="py-4 pr-6">
                        <ConfigCell order={order} />
                      </td>

                      {/* Total */}
                      <td className="py-4 pr-6">
                        <span className="font-sans text-[0.9rem] text-champagne whitespace-nowrap">
                          ${Number(order.total_price).toFixed(2)}
                        </span>
                      </td>

                      {/* Placed at */}
                      <td className="py-4 pr-6">
                        <span className="font-mono text-[0.42rem] tracking-wider text-smoke/50 whitespace-nowrap">
                          {new Date(order.placed_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Inline status dropdown */}
                      <td className="py-4">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className={`bg-transparent border px-3 py-1.5
                                      font-mono text-[0.42rem] tracking-widest uppercase
                                      focus:outline-none cursor-pointer appearance-none
                                      transition-colors duration-200
                                      ${STATUS_STYLES[order.status] ?? 'border-smoke/20 text-smoke/50'}`}
                          aria-label={`Status for order ${order.id.slice(0, 8)}`}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option
                              key={s} value={s}
                              className="bg-charcoal text-pearl normal-case tracking-normal text-sm"
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Toast status={toast} onDismiss={() => setToast(null)} />

    </AdminLayout>
  )
}
