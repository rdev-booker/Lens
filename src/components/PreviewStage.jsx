/**
 * PreviewStage
 * ────────────
 * Canvas-based lens preview with flood-fill mask selection.
 *
 * Layer stack (bottom → top, all absolute inset-0):
 *   0 — <img>           base product photograph
 *   1 — tintCanvas      mix-blend-mode:multiply tint layer (white = passthrough)
 *   2 — clickLayer      invisible div, cursor:crosshair, captures clicks in select mode
 *   3 — UI chrome       corner marks, badges, hint overlay
 *
 * Flood-fill strategy
 * ───────────────────
 * The product image is drawn into an offscreen canvas at CANVAS_W × CANVAS_H,
 * respecting object-fit:contain geometry. A BFS flood fill (tolerance=90,
 * max-channel distance) runs from the clicked pixel. Dark frame material
 * (Δ > 90 from a white lens) acts as a natural boundary.
 *
 * Multiply tint encoding
 * ──────────────────────
 * mix-blend-mode:multiply: result = canvas × photo / 255
 * White (255,255,255) × photo = photo → no effect on unmasked pixels.
 * We lerp between white and the tint colour to express opacity/density
 * without using canvas alpha (which misbehaves under multiply).
 */

import { useRef, useEffect, useState, useCallback } from 'react'
// useCallback retained for drawOffscreen memoisation

/* ─── Internal canvas resolution — 5:3 ─── */
const CW = 1000
const CH = 600
const TOLERANCE = 90

/* ─── Colour helpers ─── */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function lerpI(a, b, t) { return Math.round(a + (b - a) * Math.max(0, Math.min(1, t))) }

/* ─── Tint pixel calculator ─────────────────────────────────────────────────
   Returns the canvas RGB for a masked pixel at normalised Y (0=top, 1=bottom).
   All values are [0–255]; alpha is always 255 (fully opaque).
   Lerping toward white reduces the multiply effect = "lower opacity".
─────────────────────────────────────────────────────────────────────────── */
function getTintRgb(ny, config) {
  const d = config.density ?? 0.5

  if (config.lensType === 'solid') {
    const c = hexToRgb(config.color)
    return { r: lerpI(255, c.r, d), g: lerpI(255, c.g, d), b: lerpI(255, c.b, d) }
  }

  if (config.lensType === 'gradient') {
    // density × (1 – t): full density at top, fades to clear at bottom
    const c = hexToRgb(config.color)
    const o = d * (1 - ny)
    return { r: lerpI(255, c.r, o), g: lerpI(255, c.g, o), b: lerpI(255, c.b, o) }
  }

  if (config.lensType === 'bigradient') {
    // smooth RGB lerp from top to bottom colour at full density — no clear gap
    const top = hexToRgb(config.color)
    const bot = hexToRgb(config.bottomColor)
    const tr  = lerpI(top.r, bot.r, ny)
    const tg  = lerpI(top.g, bot.g, ny)
    const tb  = lerpI(top.b, bot.b, ny)
    return { r: lerpI(255, tr, d), g: lerpI(255, tg, d), b: lerpI(255, tb, d) }
  }

  return { r: 255, g: 255, b: 255 }
}

/* ─── BFS flood fill ────────────────────────────────────────────────────────
   Reads pixel data from the offscreen canvas context.
   Returns Uint8Array mask (1 = included, 0 = excluded).
─────────────────────────────────────────────────────────────────────────── */
function floodFill(ctx, startX, startY) {
  const imgData = ctx.getImageData(0, 0, CW, CH)
  const { data } = imgData
  const N     = CW * CH
  const mask  = new Uint8Array(N)
  const vis   = new Uint8Array(N)

  const sx = Math.max(0, Math.min(CW - 1, Math.round(startX)))
  const sy = Math.max(0, Math.min(CH - 1, Math.round(startY)))
  const si = (sy * CW + sx) * 4
  const sR = data[si], sG = data[si + 1], sB = data[si + 2]

  // Typed-array queue — each pixel pushed at most once
  const qX = new Int16Array(N)
  const qY = new Int16Array(N)
  let head = 0, tail = 0

  const enq = (x, y) => {
    const p = y * CW + x
    if (vis[p]) return
    vis[p] = 1
    qX[tail] = x; qY[tail] = y; tail++
  }

  enq(sx, sy)

  while (head < tail) {
    const x = qX[head], y = qY[head]; head++
    const p   = y * CW + x
    const idx = p * 4
    if (
      Math.max(
        Math.abs(data[idx]     - sR),
        Math.abs(data[idx + 1] - sG),
        Math.abs(data[idx + 2] - sB),
      ) > TOLERANCE
    ) continue

    mask[p] = 1
    if (x > 0)       enq(x - 1, y)
    if (x < CW - 1)  enq(x + 1, y)
    if (y > 0)       enq(x, y - 1)
    if (y < CH - 1)  enq(x, y + 1)
  }

  return mask
}

