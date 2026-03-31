import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import { supabase } from '../lib/supabaseClient'

/* ─── Shared style tokens ──────────────────────────────────────────── */
const FIELD = [
  'w-full bg-obsidian border border-champagne/15 text-pearl',
  'font-sans text-[0.85rem] px-4 py-2.5',
  'placeholder:text-smoke/30 focus:outline-none',
  'focus:border-champagne/40 transition-colors duration-300',
].join(' ')

const LABEL     = 'font-mono text-[0.46rem] tracking-widest2 uppercase text-smoke/70 mb-1.5 block'
const BTN_GHOST = 'font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/40 hover:text-silver transition-colors duration-200'

const TINT_TYPES = ['solid', 'gradient', 'photochromic']

const TYPE_STYLES = {
  solid:         'border-silver/20 text-silver/60',
  gradient:      'border-champagne/25 text-champagne/70',
  photochromic:  'border-blue-400/25 text-blue-400/70',
}

const EMPTY = {
  label:        '',
  type:         'solid',
  hex_code:     '#3b82f6',
  min_opacity:  '0',
  max_opacity:  '1',
  price_markup: '0',
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
   TINT DRAWER (add / edit)
════════════════════════════════════════════════════════════════════ */
function TintDrawer({ editing, onClose, onSaved }) {
  const [fields,    setFields]    = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (editing) {
      setFields({
        label:        editing.label        ?? '',
        type:         editing.type         ?? 'solid',
        hex_code:     editing.hex_code     ?? '#3b82f6',
        min_opacity:  String(editing.min_opacity  ?? 0),
        max_opacity:  String(editing.max_opacity  ?? 1),
        price_markup: String(editing.price_markup ?? 0),
      })
    } else {
      setFields(EMPTY)
    }
    setFormError(null)
  }, [editing])

  const set = key => e => setFields(f => ({ ...f, [key]: e.target.value }))

  /* Derived preview values */
  const minOp = Math.min(1, Math.max(0, parseFloat(fields.min_opacity) || 0))
  const maxOp = Math.min(1, Math.max(0, parseFloat(fields.max_opacity) || 0))

  /* Convert 0–1 to two-digit hex (00–ff) for rgba gradient */
  const toAlphaHex = v => Math.round(v * 255).toString(16).padStart(2, '0')

  const handleSubmit = async e => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)

    try {
      const row = {
        label:        fields.label.trim(),
        type:         fields.type,
        hex_code:     fields.hex_code,
        min_opacity:  parseFloat(fields.min_opacity),
        max_opacity:  parseFloat(fields.max_opacity),
        price_markup: parseFloat(fields.price_markup),
      }

      if (editing) {
        const { error } = await supabase.from('tints').update(row).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('tints').insert(row)
        if (error) throw error
      }

      onSaved(editing ? 'Tint updated.' : 'Tint added.')
      onClose()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-end bg-obsidian/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="h-full w-full max-w-md bg-charcoal border-l border-champagne/12 flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-8 py-6 border-b border-champagne/10 flex items-center gap-4 shrink-0">
          <span className="flex-1 font-mono text-[0.48rem] tracking-widest3 uppercase text-champagne">
            {editing ? 'Edit Tint' : 'New Tint'}
          </span>
          <button onClick={onClose} className={BTN_GHOST}>✕ Close</button>
        </div>

        {/* Form */}
        <form
          id="tint-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-6"
        >
          {formError && (
            <div className="border border-red-400/20 bg-red-400/[0.04] px-4 py-3">
              <p className="font-mono text-[0.48rem] tracking-wider uppercase text-red-400/80">
                {formError}
              </p>
            </div>
          )}

          {/* Live lens preview */}
          <div>
            <label className={LABEL}>Live Preview</label>
            <div className="flex items-end gap-4">
              {/* Gradient band: min opacity → max opacity */}
              <div
                className="h-14 flex-1 border border-champagne/10"
                style={{
                  background: `linear-gradient(to right,
                    ${fields.hex_code}${toAlphaHex(minOp)},
                    ${fields.hex_code}${toAlphaHex(maxOp)})`,
                }}
              />
              <div className="text-right shrink-0">
                <p className="font-mono text-[0.42rem] tracking-wider uppercase text-smoke/45">
                  {Math.round(minOp * 100)}% → {Math.round(maxOp * 100)}%
                </p>
                <p className="font-mono text-[0.42rem] tracking-wider uppercase text-smoke/35 mt-0.5">
                  {fields.hex_code.toUpperCase()}
                </p>
                <p className="font-mono text-[0.4rem] tracking-widest uppercase mt-0.5
                              capitalize text-smoke/35">
                  {fields.type}
                </p>
              </div>
            </div>
            <p className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/30 mt-2 leading-loose">
              This swatch simulates how the tint renders over a lens with mix-blend-mode: multiply.
            </p>
          </div>

          <span className="h-px bg-champagne/8 block" aria-hidden />

          {/* Label */}
          <div>
            <label className={LABEL}>Label *</label>
            <input
              type="text" required
              placeholder="e.g. Sapphire Blue"
              value={fields.label}
              onChange={set('label')}
              className={FIELD}
            />
          </div>

          {/* Type */}
          <div>
            <label className={LABEL}>Tint Type *</label>
            <select
              value={fields.type}
              onChange={set('type')}
              className={FIELD + ' appearance-none cursor-pointer'}
            >
              {TINT_TYPES.map(t => (
                <option key={t} value={t} className="bg-charcoal capitalize">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <p className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/30 mt-1.5 leading-loose">
              Solid — flat colour · Gradient — two-tone sweep · Photochromic — reactive
            </p>
          </div>

          {/* Hex code */}
          <div>
            <label className={LABEL}>Hex Code *</label>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 border border-champagne/15"
                  style={{ backgroundColor: fields.hex_code }}
                />
                <input
                  type="color"
                  value={fields.hex_code}
                  onChange={set('hex_code')}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <input
                type="text" required
                placeholder="#3b82f6"
                value={fields.hex_code}
                onChange={set('hex_code')}
                pattern="^#[0-9A-Fa-f]{6}$"
                className={FIELD + ' flex-1 font-mono'}
              />
            </div>
          </div>

          <span className="h-px bg-champagne/8 block" aria-hidden />

          {/* Opacity range */}
          <div>
            <label className={LABEL}>Opacity Range (0 – 1)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Min Opacity</label>
                <input
                  type="number"
                  min="0" max="1" step="0.05"
                  value={fields.min_opacity}
                  onChange={set('min_opacity')}
                  className={FIELD}
                />
                <p className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/30 mt-1">
                  = {Math.round(minOp * 100)}%
                </p>
              </div>
              <div>
                <label className={LABEL}>Max Opacity</label>
                <input
                  type="number"
                  min="0" max="1" step="0.05"
                  value={fields.max_opacity}
                  onChange={set('max_opacity')}
                  className={FIELD}
                />
                <p className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/30 mt-1">
                  = {Math.round(maxOp * 100)}%
                </p>
              </div>
            </div>
            <p className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/30 mt-2 leading-loose">
              Sets the bounds of the density slider in the Shop customizer.
              The slider maps linearly between min and max.
            </p>
          </div>

          <span className="h-px bg-champagne/8 block" aria-hidden />

          {/* Price markup */}
          <div>
            <label className={LABEL}>Price Markup (USD)</label>
            <input
              type="number"
              min="0" step="0.01"
              placeholder="0.00"
              value={fields.price_markup}
              onChange={set('price_markup')}
              className={FIELD}
            />
            <p className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/30 mt-1.5 leading-loose">
              Added on top of the base frame price at checkout when this tint is selected.
            </p>
          </div>

        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-champagne/10 flex items-center justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className={BTN_GHOST}>Cancel</button>
          <button
            form="tint-form"
            type="submit"
            disabled={saving}
            className="relative inline-flex items-center justify-center
                       px-7 py-3 bg-champagne text-obsidian
                       font-sans text-[0.62rem] tracking-widest2 uppercase
                       overflow-hidden group transition-colors duration-400
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-[#e8c98a] translate-x-[-101%]
                             group-hover:translate-x-0 transition-transform duration-400 ease-luxury" />
            <span className="relative">
              {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Tint')}
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
════════════════════════════════════════════════════════════════════ */
function DeleteConfirm({ target, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-sm border border-champagne/15 bg-charcoal p-8 flex flex-col gap-6">
        <p className="font-mono text-[0.48rem] tracking-widest3 uppercase text-champagne">
          Confirm Delete
        </p>
        <p className="font-sans text-[0.86rem] text-silver leading-relaxed">
          Remove tint <span className="text-pearl">{target.label}</span>?
          Any saved configurations referencing it will lose tint data. This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-champagne/20 text-smoke
                       font-sans text-[0.62rem] tracking-widest2 uppercase
                       hover:border-champagne/40 hover:text-silver transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-500/80 hover:bg-red-500 text-pearl
                       font-sans text-[0.62rem] tracking-widest2 uppercase transition-colors duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   ADMIN TINTS PAGE
════════════════════════════════════════════════════════════════════ */
export default function AdminTints() {
  const [tints,    setTints]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [drawer,   setDrawer]   = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [toast,    setToast]    = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tints')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) showToast(error.message, 'error')
    else setTints(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd  = ()  => { setEditing(null); setDrawer(true) }
  const openEdit = t   => { setEditing(t);    setDrawer(true) }
  const close    = ()  => { setDrawer(false); setEditing(null) }

  const handleDelete = async () => {
    const { error } = await supabase.from('tints').delete().eq('id', deleting.id)
    setDeleting(null)
    if (error) showToast(error.message, 'error')
    else { showToast('Tint deleted.'); load() }
  }

  const AddButton = (
    <button
      onClick={openAdd}
      className="relative inline-flex items-center justify-center
                 px-6 py-2.5 bg-champagne text-obsidian
                 font-sans text-[0.6rem] tracking-widest2 uppercase
                 overflow-hidden group transition-colors duration-400"
    >
      <span className="absolute inset-0 bg-[#e8c98a] translate-x-[-101%]
                       group-hover:translate-x-0 transition-transform duration-400 ease-luxury" />
      <span className="relative">+ Add Tint</span>
    </button>
  )

  return (
    <AdminLayout title="Tints" eyebrow="Lens Options" action={AddButton}>

      {/* Live-impact callout */}
      <div className="mb-6 border border-champagne/12 bg-champagne/[0.03] px-5 py-4 flex items-start gap-3">
        <span className="font-mono text-[0.6rem] text-champagne/50 mt-0.5" aria-hidden>◎</span>
        <p className="font-mono text-[0.44rem] tracking-wider uppercase text-champagne/55 leading-loose">
          Live impact — Every save here propagates instantly to the Shop canvas customizer.
          The density slider range, tint colour, and price markup are fetched directly
          from this table via Supabase RLS at render time. No rebuild required.
        </p>
      </div>

      {/* Table panel */}
      <div className="border border-champagne/10 bg-charcoal/20">
        <div className="px-6 py-4 border-b border-champagne/10 flex items-center gap-3">
          <span className="font-mono text-[0.46rem] tracking-widest3 uppercase text-champagne">
            All Tints
          </span>
          <span className="flex-1 h-px bg-champagne/8" aria-hidden />
          <span className="font-mono text-[0.42rem] tracking-widest uppercase text-smoke/35">
            {tints.length} {tints.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <p className="font-mono text-[0.5rem] tracking-widest2 uppercase
                          text-smoke/35 py-16 text-center animate-pulse">
              Loading…
            </p>
          ) : tints.length === 0 ? (
            <p className="font-mono text-[0.5rem] tracking-widest2 uppercase
                          text-smoke/35 py-16 text-center">
              No tints yet. Add one to populate the customizer.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-champagne/10">
                    {['Swatch', 'Label', 'Type', 'Hex', 'Opacity Range', 'Markup', ''].map(h => (
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
                  {tints.map(t => (
                    <tr
                      key={t.id}
                      className="border-b border-champagne/[0.06] hover:bg-white/[0.012] transition-colors duration-200"
                    >
                      {/* Swatch — shows the full opacity-range gradient */}
                      <td className="py-3.5 pr-6">
                        <div
                          className="w-10 h-6 border border-champagne/12"
                          style={{
                            background: `linear-gradient(to right,
                              ${t.hex_code}${Math.round((t.min_opacity ?? 0) * 255).toString(16).padStart(2,'0')},
                              ${t.hex_code}${Math.round((t.max_opacity ?? 1) * 255).toString(16).padStart(2,'0')})`,
                          }}
                          title={`${t.hex_code} · ${Math.round((t.min_opacity||0)*100)}–${Math.round((t.max_opacity||1)*100)}%`}
                        />
                      </td>

                      <td className="py-3.5 pr-6">
                        <span className="font-sans text-[0.82rem] text-pearl whitespace-nowrap">
                          {t.label}
                        </span>
                      </td>

                      <td className="py-3.5 pr-6">
                        <span className={`inline-block px-2 py-1 border font-mono
                                         text-[0.4rem] tracking-widest uppercase
                                         ${TYPE_STYLES[t.type] ?? 'border-smoke/15 text-smoke/40'}`}>
                          {t.type}
                        </span>
                      </td>

                      <td className="py-3.5 pr-6">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-champagne/15 shrink-0"
                            style={{ backgroundColor: t.hex_code }}
                          />
                          <span className="font-mono text-[0.44rem] tracking-wider text-smoke/60">
                            {t.hex_code.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 pr-6">
                        <span className="font-mono text-[0.44rem] tracking-wider text-smoke/55 whitespace-nowrap">
                          {Math.round((t.min_opacity ?? 0) * 100)}%
                          {' '}—{' '}
                          {Math.round((t.max_opacity ?? 1) * 100)}%
                        </span>
                      </td>

                      <td className="py-3.5 pr-6">
                        <span className="font-sans text-[0.82rem] text-silver">
                          {t.price_markup > 0 ? `+$${Number(t.price_markup).toFixed(2)}` : '—'}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => openEdit(t)}
                            className="font-mono text-[0.44rem] tracking-widest2 uppercase
                                       text-smoke/40 hover:text-champagne transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleting(t)}
                            className="font-mono text-[0.44rem] tracking-widest2 uppercase
                                       text-smoke/40 hover:text-red-400/70 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <TintDrawer
          editing={editing}
          onClose={close}
          onSaved={msg => { showToast(msg); load() }}
        />
      )}

      {deleting && (
        <DeleteConfirm
          target={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      <Toast status={toast} onDismiss={() => setToast(null)} />

    </AdminLayout>
  )
}
