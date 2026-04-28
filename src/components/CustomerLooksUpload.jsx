import { useState } from 'react'
import { supabase, uploadCustomerPhoto } from '../lib/supabaseClient'

/**
 * Modal for customers to submit a photo wearing a specific frame.
 * No authentication required — inserts with is_approved: false.
 *
 * Props:
 *   frame   — { id, name, sub } frame object
 *   onClose — callback to close the modal
 */
export default function CustomerLooksUpload({ frame, onClose }) {
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [status,  setStatus]  = useState('idle') // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState(null)

  const handleFile = e => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStatus('idle')
    setErrorMsg(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) return

    setStatus('uploading')
    setErrorMsg(null)

    try {
      const image_url = await uploadCustomerPhoto(file)

      const { error } = await supabase
        .from('customer_looks')
        .insert({ frame_id: frame.id, image_url, is_approved: false })

      if (error) throw error

      await supabase.rpc('mark_frame_customer_upload', { p_frame_id: frame.id })

      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm border border-champagne/15 bg-charcoal flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-7 py-5 border-b border-champagne/10 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-mono text-[0.44rem] tracking-widest3 uppercase text-champagne mb-0.5">
              Submit Your Look
            </p>
            <p className="font-sans text-[0.78rem] text-smoke/60">
              {frame.name}
              {frame.sub ? <span className="text-smoke/40"> — {frame.sub}</span> : null}
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/40 hover:text-silver transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {status === 'success' ? (
          <div className="px-7 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-10 h-10 rounded-full border border-champagne/30 flex items-center justify-center">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
                <polyline points="1,6 6,11 15,1" stroke="#C9A96E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-display font-light text-[1.4rem] text-pearl leading-tight">
              Thank you.
            </p>
            <p className="font-mono text-[0.48rem] tracking-wider uppercase text-smoke/55 leading-relaxed">
              Your photo is under review and will appear once approved.
            </p>
            <button
              onClick={onClose}
              className="mt-2 font-mono text-[0.48rem] tracking-widest2 uppercase text-champagne/70 hover:text-champagne transition-colors duration-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">

            {/* Upload zone */}
            <div>
              <p className="font-mono text-[0.46rem] tracking-widest2 uppercase text-smoke/60 mb-2">
                Your Photo
              </p>

              {preview ? (
                <div className="relative w-full overflow-hidden border border-champagne/15 mb-2" style={{ aspectRatio: '4/3' }}>
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setFile(null); setPreview(null) }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center
                               bg-obsidian/70 border border-champagne/20 text-smoke/60
                               hover:text-champagne transition-colors duration-200 font-mono text-[0.55rem]"
                    aria-label="Remove photo"
                  >✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2.5 w-full py-8
                                   border border-dashed border-champagne/20 cursor-pointer
                                   hover:border-champagne/40 transition-colors duration-300">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="9.5" stroke="#C9A96E" strokeWidth="1.2" strokeOpacity="0.5"/>
                    <path d="M11 7v8M7 11h8" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span className="font-mono text-[0.46rem] tracking-widest2 uppercase text-smoke/50">
                    Select a photo
                  </span>
                  <span className="font-mono text-[0.4rem] tracking-wider uppercase text-smoke/30">
                    JPG, PNG, WEBP
                  </span>
                  <input type="file" accept="image/*" onChange={handleFile} className="sr-only" required />
                </label>
              )}
            </div>

            {errorMsg && (
              <div className="border border-red-400/20 bg-red-400/[0.04] px-4 py-3">
                <p className="font-mono text-[0.46rem] tracking-wider uppercase text-red-400/70">{errorMsg}</p>
              </div>
            )}

            <p className="font-mono text-[0.42rem] tracking-wider uppercase text-smoke/35 leading-relaxed">
              Photos are reviewed before appearing on the site.
            </p>

            <button
              type="submit"
              disabled={!file || status === 'uploading'}
              className="relative inline-flex items-center justify-center
                         px-6 py-3.5 bg-champagne text-obsidian
                         font-sans text-[0.62rem] tracking-widest2 uppercase
                         overflow-hidden group transition-colors duration-400
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-[#e8c98a] translate-x-[-101%]
                               group-hover:translate-x-0 transition-transform duration-400 ease-luxury" />
              <span className="relative">
                {status === 'uploading' ? 'Uploading…' : 'Submit Look'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
