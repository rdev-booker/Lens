import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, uploadFrameImage } from '../lib/supabaseClient'

/* ─── Shared styles ────────────────────────────────────────── */
const FIELD = [
  'w-full bg-charcoal border border-champagne/15 text-pearl',
  'font-sans text-[0.88rem] px-4 py-3',
  'placeholder:text-smoke/40 focus:outline-none',
  'focus:border-champagne/50 transition-colors duration-300',
].join(' ')

const LABEL = 'font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke mb-1.5 block'

/* ═══════════════════════════════════════════════════════════════
   STATUS BANNER
═══════════════════════════════════════════════════════════════ */
function StatusBanner({ status, onDismiss }) {
  if (!status) return null
  return (
    <div className={`flex items-center justify-between px-5 py-3 border ${
      status.type === 'error'
        ? 'border-red-400/20 bg-red-400/5 text-red-400/80'
        : 'border-champagne/20 bg-champagne/5 text-champagne'
    }`}>
      <p className="font-mono text-[0.52rem] tracking-wider uppercase">{status.message}</p>
      <button
        onClick={onDismiss}
        className="font-mono text-[0.6rem] ml-4 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FRAME FORM — add or edit
═══════════════════════════════════════════════════════════════ */
const EMPTY_FORM = { name: '', sub: '', maison: '', published: false }

function FrameForm({ editing, onSaved, onCancelEdit }) {
  const [fields,     setFields]     = useState(editing ?? EMPTY_FORM)
  const [file,       setFile]       = useState(null)
  const [preview,    setPreview]    = useState(editing?.src ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [status,     setStatus]     = useState(null)
  const fileRef = useRef()

  // Sync form state when switching to a different edit target
  useEffect(() => {
    setFields(editing ?? EMPTY_FORM)
    setPreview(editing?.src ?? null)
    setFile(null)
    setStatus(null)
  }, [editing])

  const set = key => e => setFields(f => ({ ...f, [key]: e.target.value }))

  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus(null)

    if (!file && !editing?.src) {
      setStatus({ type: 'error', message: 'Please select a frame image.' })
      return
    }

    setSubmitting(true)
    try {
      const src = file ? await uploadFrameImage(file) : editing.src
      const row = { ...fields, src }

      if (editing) {
        const { error } = await supabase.from('frames').update(row).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('frames').insert(row)
        if (error) throw error
      }

      setStatus({ type: 'success', message: editing ? 'Frame updated.' : 'Frame added.' })

      if (!editing) {
        setFields(EMPTY_FORM)
        setFile(null)
        setPreview(null)
        if (fileRef.current) fileRef.current.value = ''
      }

      onSaved()
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = !!editing

  return (
    <div className="border border-champagne/10 bg-charcoal/30">

      {/* Panel header */}
      <div className="px-6 py-4 border-b border-champagne/10 flex items-center gap-3">
        <span className="font-mono text-[0.5rem] tracking-widest3 uppercase text-champagne">
          {isEditing ? 'Edit Frame' : 'Add Frame'}
        </span>
        <span className="flex-1 h-px bg-champagne/10" aria-hidden />
        {isEditing && (
          <button
            onClick={onCancelEdit}
            className="font-mono text-[0.48rem] tracking-widest2 uppercase
                       text-smoke/50 hover:text-smoke transition-colors duration-300"
          >
            ✕ Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

        {status && <StatusBanner status={status} onDismiss={() => setStatus(null)} />}

        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">

          {/* ── Image upload ── */}
          <div className="flex flex-col gap-3">
            <label className={LABEL}>Frame Image</label>

            {/* Clickable preview */}
            <div
              className="relative w-48 overflow-hidden cursor-pointer group
                         bg-[#F7F5F2] border border-champagne/10"
              style={{ aspectRatio: '5 / 3' }}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
              aria-label="Upload frame image"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Frame preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                       className="text-smoke/25" aria-hidden>
                    <rect x="2" y="4" width="18" height="14" rx="1.5"
                          stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 15l5-4 4 3 3-2.5 6 4.5"
                          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                  <span className="font-mono text-[0.42rem] tracking-widest2 uppercase text-smoke/30">
                    Upload
                  </span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-obsidian/50 opacity-0 group-hover:opacity-100
                              transition-opacity duration-300 flex items-center justify-center">
                <span className="font-mono text-[0.46rem] tracking-widest2 uppercase text-pearl">
                  {preview ? 'Change' : 'Select'}
                </span>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              onChange={handleFile}
              className="sr-only"
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="font-mono text-[0.48rem] tracking-widest2 uppercase text-left
                         text-smoke/50 hover:text-champagne transition-colors duration-300 truncate max-w-[12rem]"
            >
              {file ? file.name : 'Choose file…'}
            </button>
          </div>

          {/* ── Text fields ── */}
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="admin-name" className={LABEL}>Name</label>
              <input
                id="admin-name"
                type="text"
                placeholder="e.g. DITA"
                value={fields.name}
                onChange={set('name')}
                required
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="admin-sub" className={LABEL}>Sub — Variant / Colorway</label>
              <input
                id="admin-sub"
                type="text"
                placeholder="e.g. MONOLIX"
                value={fields.sub}
                onChange={set('sub')}
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="admin-maison" className={LABEL}>Maison — Brand</label>
              <input
                id="admin-maison"
                type="text"
                placeholder="e.g. DITA Eyewear"
                value={fields.maison}
                onChange={set('maison')}
                className={FIELD}
              />
            </div>

            {/* Published toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-3 cursor-pointer w-fit select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={fields.published}
                    onChange={e => setFields(f => ({ ...f, published: e.target.checked }))}
                    className="sr-only peer"
                  />
                  {/* Track */}
                  <div className="w-9 h-5 rounded-full border border-champagne/20 bg-charcoal
                                  peer-checked:bg-champagne/15 peer-checked:border-champagne/40
                                  transition-colors duration-300" />
                  {/* Thumb */}
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full
                                  bg-smoke/40 peer-checked:bg-champagne
                                  peer-checked:translate-x-4 transition-all duration-300" />
                </div>
                <span className={`font-mono text-[0.5rem] tracking-widest2 uppercase transition-colors duration-300 ${
                  fields.published ? 'text-champagne' : 'text-smoke/60'
                }`}>
                  {fields.published ? 'Published' : 'Draft'}
                </span>
              </label>
              <p className="font-mono text-[0.44rem] tracking-wider uppercase text-smoke/35 mt-2 ml-12">
                {fields.published
                  ? 'Visible on the Shop page'
                  : 'Hidden from public view'}
              </p>
            </div>
          </div>
        </div>

        {/* Submit row */}
        <div className="flex items-center justify-end gap-4 border-t border-champagne/10 pt-5">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="font-mono text-[0.52rem] tracking-widest2 uppercase
                         text-smoke/50 hover:text-smoke transition-colors duration-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="relative inline-flex items-center justify-center
                       px-8 py-3 bg-champagne text-obsidian
                       font-sans text-[0.65rem] tracking-widest2 uppercase
                       overflow-hidden group transition-colors duration-400
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-[#e8c98a] translate-x-[-101%]
                             group-hover:translate-x-0 transition-transform duration-400 ease-luxury" />
            <span className="relative">
              {submitting
                ? (isEditing ? 'Saving…'  : 'Adding…')
                : (isEditing ? 'Save Changes' : 'Add Frame')}
            </span>
          </button>
        </div>

      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
═══════════════════════════════════════════════════════════════ */
function DeleteConfirm({ frame, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-sm border border-champagne/15 bg-charcoal p-8 flex flex-col gap-6">
        <p className="font-mono text-[0.5rem] tracking-widest3 uppercase text-champagne">
          Confirm Delete
        </p>
        <p className="font-sans text-[0.88rem] text-silver leading-relaxed">
          Remove{' '}
          <span className="text-pearl">
            {frame.name}{frame.sub ? ` ${frame.sub}` : ''}
          </span>
          ? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-champagne/20 text-smoke
                       font-sans text-[0.65rem] tracking-widest2 uppercase
                       hover:border-champagne/50 hover:text-silver transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-500/80 text-pearl
                       font-sans text-[0.65rem] tracking-widest2 uppercase
                       hover:bg-red-500 transition-colors duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FRAMES TABLE
═══════════════════════════════════════════════════════════════ */
function FramesTable({ frames, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <p className="font-mono text-[0.52rem] tracking-widest2 uppercase text-smoke/40 py-12 text-center animate-pulse">
        Loading…
      </p>
    )
  }

  if (frames.length === 0) {
    return (
      <p className="font-mono text-[0.52rem] tracking-widest2 uppercase text-smoke/40 py-12 text-center">
        No frames yet. Add one above.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-champagne/10">
            {['Image', 'Name', 'Sub', 'Maison', 'Status', 'Actions'].map(h => (
              <th
                key={h}
                className="font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/60 pb-3 pr-6 font-normal"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {frames.map(frame => (
            <tr
              key={frame.id}
              className="border-b border-champagne/6 hover:bg-white/[0.015] transition-colors duration-200"
            >
              {/* Thumbnail */}
              <td className="py-3 pr-6">
                <div
                  className="w-16 overflow-hidden bg-[#F7F5F2] shrink-0"
                  style={{ aspectRatio: '5 / 3' }}
                >
                  {frame.src ? (
                    <img
                      src={frame.src}
                      alt={frame.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-[0.4rem] text-smoke/25">—</span>
                    </div>
                  )}
                </div>
              </td>

              <td className="py-3 pr-6">
                <span className="font-sans text-[0.82rem] text-pearl">{frame.name || '—'}</span>
              </td>

              <td className="py-3 pr-6">
                <span className="font-sans text-[0.82rem] text-silver">{frame.sub || '—'}</span>
              </td>

              <td className="py-3 pr-6">
                <span className="font-mono text-[0.46rem] tracking-wider uppercase text-smoke">
                  {frame.maison || '—'}
                </span>
              </td>

              {/* Published badge */}
              <td className="py-3 pr-6">
                <span className={`inline-block px-2 py-1 font-mono text-[0.42rem] tracking-widest uppercase ${
                  frame.published
                    ? 'border border-champagne/30 text-champagne bg-champagne/5'
                    : 'border border-smoke/15 text-smoke/40'
                }`}>
                  {frame.published ? 'Live' : 'Draft'}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => onEdit(frame)}
                    className="font-mono text-[0.46rem] tracking-widest2 uppercase
                               text-smoke/50 hover:text-champagne transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(frame)}
                    className="font-mono text-[0.46rem] tracking-widest2 uppercase
                               text-smoke/50 hover:text-red-400/70 transition-colors duration-200"
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
  )
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL — authenticated view
═══════════════════════════════════════════════════════════════ */
export default function Admin() {
  const navigate = useNavigate()
  const signOut  = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }
  const [frames,       setFrames]       = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [editingFrame, setEditingFrame] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [tableStatus,  setTableStatus]  = useState(null)

  const loadFrames = async () => {
    setTableLoading(true)
    const { data, error } = await supabase
      .from('frames')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setFrames(data)
    setTableLoading(false)
  }

  useEffect(() => { loadFrames() }, [])

  const handleEdit = frame => {
    setEditingFrame(frame)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('frames').delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    if (error) {
      setTableStatus({ type: 'error', message: error.message })
    } else {
      setTableStatus({ type: 'success', message: 'Frame deleted.' })
      loadFrames()
    }
  }

  return (
    <main className="bg-obsidian min-h-screen pt-20">
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14 lg:py-20">

        {/* ── Page header ── */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-[0.52rem] tracking-widest3 uppercase text-champagne mb-3">
              Admin
            </p>
            <h1 className="font-display font-light text-[clamp(2.5rem,5vw,4.5rem)]
                           leading-[0.95] tracking-tight text-pearl">
              Frame Catalogue
            </h1>
          </div>
          <button
            onClick={signOut}
            className="font-mono text-[0.48rem] tracking-widest2 uppercase
                       text-smoke/40 hover:text-smoke transition-colors duration-300"
          >
            Sign Out
          </button>
        </div>

        <span className="block h-px bg-champagne/10 mb-12" aria-hidden />

        {/* ── Add / Edit form ── */}
        <FrameForm
          editing={editingFrame}
          onSaved={() => {
            loadFrames()
            if (editingFrame) setEditingFrame(null)
          }}
          onCancelEdit={() => setEditingFrame(null)}
        />

        {/* ── All frames table ── */}
        <div className="mt-14 border border-champagne/10 bg-charcoal/30">
          <div className="px-6 py-4 border-b border-champagne/10 flex items-center gap-3">
            <span className="font-mono text-[0.5rem] tracking-widest3 uppercase text-champagne">
              All Frames
            </span>
            <span className="flex-1 h-px bg-champagne/10" aria-hidden />
            <span className="font-mono text-[0.44rem] tracking-widest uppercase text-smoke/40">
              {frames.length} {frames.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            {tableStatus && (
              <StatusBanner status={tableStatus} onDismiss={() => setTableStatus(null)} />
            )}
            <FramesTable
              frames={frames}
              loading={tableLoading}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          </div>
        </div>

      </section>

      {deleteTarget && (
        <DeleteConfirm
          frame={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  )
}

