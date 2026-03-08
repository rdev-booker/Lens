/**
 * LensControls
 * ────────────
 * Unified tint control panel.
 *
 * Solid      — one colour picker ("Colour") + shared density
 * Gradient   — one colour picker ("Top Colour") + shared density, fades to clear
 * Bi-Gradient — two colour pickers ("Top" / "Bottom") + shared density, full RGB blend
 *
 * Density is controlled via 5 labelled presets + a continuous 5–95% slider (in sync).
 * A gradient preview strip renders the exact tint appearance above the density controls.
 */

/* ─── Colour helpers ─── */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

/* ─── Curated tint palette ─── */
export const TINTS = [
  { name: 'Sapphire',       hex: '#1E3A5F' },
  { name: 'Emerald',        hex: '#1B6B4A' },
  { name: 'Ruby',           hex: '#8B1A2B' },
  { name: 'Amber',          hex: '#B8860B' },
  { name: 'Amethyst',       hex: '#5B3A7A' },
  { name: 'Brown',          hex: '#6B4226' },
  { name: 'Grey',           hex: '#4A4A4A' },
  { name: 'Graphite Green', hex: '#3A4F3E' },
]

/* ─── Density presets ─── */
const DENSITY_PRESETS = [
  { pct: 15, label: 'Whisper' },
  { pct: 30, label: 'Light'   },
  { pct: 50, label: 'Medium'  },
  { pct: 75, label: 'Bold'    },
  { pct: 90, label: 'Opaque'  },
]

/* ─── Sub-components ─── */

function Label({ children }) {
  return (
    <span className="font-mono text-[0.55rem] tracking-widest2 uppercase text-smoke">
      {children}
    </span>
  )
}

function TintPalette({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <Label>{label}</Label>
      <div className="grid grid-cols-4 gap-x-3 gap-y-4">
        {TINTS.map(({ name, hex }) => {
          const active = value.toLowerCase() === hex.toLowerCase()
          return (
            <button
              key={hex}
              onClick={() => onChange(hex)}
              title={name}
              aria-label={`${name} — ${hex}`}
              aria-pressed={active}
              className="flex flex-col items-center gap-1.5 group focus:outline-none"
            >
              <span
                className="block w-9 h-9 rounded-full transition-all duration-200 group-hover:scale-110"
                style={{
                  backgroundColor: hex,
                  boxShadow: active
                    ? '0 0 0 2px #0A0A0A, 0 0 0 3.5px #C9A96E'
                    : '0 0 0 1px rgba(201,169,110,0.15)',
                }}
              />
              <span
                className="font-mono text-[0.45rem] tracking-wider leading-tight text-center transition-colors duration-200"
                style={{ color: active ? '#C9A96E' : '#6E6E73' }}
              >
                {name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* Gradient preview strip — shows exact rendered appearance */
function GradientPreview({ config }) {
  const { lensType, color, bottomColor, density } = config

  let background
  if (lensType === 'solid') {
    const { r, g, b } = hexToRgb(color)
    background = `rgba(${r},${g},${b},${density})`
  } else if (lensType === 'gradient') {
    const { r, g, b } = hexToRgb(color)
    background = `linear-gradient(to bottom, rgba(${r},${g},${b},${density}) 0%, rgba(${r},${g},${b},0) 100%)`
  } else {
    const t = hexToRgb(color)
    const b = hexToRgb(bottomColor)
    background = `linear-gradient(to bottom, rgba(${t.r},${t.g},${t.b},${density}) 0%, rgba(${b.r},${b.g},${b.b},${density}) 100%)`
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Preview</Label>
      <div
        className="w-full rounded-sm border border-champagne/10"
        style={{ height: '28px', background }}
      />
    </div>
  )
}

/* Density control — presets + slider, synced */
function DensityControl({ density, onChange }) {
  const pct          = Math.round(density * 100)
  const transmission = 100 - pct
  const sliderPct    = ((density - 0.05) / (0.95 - 0.05)) * 100

  return (
    <div className="flex flex-col gap-4">

      {/* Header row */}
      <div className="flex items-baseline justify-between">
        <Label>Density</Label>
        <div className="text-right">
          <span className="font-mono text-[0.88rem] text-pearl leading-none">{transmission}%</span>
          <span className="font-mono text-[0.44rem] tracking-widest uppercase text-smoke/60 ml-1.5">
            light transmission
          </span>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-1.5">
        {DENSITY_PRESETS.map(({ pct: p, label }) => {
          const active = pct === p
          return (
            <button
              key={p}
              onClick={() => onChange(p / 100)}
              className={[
                'flex-1 flex flex-col items-center gap-1 py-2 border transition-all duration-200',
                active
                  ? 'border-champagne bg-champagne/8 text-champagne'
                  : 'border-champagne/15 text-smoke hover:border-champagne/35 hover:text-silver',
              ].join(' ')}
            >
              <span className="font-mono text-[0.55rem] font-medium">{p}%</span>
              <span className="font-mono text-[0.42rem] tracking-wider uppercase leading-none">
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Continuous slider 5–95% */}
      <div className="relative h-0.5 bg-graphite rounded-full mt-1">
        <div
          className="absolute left-0 top-0 h-full bg-champagne rounded-full"
          style={{ width: `${sliderPct}%` }}
        />
        <input
          type="range"
          min={5}
          max={95}
          step={1}
          value={pct}
          onChange={e => onChange(Number(e.target.value) / 100)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
          aria-label="Density"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full
                     bg-champagne border-2 border-obsidian shadow-md pointer-events-none"
          style={{ left: `calc(${sliderPct}% - 6px)` }}
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export default function LensControls({ config, onChange }) {
  const set = patch => onChange({ ...config, ...patch })

  return (
    <div className="flex flex-col gap-6">

      {/* Colour pickers — vary by mode */}
      {config.lensType === 'solid' && (
        <TintPalette
          label="Colour"
          value={config.color}
          onChange={color => set({ color })}
        />
      )}

      {config.lensType === 'gradient' && (
        <TintPalette
          label="Top Colour"
          value={config.color}
          onChange={color => set({ color })}
        />
      )}

      {config.lensType === 'bigradient' && (
        <>
          <TintPalette
            label="Top"
            value={config.color}
            onChange={color => set({ color })}
          />
          <TintPalette
            label="Bottom"
            value={config.bottomColor}
            onChange={bottomColor => set({ bottomColor })}
          />
        </>
      )}

      {/* Gradient preview strip */}
      <GradientPreview config={config} />

      {/* Divider */}
      <span className="block h-px bg-champagne/10" aria-hidden />

      {/* Density control */}
      <DensityControl
        density={config.density}
        onChange={density => set({ density })}
      />
    </div>
  )
}
