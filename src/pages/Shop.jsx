import { useState, useReducer, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PreviewStage from '../components/PreviewStage'
import LensControls, { TINTS } from '../components/LensControls'
import { supabase } from '../lib/supabaseClient'

/* ═══════════════════════════════════════════════════════════════
   LENS CONFIG STATE
═══════════════════════════════════════════════════════════════ */
const DEFAULT_CONFIG = {
  lensType:    'solid',
  color:       '#1E3A5F',   // solid colour / gradient top colour
  bottomColor: '#1B6B4A',   // bi-gradient bottom colour
  density:     0.50,        // 0.05 – 0.95
}

function configReducer(state, action) {
  return { ...state, ...action }
}

/* ═══════════════════════════════════════════════════════════════
   LENS TYPE TABS
═══════════════════════════════════════════════════════════════ */
const LENS_TYPES = [
  { id: 'solid',      label: 'Solid Tint',  complexity: 'Low'    },
  { id: 'gradient',   label: 'Gradient',    complexity: 'Medium' },
  { id: 'bigradient', label: 'Bi-Gradient', complexity: 'High'   },
]

function LensTypeTab({ type, active, onClick }) {
  return (
    <button
      onClick={() => onClick(type.id)}
      className={[
        'relative flex flex-col items-center gap-1.5 px-4 py-3 border transition-all duration-300',
        active
          ? 'border-champagne text-champagne'
          : 'border-champagne/15 text-smoke hover:border-champagne/40 hover:text-silver',
      ].join(' ')}
    >
      <span className="font-sans text-[0.65rem] tracking-widest2 uppercase font-medium">
        {type.label}
      </span>
      <span className={`font-mono text-[0.44rem] tracking-wider uppercase ${
        active ? 'text-champagne/60' : 'text-smoke/40'
      }`}>
        {type.complexity}
      </span>
      {active && <span className="absolute bottom-0 inset-x-0 h-px bg-champagne" />}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SPEC ROW
═══════════════════════════════════════════════════════════════ */
function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-champagne/8">
      <span className="font-mono text-[0.52rem] tracking-widest2 uppercase text-smoke">{label}</span>
      <span className="font-sans text-[0.78rem] text-silver">{value}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FRAME CARD — 5:3 aspect ratio, object-fit: contain
═══════════════════════════════════════════════════════════════ */
function FrameCard({ frame, onClick, featured = false }) {
  return (
    <button
      onClick={() => onClick(frame)}
      className="group relative flex flex-col text-left w-full
                 focus-visible:outline focus-visible:outline-1
                 focus-visible:outline-champagne"
      aria-label={`Customise lenses for ${frame.name} ${frame.model}`}
    >
      {/* ── Image container — fixed 5:3 ratio ── */}
      <div className="relative w-full overflow-hidden bg-[#F7F5F2]"
           style={{ aspectRatio: '5 / 3' }}>

        {/* Placeholder shown when image is absent — sits beneath the photo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center
                        pointer-events-none select-none z-0">
          <svg viewBox="0 0 500 300" className="w-3/4 opacity-10" aria-hidden>
            {frame.id === 'masunaga-tona' ? (
              /* oval lens silhouette */
              <>
                <ellipse cx="140" cy="150" rx="100" ry="80"
                         fill="none" stroke="#AEAEB2" strokeWidth="6" />
                <ellipse cx="360" cy="150" rx="100" ry="80"
                         fill="none" stroke="#AEAEB2" strokeWidth="6" />
                <line x1="240" y1="150" x2="260" y2="150"
                      stroke="#AEAEB2" strokeWidth="4" />
              </>
            ) : frame.id === 'cazal-6018' ? (
              /* angular shield lens silhouette */
              <>
                <polygon points="30,80 220,80 230,120 220,220 30,220 20,180"
                         fill="none" stroke="#AEAEB2" strokeWidth="6" />
                <polygon points="270,80 460,80 480,180 470,220 280,220 270,120"
                         fill="none" stroke="#AEAEB2" strokeWidth="6" />
              </>
            ) : (
              /* rectangular lens silhouette (DITA MONOLIX) */
              <>
                <rect x="20" y="80" width="200" height="140" rx="10"
                      fill="none" stroke="#AEAEB2" strokeWidth="6" />
                <rect x="280" y="80" width="200" height="140" rx="10"
                      fill="none" stroke="#AEAEB2" strokeWidth="6" />
                <line x1="220" y1="150" x2="280" y2="150"
                      stroke="#AEAEB2" strokeWidth="4" />
              </>
            )}
          </svg>
          <p className="font-mono text-[0.48rem] tracking-widest2 uppercase text-smoke/30 mt-3">
            {frame.name} {frame.model}
          </p>
        </div>

        {/* Product photo — z-10 so it sits above the placeholder */}
        <img
          src={frame.image}
          alt={`${frame.name} ${frame.model}`}
          className="absolute inset-0 w-full h-full z-10
                     transition-transform duration-700 ease-luxury
                     group-hover:scale-[1.03]"
          style={{ objectFit: 'cover' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />

        {/* Corner marks — z-20 so they clear the photo */}
        {[
          'top-3 left-3  border-t border-l',
          'top-3 right-3 border-t border-r',
          'bottom-3 left-3  border-b border-l',
          'bottom-3 right-3 border-b border-r',
        ].map((cls, i) => (
          <span
            key={i}
            className={`absolute ${cls} w-4 h-4 z-20 border-champagne/25
                        transition-colors duration-300 group-hover:border-champagne/60`}
            aria-hidden
          />
        ))}

        {/* "Customise Lenses" hover overlay — z-20 */}
        <div
          className="absolute inset-0 z-20 flex items-center justify-center
                     bg-obsidian/60 backdrop-blur-[2px]
                     opacity-0 group-hover:opacity-100
                     transition-opacity duration-400"
        >
          <div className="flex flex-col items-center gap-3">
            {/* Icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <circle cx="14" cy="14" r="12" stroke="#C9A96E" strokeWidth="1.2" />
              <circle cx="14" cy="14" r="5" stroke="#C9A96E" strokeWidth="1.2" />
              <line x1="14" y1="2" x2="14" y2="8"  stroke="#C9A96E" strokeWidth="1.2" />
              <line x1="14" y1="20" x2="14" y2="26" stroke="#C9A96E" strokeWidth="1.2" />
              <line x1="2" y1="14" x2="8" y2="14"   stroke="#C9A96E" strokeWidth="1.2" />
              <line x1="20" y1="14" x2="26" y2="14"  stroke="#C9A96E" strokeWidth="1.2" />
            </svg>
            <span className="font-mono text-[0.58rem] tracking-widest3 uppercase text-champagne">
              Customise Lenses
            </span>
          </div>
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1 glass-card">
            <span className="font-mono text-[0.44rem] tracking-widest3 uppercase text-champagne">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* ── Card footer ── */}
      <div className="bg-charcoal border border-t-0 border-champagne/10 px-5 py-4">

        {/* Row 1 — maison tag + ref */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[0.48rem] tracking-widest3 uppercase text-champagne">
            {frame.maison}
          </span>
          <span className="font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke">
            Ref. {frame.ref}
          </span>
        </div>

        {/* Row 2 — frame name + model */}
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-display font-light text-[1.35rem] leading-none text-pearl
                        group-hover:text-champagne transition-colors duration-400">
            {frame.name}{' '}
            <em className="font-display italic">{frame.model}</em>
          </p>
          {/* Arrow hint */}
          <svg
            width="16" height="10" viewBox="0 0 16 10" fill="none"
            className="shrink-0 text-smoke/40 group-hover:text-champagne
                       group-hover:translate-x-1 transition-all duration-400"
            aria-hidden
          >
            <line x1="0" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.2"/>
            <polyline points="9,1 14,5 9,9" stroke="currentColor" strokeWidth="1.2"
                      fill="none" strokeLinejoin="round"/>
          </svg>
        </div>

      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FRAME SELECTION VIEW
═══════════════════════════════════════════════════════════════ */
function FrameSelector({ onSelect }) {
  const [frames, setFrames]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    supabase
      .from('frames')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          // Map Supabase column names to the shape components expect:
          //   src  → image   (product photo URL)
          //   sub  → model   (variant / colorway shown as the model name)
          setFrames(
            data.map(row => ({
              ...row,
              image: row.src,
              model: row.sub ?? '',
            }))
          )
        }
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main className="bg-obsidian min-h-screen pt-20 flex items-center justify-center">
        <p className="font-mono text-[0.6rem] tracking-widest3 uppercase text-smoke animate-pulse">
          Loading frames…
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="bg-obsidian min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-[0.6rem] tracking-widest2 uppercase text-champagne/60 mb-2">
            Unable to load frames
          </p>
          <p className="font-sans text-[0.8rem] text-smoke/70">{error}</p>
        </div>
      </main>
    )
  }

  const featured  = frames.find(f => f.featured)
  const secondary = frames.filter(f => !f.featured)

  return (
    <main className="bg-obsidian min-h-screen pt-20">

      {/* ── Section header ── */}
      <section className="pt-16 pb-10 lg:pt-20 lg:pb-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h1 className="font-display font-light
                         text-[clamp(3rem,7vw,6rem)]
                         leading-[0.95] tracking-tight text-pearl">
            Select Your Frame
          </h1>
        </div>
      </section>

      {/* ── Frame grid ── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14 lg:py-20">

        {/* Featured — full width */}
        {featured && (
          <div className="mb-6">
            <FrameCard frame={featured} onClick={onSelect} featured />
          </div>
        )}

        {/* Secondary — side by side */}
        {secondary.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {secondary.map(frame => (
              <FrameCard key={frame.id} frame={frame} onClick={onSelect} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {frames.length === 0 && (
          <p className="font-mono text-[0.6rem] tracking-widest2 uppercase text-smoke/50 text-center py-20">
            No frames available at this time.
          </p>
        )}
      </section>
    </main>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CONFIGURATION SUMMARY
═══════════════════════════════════════════════════════════════ */
const LENS_TYPE_LABELS = {
  solid:       'Solid Tint',
  gradient:    'Gradient',
  bigradient:  'Bi-Gradient',
}

function ConfigSummary({ frame, config }) {
  const tint       = TINTS.find(t => t.hex.toLowerCase() === config.color.toLowerCase())
  const bottomTint = TINTS.find(t => t.hex.toLowerCase() === (config.bottomColor ?? '').toLowerCase())
  const transmission = 100 - Math.round(config.density * 100)
  const styleLabel   = LENS_TYPE_LABELS[config.lensType] ?? config.lensType

  const rows = [
    {
      label: 'Frame',
      value: (
        <span>
          {frame.name}{' '}
          <span style={{ color: '#C9A96E' }}>{frame.model}</span>
          <span className="text-smoke/50 ml-2">{frame.ref}</span>
        </span>
      ),
    },
    {
      label: 'Style',
      value: styleLabel,
    },
    {
      label: config.lensType === 'bigradient' ? 'Top Colour' : 'Colour',
      value: (
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full border border-champagne/20 shrink-0"
            style={{ backgroundColor: config.color }}
          />
          <span>{tint ? tint.name : config.color}</span>
          <span className="text-smoke/50">{config.color}</span>
        </span>
      ),
    },
    ...(config.lensType === 'bigradient' ? [{
      label: 'Bottom Colour',
      value: (
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full border border-champagne/20 shrink-0"
            style={{ backgroundColor: config.bottomColor }}
          />
          <span>{bottomTint ? bottomTint.name : config.bottomColor}</span>
          <span className="text-smoke/50">{config.bottomColor}</span>
        </span>
      ),
    }] : []),
    {
      label: 'Density',
      value: (
        <span>
          {Math.round(config.density * 100)}%
          <span className="text-smoke/50 ml-2">— {transmission}% light transmission</span>
        </span>
      ),
    },
  ]

  return (
    <div className="border border-champagne/10 bg-charcoal/40">
      <div className="px-5 py-3 border-b border-champagne/10 flex items-center gap-3">
        <span className="font-mono text-[0.5rem] tracking-widest3 uppercase text-champagne">
          Configuration
        </span>
        <span className="flex-1 h-px bg-champagne/10" aria-hidden />
      </div>
      <div className="divide-y divide-champagne/8">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-baseline justify-between gap-6 px-5 py-3">
            <span className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke shrink-0 w-24">
              {label}
            </span>
            <span className="font-sans text-[0.78rem] text-silver text-right">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LENS CUSTOMISER VIEW
═══════════════════════════════════════════════════════════════ */
function LensCustomiser({ frame, onBack }) {
  const [config, dispatch] = useReducer(configReducer, DEFAULT_CONFIG)

  const setLensType  = lensType  => dispatch({ lensType })
  const updateConfig = patch     => dispatch(patch)
  const activeType   = LENS_TYPES.find(t => t.id === config.lensType)

  // Scroll to top when customiser mounts
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  return (
    <main className="bg-obsidian min-h-screen pt-20">
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 lg:py-14">

        {/* ══════════════════════════════════════════════════
            Two-column layout
            Left  — live preview stage + specs
            Right — tint controls panel
        ══════════════════════════════════════════════════ */}
        <div className="grid xl:grid-cols-[1fr_400px] gap-10 lg:gap-14 items-start">

          {/* ── LEFT: Live Preview Stage ── */}
          <div className="flex flex-col gap-6">
            <PreviewStage
              frame={frame}
              config={config}
              activeTypeName={activeType.label}
            />

            {/* Configuration summary */}
            <ConfigSummary frame={frame} config={config} />
          </div>

          {/* ── RIGHT: Tint Controls Panel ── */}
          <aside className="flex flex-col gap-7">

            {/* Choose Different Frame — above the heading */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 w-fit
                         font-mono text-[0.52rem] tracking-widest2 uppercase
                         text-smoke hover:text-champagne transition-colors duration-300 group"
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden
                   className="group-hover:-translate-x-0.5 transition-transform duration-300">
                <line x1="14" y1="5" x2="1" y2="5" stroke="currentColor" strokeWidth="1.2"/>
                <polyline points="6,1 1,5 6,9" stroke="currentColor" strokeWidth="1.2"
                          fill="none" strokeLinejoin="round"/>
              </svg>
              Choose Different Frame
            </button>

            {/* Heading */}
            <div className="-mt-2">
              <p className="font-mono text-[0.5rem] tracking-widest3 uppercase text-champagne mb-2">
                Lens Configuration
              </p>
              <h2 className="font-display font-light text-[1.9rem] leading-tight text-pearl">
                {frame.name}{' '}
                <em className="font-display italic text-gold-shimmer">{frame.model}</em>
              </h2>
            </div>

            {/* Thin divider */}
            <span className="block h-px bg-champagne/10" aria-hidden />

            {/* Lens type selector */}
            <div>
              <p className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke mb-3">
                Lens Type
              </p>
              <div className="grid grid-cols-3 gap-2">
                {LENS_TYPES.map(type => (
                  <LensTypeTab
                    key={type.id}
                    type={type}
                    active={config.lensType === type.id}
                    onClick={setLensType}
                  />
                ))}
              </div>
            </div>

            {/* Dynamic tint controls */}
            <div className="glass-card p-5">
              <p className="font-mono text-[0.5rem] tracking-widest3 uppercase text-champagne mb-5">
                {activeType.label} — Settings
              </p>
              <LensControls config={config} onChange={updateConfig} />
            </div>

            {/* Compositing note */}
            <div className="border-l-2 border-champagne/20 pl-4">
              <p className="font-mono text-[0.47rem] leading-[1.9] tracking-wider text-smoke/70">
                <strong className="text-champagne/70 font-medium">How it works.</strong>{' '}
                The SVG tint is composited via{' '}
                <span className="text-silver/75">mix-blend-mode: multiply</span>. Every
                highlight and reflection in the base photo survives — colour is woven
                into the light, not painted over it.
              </p>
            </div>

            {/* Reset */}
            <button
              onClick={() => dispatch(DEFAULT_CONFIG)}
              className="font-mono text-[0.5rem] tracking-widest2 uppercase text-left
                         text-smoke/35 hover:text-smoke transition-colors duration-300"
            >
              ↺ Reset to defaults
            </button>

            <span className="block h-px bg-champagne/10" aria-hidden />

            {/* Book appointment CTA */}
            <div className="flex flex-col gap-3">
              <Link
                to="/contact"
                className="relative inline-flex items-center justify-center
                           px-8 py-4 bg-champagne text-obsidian
                           font-sans text-[0.65rem] tracking-widest2 uppercase
                           overflow-hidden group"
              >
                <span className="absolute inset-0 bg-[#e8c98a] translate-x-[-101%]
                                 group-hover:translate-x-0 transition-transform duration-400 ease-luxury" />
                <span className="relative">Request this Configuration</span>
              </Link>
              <p className="font-mono text-[0.46rem] tracking-wider text-smoke/45 text-center">
                Bring your configuration — we'll build it precisely.
              </p>
            </div>

          </aside>
        </div>
      </section>
    </main>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ROOT SHOP PAGE — switches between the two views
═══════════════════════════════════════════════════════════════ */
export default function Shop() {
  const [selectedFrame, setSelectedFrame] = useState(null)

  // Clicking a card → immediate transition to customiser
  const handleSelect = frame => setSelectedFrame(frame)
  const handleBack   = ()    => setSelectedFrame(null)

  if (selectedFrame) {
    return <LensCustomiser frame={selectedFrame} onBack={handleBack} />
  }

  return <FrameSelector onSelect={handleSelect} />
}