/* ─── Canvas tint renderer ──────────────────────────────────────────────────
   Writes a fully-opaque RGBA ImageData to the tint canvas.
   Masked pixels get the tint colour; unmasked pixels get white (no effect).
─────────────────────────────────────────────────────────────────────────── */
function renderTint(tintCtx, leftMask, rightMask, config) {
  const N       = CW * CH
  const imgData = tintCtx.createImageData(CW, CH)
  const { data } = imgData

  // Default all pixels to white
  for (let i = 0; i < N; i++) {
    const o = i * 4
    data[o] = data[o + 1] = data[o + 2] = data[o + 3] = 255
  }

  if (!leftMask && !rightMask) { tintCtx.putImageData(imgData, 0, 0); return }

  // Merge masks & compute gradient bounding box
  let yMin = CH, yMax = 0
  const combined = new Uint8Array(N)
  if (leftMask)  leftMask.forEach( (v, i) => { if (v) { combined[i] = 1; const y = Math.floor(i / CW); if (y < yMin) yMin = y; if (y > yMax) yMax = y } })
  if (rightMask) rightMask.forEach((v, i) => { if (v) { combined[i] = 1; const y = Math.floor(i / CW); if (y < yMin) yMin = y; if (y > yMax) yMax = y } })

  const yRange = yMax - yMin || 1

  for (let i = 0; i < N; i++) {
    if (!combined[i]) continue
    const y  = Math.floor(i / CW)
    const ny = (y - yMin) / yRange
    const { r, g, b } = getTintRgb(ny, config)
    const o = i * 4
    data[o] = r; data[o + 1] = g; data[o + 2] = b  // data[o+3] stays 255
  }

  tintCtx.putImageData(imgData, 0, 0)
}

/* ─── Per-frame lens seed points (1000 × 600 canvas space) ─── */
const LENS_SEEDS = {
  'dita-monolix':  { left: [260, 310], right: [740, 310] },
  'masunaga-tona': { left: [265, 310], right: [735, 310] },
  'cazal-6018':    { left: [295, 298], right: [705, 298] },
}

