/**
 * LensSVGOverlay
 * ──────────────
 * Absolutely-positioned SVG tint layer composited over the base photo.
 * mix-blend-mode: multiply — preserves highlights, reflections, glass texture.
 *
 * Opacity rule: NEVER set on the <svg> element. Controlled per-path via
 * fillOpacity (solid) and stop-opacity (gradients) so multiply interacts
 * with each pixel independently rather than washing the whole layer out.
 *
 * Per-frame paths are expressed in a shared 1200 × 630 viewBox.
 * Trace exact coordinates from production photos in Figma / Inkscape.
 */

/* ─────────────────────────────────────────────────────────────────
   Lens paths — 1200 × 630 viewBox coordinate space
───────────────────────────────────────────────────────────────── */

// DITA MONOLIX — wide rectangular frame, slight rounded trapezoid
const PATHS_DITA_MONOLIX = {
  left: `M 172,218 C 172,207 181,202 192,202 L 514,202
         C 525,202 530,207 530,218 L 530,388
         C 530,399 521,406 510,406 L 190,406
         C 179,406 172,399 172,388 Z`,
  right: `M 670,218 C 670,207 679,202 690,202 L 1012,202
          C 1023,202 1028,207 1028,218 L 1028,388
          C 1028,399 1019,406 1008,406 L 688,406
          C 677,406 670,399 670,388 Z`,
}

// Masunaga TONA — refined oval/keyhole lens, acetate frame
const PATHS_MASUNAGA_TONA = {
  left: `M 340,215 C 340,215 210,218 190,270
         C 170,322 185,382 250,400
         C 315,418 430,408 470,360
         C 510,312 490,238 450,218
         C 420,202 370,210 340,215 Z`,
  right: `M 860,215 C 860,215 730,218 710,270
          C 690,322 705,382 770,400
          C 835,418 950,408 990,360
          C 1030,312 1010,238 970,218
          C 940,202 890,210 860,215 Z`,
}

// Cazal MOD 6018 — bold geometric angular shield lens
const PATHS_CAZAL_6018 = {
  left: `M 158,196 L 530,196 L 540,248 L 530,404
         L 158,404 L 148,348 Z`,
  right: `M 670,196 L 1042,196 L 1052,348
          L 1042,404 L 670,404 L 660,248 Z`,
}

const FRAME_PATHS = {
  'dita-monolix':   PATHS_DITA_MONOLIX,
  'masunaga-tona':  PATHS_MASUNAGA_TONA,
  'cazal-6018':     PATHS_CAZAL_6018,
}

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */
export default function LensSVGOverlay({ config, frameId = 'dita-monolix' }) {
  const { lensType, solid, gradient, bigradient } = config

  const paths = FRAME_PATHS[frameId] ?? PATHS_DITA_MONOLIX

  const gradId   = 'lens-grad'
  const biGradId = 'lens-bigrad'

  let fill        = 'transparent'
  let fillOpacity = 1

  if (lensType === 'solid') {
    fill        = solid.color
    fillOpacity = solid.opacity
  } else if (lensType === 'gradient') {
    fill        = `url(#${gradId})`
  } else if (lensType === 'bigradient') {
    fill        = `url(#${biGradId})`
  }

  const gradTop    = gradient.density
  const gradBottom = gradient.density * 0.08

  return (
    <svg
      viewBox="0 0 1200 630"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={gradient.color} stopOpacity={gradTop} />
          <stop offset="55%"  stopColor={gradient.color} stopOpacity={gradTop * 0.55} />
          <stop offset="100%" stopColor={gradient.color} stopOpacity={gradBottom} />
        </linearGradient>

        <linearGradient id={biGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"
            stopColor={bigradient.topColor}
            stopOpacity={bigradient.opacity} />
          <stop offset={`${Math.max(0, bigradient.stopPosition - 8)}%`}
            stopColor={bigradient.topColor}
            stopOpacity={bigradient.opacity * 0.9} />
          <stop offset={`${bigradient.stopPosition}%`}
            stopColor={bigradient.bottomColor}
            stopOpacity={bigradient.opacity * 0.9} />
          <stop offset="100%"
            stopColor={bigradient.bottomColor}
            stopOpacity={bigradient.opacity} />
        </linearGradient>
      </defs>

      <path d={paths.left}  fill={fill} fillOpacity={fillOpacity} />
      <path d={paths.right} fill={fill} fillOpacity={fillOpacity} />
    </svg>
  )
}
