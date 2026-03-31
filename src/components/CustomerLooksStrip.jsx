import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Horizontal strip of approved customer look photos for a given frame.
 * Renders nothing if there are no approved looks yet.
 */
export default function CustomerLooksStrip({ frameId }) {
  const [looks,   setLooks]   = useState([])
  const [lightbox, setLightbox] = useState(null) // index of open photo

  useEffect(() => {
    if (!frameId) return
    supabase
      .from('customer_looks')
      .select('id, image_url')
      .eq('frame_id', frameId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setLooks(data ?? []))
  }, [frameId])

  if (!looks.length) return null

  return (
    <>
      <div className="border border-champagne/10 bg-charcoal/30 px-5 py-4">

        {/* Label row */}
        <div className="flex items-center gap-3 mb-3">
          <p className="font-mono text-[0.46rem] tracking-widest3 uppercase text-champagne">
            Customer Looks
          </p>
          <span className="flex-1 h-px bg-champagne/10" aria-hidden />
          <span className="font-mono text-[0.4rem] tracking-widest2 uppercase text-smoke/40">
            {looks.length} {looks.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>

        {/* Scrollable photo row */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {looks.map((look, i) => (
            <button
              key={look.id}
              onClick={() => setLightbox(i)}
              className="shrink-0 w-20 h-20 overflow-hidden border border-champagne/10
                         hover:border-champagne/40 transition-colors duration-300 focus-visible:outline
                         focus-visible:outline-1 focus-visible:outline-champagne"
              aria-label="View customer photo"
            >
              <img
                src={look.image_url}
                alt="Customer look"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/92 backdrop-blur-sm px-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img
              src={looks[lightbox].image_url}
              alt="Customer look"
              className="w-full max-h-[80vh] object-contain"
            />

            {/* Nav arrows */}
            {looks.length > 1 && (
              <>
                <button
                  onClick={() => setLightbox(i => (i - 1 + looks.length) % looks.length)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10
                             font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke/60
                             hover:text-champagne transition-colors duration-200 p-2"
                  aria-label="Previous"
                >‹</button>
                <button
                  onClick={() => setLightbox(i => (i + 1) % looks.length)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10
                             font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke/60
                             hover:text-champagne transition-colors duration-200 p-2"
                  aria-label="Next"
                >›</button>
              </>
            )}

            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center
                         bg-obsidian/70 border border-champagne/20 text-smoke/60
                         hover:text-champagne hover:border-champagne/50 transition-colors duration-200
                         font-mono text-[0.6rem]"
              aria-label="Close"
            >✕</button>

            {/* Counter */}
            <p className="mt-2 text-center font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/40">
              {lightbox + 1} / {looks.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