/* ═══════════════════════════════════════════════════════════════
   PREVIEW STAGE
═══════════════════════════════════════════════════════════════ */
export default function PreviewStage({ frame, config, activeTypeName }) {
  const imgRef        = useRef(null)
  const offscreenRef  = useRef(null)   // hidden — pixel source for flood fill
  const tintCanvasRef = useRef(null)   // visible tint layer

  const [imageLoaded, setImageLoaded] = useState(false)
  const [masks,       setMasks]       = useState({ left: null, right: null })
  const [cleared,     setCleared]     = useState(false)

  /* ── Draw image into offscreen canvas then auto-fill both lenses ── */
  const drawOffscreen = useCallback(() => {
    const img = imgRef.current
    if (!img?.naturalWidth) return
    const osc = offscreenRef.current
    const ctx = osc.getContext('2d', { willReadFrequently: true })
    ctx.clearRect(0, 0, CW, CH)

    const ia = img.naturalWidth / img.naturalHeight
    const ca = CW / CH
    let dw, dh, dx, dy
    if (ia > ca) { dh = CH;  dw = CH * ia; dx = (CW - dw) / 2; dy = 0            }
    else          { dw = CW;  dh = CW / ia; dx = 0;             dy = (CH - dh) / 2 }

    ctx.drawImage(img, dx, dy, dw, dh)

    // Auto flood-fill both lenses using predefined seed points
    const seeds = LENS_SEEDS[frame.id] ?? LENS_SEEDS['dita-monolix']
    const leftMask  = floodFill(ctx, seeds.left[0],  seeds.left[1])
    const rightMask = floodFill(ctx, seeds.right[0], seeds.right[1])
    setMasks({ left: leftMask, right: rightMask })
    setImageLoaded(true)
  }, [frame.id])

  /* ── Re-render tint whenever masks, config or cleared state change ── */
  useEffect(() => {
    const ctx = tintCanvasRef.current?.getContext('2d')
    if (ctx) renderTint(ctx, cleared ? null : masks.left, cleared ? null : masks.right, config)
  }, [masks, config, cleared])

  /* ── Any config change after clearing re-enables the tint ── */
  const prevConfigRef = useRef(config)
  useEffect(() => {
    if (cleared && config !== prevConfigRef.current) setCleared(false)
    prevConfigRef.current = config
  }, [config, cleared])

  /* ── Reset state when a new frame is selected ── */
  useEffect(() => {
    setMasks({ left: null, right: null })
    setImageLoaded(false)
    const ctx = tintCanvasRef.current?.getContext('2d')
    if (ctx) { ctx.clearRect(0, 0, CW, CH) }
  }, [frame.id])

  /* ── Re-run auto-fill if image was already cached (onLoad won't fire) ── */
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth) drawOffscreen()
  }, [frame.id, drawOffscreen])

  const clearLenses = () => setCleared(true)

  return (
    <div className="flex flex-col gap-4">

      {/* Stage meta row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.5rem] tracking-widest3 uppercase text-smoke">
            Live Preview
          </span>
          <span className="w-8 h-px bg-champagne/25" aria-hidden />
        </div>
        <span className="font-mono text-[0.44rem] tracking-widest2 uppercase text-smoke/30 hidden sm:block">
          Canvas · multiply
        </span>
      </div>

      {/* ── Viewport ──────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden bg-[#F7F5F2]
                   border border-champagne/10 shadow-2xl"
        style={{ aspectRatio: '5 / 3', isolation: 'isolate' }}
      >
        {/* Corner decorative frame */}
        {[
          'top-0 left-0  border-t-2 border-l-2',
          'top-0 right-0 border-t-2 border-r-2',
          'bottom-0 left-0  border-b-2 border-l-2',
          'bottom-0 right-0 border-b-2 border-r-2',
        ].map((cls, i) => (
          <span
            key={i}
            className={`absolute ${cls} w-6 h-6 z-30 border-champagne/30 pointer-events-none`}
            aria-hidden
          />
        ))}

        {/* Base photograph — layer 0 */}
        <img
          ref={imgRef}
          src={frame.image}
          alt={`${frame.name} ${frame.model}`}
          className="absolute inset-0 w-full h-full z-0"
          style={{ objectFit: 'cover' }}
          draggable={false}
          onLoad={drawOffscreen}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />

        {/* Offscreen canvas — hidden, used only for flood fill pixel reads */}
        <canvas ref={offscreenRef} width={CW} height={CH} className="sr-only" aria-hidden />

        {/* Tint canvas — layer 1, mix-blend-mode: multiply */}
        <canvas
          ref={tintCanvasRef}
          width={CW}
          height={CH}
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
          aria-hidden
        />

        {/* Frame name + ref badge — bottom left, layer 3 */}
        <div className="absolute bottom-3 left-3 z-30 glass-card px-3 py-2 pointer-events-none">
          <p className="font-mono text-[0.58rem] tracking-widest2 uppercase text-pearl leading-none">
            {frame.name}{' '}
            <span style={{ color: '#C9A96E' }}>{frame.model}</span>
          </p>
          <p className="font-mono text-[0.4rem] tracking-widest2 uppercase text-smoke/70 mt-1">
            {frame.ref}
          </p>
        </div>

        {/* Lens type badge — bottom right, layer 3 */}
        <div className="absolute bottom-3 right-3 z-30 glass-card px-2.5 py-1 pointer-events-none">
          <span className="font-mono text-[0.44rem] tracking-widest2 uppercase text-champagne">
            {activeTypeName}
          </span>
        </div>
      </div>

      {/* ── Clear button ─────────── */}
      <div className="flex justify-end">
        <button
          onClick={clearLenses}
          disabled={!masks.left && !masks.right}
          className={[
            'px-4 py-2 font-mono text-[0.47rem] tracking-widest2 uppercase',
            'border transition-all duration-300',
            (masks.left || masks.right)
              ? 'border-champagne/15 text-smoke/55 hover:border-champagne/30 hover:text-smoke'
              : 'border-champagne/8 text-smoke/20 cursor-not-allowed',
          ].join(' ')}
        >
          Clear Lenses
        </button>
      </div>
    </div>
  )
}
