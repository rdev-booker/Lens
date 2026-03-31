import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import { supabase, uploadFrameImage } from '../lib/supabaseClient'

/* ─── Shared style tokens ──────────────────────────────────────────── */
const FIELD = [
  'w-full bg-obsidian border border-champagne/15 text-pearl',
  'font-sans text-[0.85rem] px-4 py-2.5',
  'placeholder:text-smoke/30 focus:outline-none',
  'focus:border-champagne/40 transition-colors duration-300',
].join(' ')

const LABEL     = 'font-mono text-[0.46rem] tracking-widest2 uppercase text-smoke/70 mb-1.5 block'
const BTN_GHOST = 'font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/40 hover:text-silver transition-colors duration-200'

const EMPTY = { name: '', sub: '', maison: '', src: '' }

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
   FRAME DRAWER (add / edit)
════════════════════════════════════════════════════════════════════ */
function FrameDrawer({ editing, onClose, onSaved }) {
  const [fields,    setFields]    = useState(EMPTY)
  const [file,      setFile]      = useState(null)
  const [preview,   setPreview]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (editing) {
      setFields({ name: editing.name ?? '', sub: editing.sub ?? '', maison: editing.maison ?? '', src: editing.src ?? '' })
      setPreview(editing.src ?? null)
    } else {
      setFields(EMPTY)
      setPreview(null)
    }
    setFile(null)
    setFormError(null)
  }, [editing])

  const set = key => e => setFields(f => ({ ...f, [key]: e.target.value }))

  const handleFile = e => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)

    try {
      let src = fields.src

      // If the user picked a new file, upload it first
      if (file) {
        src = await uploadFrameImage(file)
      }

      const row = {
        name:   fields.name.trim(),
        sub:    fields.sub.trim(),
        maison: fields.maison.trim(),
        src,
      }

      if (editing) {
        const { error } = await supabase.from('frames').update(row).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('frames').insert(row)
        if (error) throw error
      }

      onSaved(editing ? 'Frame updated.' : 'Frame added.')
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
            {editing ? 'Edit Frame' : 'New Frame'}
          </span>
          <button onClick={onClose} className={BTN_GHOST}>✕ Close</button>
        </div>

        {/* Form */}
        <form id="frame-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-6">
          {formError && (
            <div className="border border-red-400/20 bg-red-400/[0.04] px-4 py-3">
              <p className="font-mono text-[0.48rem] tracking-wider uppercase text-red-400/80">{formError}</p>
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className={LABEL}>Frame Image *</label>

            {/* Preview */}
            {preview && (
              <div className="w-full mb-3 overflow-hidden border border-champagne/10 bg-[#F7F5F2]" style={{ aspectRatio: '5/3' }}>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <label className="flex flex-col items-center justify-center gap-2 w-full py-6
                               border border-dashed border-champagne/20 cursor-pointer
                               hover:border-champagne/40 transition-colors duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M10 3v10M6 7l4-4 4 4" stroke="#C9A96E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="#C9A96E" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="font-mono text-[0.46rem] tracking-widest2 uppercase text-smoke/60">
                {file ? file.name : 'Click to upload image'}
              </span>
              <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
            </label>
          </div>

          <span className="h-px bg-champagne/8 block" aria-hidden />

          {/* Name */}
          <div>
            <label className={LABEL}>Frame Name *</label>
            <input
              type="text" required
              placeholder="e.g. Monolix"
              value={fields.name}
              onChange={set('name')}
              className={FIELD}
            />
          </div>

          {/* Sub / Variant */}
          <div>
            <label className={LABEL}>Variant / Colorway *</label>
            <input
              type="text" required
              placeholder="e.g. Matte Black"
              value={fields.sub}
              onChange={set('sub')}
              className={FIELD}
            />
          </div>

          {/* Maison / Brand */}
          <div>
            <label className={LABEL}>Maison / Brand *</label>
            <input
              type="text" required
              placeholder="e.g. DITA Eyewear"
              value={fields.maison}
              onChange={set('maison')}
              className={FIELD}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-champagne/10 flex items-center justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className={BTN_GHOST}>Cancel</button>
          <button
            form="frame-form"
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
              {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Frame')}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   DELETE CONFIRM
════════════════════════════════════════════════════════════════════ */
function DeleteConfirm({ target, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-sm border border-champagne/15 bg-charcoal p-8 flex flex-col gap-6">
        <p className="font-mono text-[0.48rem] tracking-widest3 uppercase text-champagne">Confirm Delete</p>
        <p className="font-sans text-[0.86rem] text-silver leading-relaxed">
          Remove <span className="text-pearl">{target.name}</span>
          {target.maison ? ` by ${target.maison}` : ''}? This cannot be undone.
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
   FRAMES TABLE
════════════════════════════════════════════════════════════════════ */
function FramesTable({ frames, onEdit, onDelete }) {
  if (!frames.length) {
    return (
      <p className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke/35 py-16 text-center">
        No frames yet. Add one to get started.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-champagne/10">
            {['Frame', 'Maison', 'Variant', ''].map(h => (
              <th key={h} className="font-mono text-[0.42rem] tracking-widest2 uppercase text-smoke/50 pb-3 pr-6 font-normal whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {frames.map(f => (
            <tr key={f.id} className="border-b border-champagne/[0.06] hover:bg-white/[0.012] transition-colors duration-200">
              {/* Thumbnail + name */}
              <td className="py-3.5 pr-6">
                <div className="flex items-center gap-3">
                  {f.src ? (
                    <div className="w-14 shrink-0 overflow-hidden border border-champagne/10 bg-[#F7F5F2]" style={{ aspectRatio: '5/3' }}>
                      <img src={f.src} alt={f.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 shrink-0 bg-charcoal border border-champagne/10 flex items-center justify-center" style={{ aspectRatio: '5/3' }}>
                      <span className="font-mono text-[0.36rem] text-smoke/25">—</span>
                    </div>
                  )}
                  <span className="font-sans text-[0.82rem] text-pearl whitespace-nowrap">{f.name}</span>
                </div>
              </td>

              <td className="py-3.5 pr-6">
                <span className="font-mono text-[0.44rem] tracking-wider uppercase text-smoke/60">{f.maison}</span>
              </td>

              <td className="py-3.5 pr-6">
                <span className="font-sans text-[0.82rem] text-silver">{f.sub}</span>
              </td>

              <td className="py-3.5">
                <div className="flex items-center gap-4">
                  <button onClick={() => onEdit(f)} className="font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/40 hover:text-champagne transition-colors duration-200">Edit</button>
                  <button onClick={() => onDelete(f)} className="font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/40 hover:text-red-400/70 transition-colors duration-200">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   ADMIN FRAMES PAGE
════════════════════════════════════════════════════════════════════ */
export default function AdminProducts() {
  const [frames,   setFrames]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
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
      .from('frames')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) showToast(error.message, 'error')
    else setFrames(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setEditing(null); setDrawer(true) }
  const openEdit = f  => { setEditing(f);    setDrawer(true) }
  const close    = () => { setDrawer(false); setEditing(null) }

  const handleDelete = async () => {
    const { error } = await supabase.from('frames').delete().eq('id', deleting.id)
    setDeleting(null)
    if (error) showToast(error.message, 'error')
    else { showToast('Frame deleted.'); load() }
  }

  const filtered = frames.filter(f => {
    if (!search) return true
    const q = search.toLowerCase()
    return f.name?.toLowerCase().includes(q) || f.maison?.toLowerCase().includes(q)
  })

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
      <span className="relative">+ Add Frame</span>
    </button>
  )

  return (
    <AdminLayout title="Frames" eyebrow="Catalogue" action={AddButton}>

      {/* Search + count */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[14rem] max-w-xs">
          <input
            type="search"
            placeholder="Search by name or maison…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-charcoal/50 border border-champagne/12 text-pearl/80
                       font-sans text-[0.82rem] px-4 py-2.5 pl-9
                       placeholder:text-smoke/30 focus:outline-none focus:border-champagne/35
                       transition-colors duration-300"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-smoke/35 pointer-events-none" fill="none" viewBox="0 0 16 16" aria-hidden>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-mono text-[0.44rem] tracking-widest uppercase text-smoke/35">
          {filtered.length} {filtered.length === 1 ? 'frame' : 'frames'}
        </span>
      </div>

      {/* Table */}
      <div className="border border-champagne/10 bg-charcoal/20">
        <div className="px-6 py-4 border-b border-champagne/10">
          <span className="font-mono text-[0.46rem] tracking-widest3 uppercase text-champagne">All Frames</span>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <p className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke/35 py-16 text-center animate-pulse">Loading…</p>
          ) : (
            <FramesTable frames={filtered} onEdit={openEdit} onDelete={setDeleting} />
          )}
        </div>
      </div>

      {drawer && (
        <FrameDrawer
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
