import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* ─── Intersection-observer fade-up hook ─── */
function useFadeUp() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ─── Reusable fade-up wrapper ─── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useFadeUp()
  return (
    <div
      ref={ref}
      className={`fade-up ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  return (
    <main className="relative bg-obsidian">

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-end pb-20 overflow-hidden">

        {/* Background — deep gradient suggesting light through glass */}
        <div
          className="absolute inset-0 bg-gradient-to-br
                     from-[#0D0D0E] via-[#111113] to-[#1a1408]"
          aria-hidden
        />

        {/* Decorative radial glow — warm gold source top-right */}
        <div
          className="absolute -top-32 right-0 w-[760px] h-[760px] rounded-full
                     bg-[radial-gradient(circle,rgba(201,169,110,0.12)_0%,transparent_70%)]
                     pointer-events-none"
          aria-hidden
        />

        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]
                     bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]"
          aria-hidden
        />

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-3xl">

            {/* Eyebrow */}
            <p className="font-mono text-[0.6rem] tracking-widest3 text-champagne uppercase mb-8
                          opacity-0 animate-[fadeIn_1s_0.3s_ease_forwards]">
              Maison de Lunetterie — Est. MMXXIV
            </p>

            {/* Main headline */}
            <h1
              className="font-display font-light text-[clamp(3.2rem,8vw,7.5rem)]
                         leading-[0.92] tracking-tight text-pearl mb-8
                         opacity-0 animate-[fadeIn_1s_0.6s_ease_forwards]"
            >
              Light, Refined<br />
              <em className="text-gold-shimmer not-italic">Through Glass</em>
            </h1>

            {/* Rule */}
            <span
              className="gold-rule mb-8 opacity-0 animate-[fadeIn_1s_0.9s_ease_forwards]"
              aria-hidden
            />

            {/* Sub-copy */}
            <p
              className="font-sans font-light text-[1.05rem] leading-[1.75]
                         text-silver max-w-md mb-12
                         opacity-0 animate-[fadeIn_1s_1.1s_ease_forwards]"
            >
              Each frame is a considered object. Each lens, an act of
              craftsmanship. Discover eyewear built to be worn for a lifetime
              and remembered for generations.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-4
                         opacity-0 animate-[fadeIn_1s_1.3s_ease_forwards]"
            >
              <Link
                to="/shop"
                className="relative inline-flex items-center px-8 py-3.5
                           bg-champagne text-obsidian
                           font-sans text-[0.68rem] tracking-widest2 uppercase
                           overflow-hidden group transition-colors duration-400"
              >
                <span
                  className="absolute inset-0 bg-[#e8c98a] translate-x-[-101%]
                             group-hover:translate-x-0 transition-transform duration-400 ease-luxury"
                />
                <span className="relative">Enter the Atelier</span>
              </Link>

              <Link
                to="/philosophy"
                className="inline-flex items-center px-8 py-3.5
                           border border-silver/40 text-silver
                           font-sans text-[0.68rem] tracking-widest2 uppercase
                           hover:border-champagne hover:text-champagne
                           transition-colors duration-400"
              >
                Our Philosophy
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
                        opacity-0 animate-[fadeIn_1s_1.8s_ease_forwards]">
          <span className="font-mono text-[0.5rem] tracking-widest3 text-smoke uppercase">Scroll</span>
          <span className="w-px h-8 bg-gradient-to-b from-smoke to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          EDITORIAL STRIP — "The Object"
      ═══════════════════════════════════════ */}
      <section className="py-32 lg:py-40 border-t border-champagne/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Text column */}
            <div>
              <FadeUp>
                <p className="font-mono text-[0.58rem] tracking-widest3 text-champagne uppercase mb-6">
                  The Object
                </p>
              </FadeUp>
              <FadeUp delay={80}>
                <h2 className="font-display font-light text-[clamp(2.4rem,5vw,4.5rem)]
                               leading-[1.05] tracking-tight text-pearl mb-6">
                  Where Precision<br />Meets Poetry
                </h2>
              </FadeUp>
              <FadeUp delay={160}>
                <span className="gold-rule mx-0 mb-8" aria-hidden />
              </FadeUp>
              <FadeUp delay={220}>
                <p className="font-sans font-light text-[1rem] leading-[1.8] text-silver mb-6 max-w-md">
                  The DITA MONOLIX is not designed to be noticed — it is
                  designed to be<em className="text-pearl not-italic"> felt</em>.
                  Forged from pure titanium, assembled by hand in Sabae, Japan.
                  Each hinge torqued to within a tenth of a millimetre.
                </p>
              </FadeUp>
              <FadeUp delay={300}>
                <p className="font-sans font-light text-[1rem] leading-[1.8] text-silver mb-10 max-w-md">
                  In our Atelier, you may configure every element — from the
                  temple finish to the lens tint — previewed on a
                  photorealistic render in real time.
                </p>
              </FadeUp>
              <FadeUp delay={360}>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3
                             font-mono text-[0.6rem] tracking-widest2 uppercase
                             text-champagne hover:text-pearl transition-colors duration-300"
                >
                  Configure Your Pair
                  <span className="block w-8 h-px bg-champagne" aria-hidden />
                </Link>
              </FadeUp>
            </div>

            {/* Placeholder image block */}
            <FadeUp delay={100} className="relative aspect-[4/5] bg-charcoal overflow-hidden">
              {/* Decorative corner marks */}
              <span className="absolute top-4 left-4 w-6 h-6 border-t border-l border-champagne/40" aria-hidden />
              <span className="absolute top-4 right-4 w-6 h-6 border-t border-r border-champagne/40" aria-hidden />
              <span className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-champagne/40" aria-hidden />
              <span className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-champagne/40" aria-hidden />

              {/* Image placeholder — replace src with real product photo */}
              <img
                src="/images/monolix-hero.jpg"
                alt="DITA MONOLIX — matte titanium frame on dark editorial background"
                className="w-full h-full object-cover opacity-90"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />

              {/* Shown when image is missing (dev placeholder) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2
                              text-smoke font-mono text-[0.55rem] tracking-wider uppercase">
                <span className="block w-10 h-px bg-smoke/40" />
                <span>Product Image</span>
                <span className="text-[0.48rem] text-graphite">DITA MONOLIX</span>
                <span className="block w-10 h-px bg-smoke/40" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PHILOSOPHY TEASER
      ═══════════════════════════════════════ */}
      <section className="py-32 lg:py-40 border-t border-champagne/10 bg-[#0d0c0a]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <FadeUp>
            <p className="font-mono text-[0.58rem] tracking-widest3 text-champagne uppercase mb-10">
              On Craft
            </p>
          </FadeUp>
          <FadeUp delay={80}>
            <blockquote className="font-display font-light italic
                                   text-[clamp(1.8rem,4.5vw,3.8rem)]
                                   leading-[1.3] tracking-tight text-pearl
                                   max-w-3xl mx-auto mb-10">
              "Luxury is not a price point. It is the quiet confidence that
              every detail was considered — and none of them compromised."
            </blockquote>
          </FadeUp>
          <FadeUp delay={160}>
            <span className="gold-rule mb-6" aria-hidden />
          </FadeUp>
          <FadeUp delay={220}>
            <cite className="font-sans text-[0.7rem] tracking-widest2 uppercase text-smoke not-italic">
              House Manifesto, The Lens Atelier
            </cite>
          </FadeUp>
          <FadeUp delay={300} className="mt-14">
            <Link
              to="/philosophy"
              className="inline-flex items-center gap-3
                         font-mono text-[0.6rem] tracking-widest2 uppercase
                         text-champagne hover:text-pearl transition-colors duration-300"
            >
              Read the Philosophy
              <span className="block w-8 h-px bg-champagne" aria-hidden />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES GRID
      ═══════════════════════════════════════ */}
      <section className="py-32 lg:py-40 border-t border-champagne/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeUp className="text-center mb-20">
            <p className="font-mono text-[0.58rem] tracking-widest3 text-champagne uppercase mb-4">
              Services
            </p>
            <h2 className="font-display font-light text-[clamp(2rem,4vw,3.5rem)] text-pearl">
              The Full Experience
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-px bg-champagne/10">
            {[
              {
                num: '01',
                title: 'Bespoke Consultation',
                body: 'A private session with our frame specialists. Curated to your face architecture, lifestyle, and aesthetic inclination.',
                link: '/experience',
              },
              {
                num: '02',
                title: 'Lens Configuration',
                body: 'Select from prescription, photochromic, polarised, and artisan tinted lenses — visualised in real time on your chosen frame.',
                link: '/shop',
              },
              {
                num: '03',
                title: 'Lifetime Atelier Care',
                body: 'Every pair enters our care programme: adjustments, deep cleans, and temple replacements — complimentary, always.',
                link: '/contact',
              },
            ].map(({ num, title, body, link }, i) => (
              <FadeUp
                key={num}
                delay={i * 100}
                className="bg-obsidian p-10 lg:p-14 flex flex-col gap-6
                           group hover:bg-charcoal transition-colors duration-400"
              >
                <span className="font-mono text-[0.55rem] tracking-widest3 text-champagne/60">{num}</span>
                <h3 className="font-display font-light text-[1.65rem] leading-tight text-pearl
                               group-hover:text-champagne transition-colors duration-400">
                  {title}
                </h3>
                <p className="font-sans font-light text-[0.9rem] leading-[1.75] text-smoke flex-1">
                  {body}
                </p>
                <Link
                  to={link}
                  className="inline-flex items-center gap-2 font-mono text-[0.55rem]
                             tracking-widest2 uppercase text-champagne/70
                             group-hover:text-champagne transition-colors duration-300"
                >
                  Learn more
                  <span className="block w-5 h-px bg-current" aria-hidden />
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          APPOINTMENT CTA BAND
      ═══════════════════════════════════════ */}
      <section className="py-24 lg:py-32 border-t border-champagne/10 bg-[#0d0c0a]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <FadeUp>
            <h2 className="font-display font-light italic
                           text-[clamp(2rem,5vw,4rem)] text-pearl mb-8">
              Begin with an appointment.
            </h2>
          </FadeUp>
          <FadeUp delay={80}>
            <p className="font-sans font-light text-[0.95rem] text-silver mb-12 max-w-sm mx-auto">
              Private viewings available by request, six days a week.
              Complimentary champagne on arrival.
            </p>
          </FadeUp>
          <FadeUp delay={160}>
            <Link
              to="/contact"
              className="relative inline-flex items-center px-10 py-4
                         border border-champagne text-champagne
                         font-sans text-[0.68rem] tracking-widest2 uppercase
                         overflow-hidden group transition-colors duration-400"
            >
              <span
                className="absolute inset-0 bg-champagne translate-x-[-101%]
                           group-hover:translate-x-0 transition-transform duration-400 ease-luxury"
              />
              <span className="relative group-hover:text-obsidian transition-colors duration-400">
                Book Your Appointment
              </span>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="border-t border-champagne/10 py-10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12
                        flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-mono text-[0.52rem] tracking-widest2 uppercase text-smoke">
            © {new Date().getFullYear()} The Lens Atelier. All rights reserved.
          </p>
          <span className="gold-rule w-8 hidden md:block" aria-hidden />
          <p className="font-mono text-[0.52rem] tracking-widest2 uppercase text-smoke">
            Crafted with intention · London
          </p>
        </div>
      </footer>

      {/* Keyframe for hero fade-in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
