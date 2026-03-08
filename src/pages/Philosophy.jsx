import { Link } from 'react-router-dom'

export default function Philosophy() {
  return (
    <main className="bg-obsidian min-h-screen pt-20">
      <section className="border-b border-champagne/10 py-20 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <p className="font-mono text-[0.56rem] tracking-widest3 text-champagne uppercase mb-6">
            Philosophy
          </p>
          <h1 className="font-display font-light text-[clamp(2.8rem,7vw,6.5rem)]
                         leading-[0.95] tracking-tight text-pearl mb-10 max-w-3xl">
            We Believe Objects<br />Should <em className="text-gold-shimmer not-italic">Outlast</em> Trends
          </h1>
          <span className="gold-rule mx-0 mb-12" aria-hidden />
          <div className="grid lg:grid-cols-2 gap-16 max-w-4xl">
            <div className="flex flex-col gap-6 font-sans font-light text-[0.95rem] leading-[1.85] text-silver">
              <p>
                The Lens Atelier was founded on a single conviction: that eyewear is
                not a fashion accessory — it is the first thing people see when they
                look at you, and the last thing that should be made to feel disposable.
              </p>
              <p>
                We source from a small number of ateliers whose methods are measured in
                decades, not quarters. DITA. Barton Perreira. Matsuda. Each a maker who
                shares our belief that a frame worth wearing is a frame worth repairing,
                adjusting, and handing on.
              </p>
            </div>
            <div className="flex flex-col gap-6 font-sans font-light text-[0.95rem] leading-[1.85] text-silver">
              <p>
                Our lens studio takes that philosophy into the optical. Every lens we fit
                is ground to prescription in-house, coated with a multi-layer AR
                treatment, and matched precisely to the tint specification you configure
                in our Atelier. No compromises at the final step.
              </p>
              <p>
                Luxury, for us, is not a price point. It is the quiet confidence that
                every decision — from the temper of the titanium to the curve of the
                progressive — was considered carefully, and none of them rushed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="py-20 max-w-[1440px] mx-auto px-6 lg:px-12 flex gap-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-3
                     font-mono text-[0.6rem] tracking-widest2 uppercase
                     text-champagne hover:text-pearl transition-colors duration-300"
        >
          Enter the Atelier
          <span className="block w-8 h-px bg-champagne" aria-hidden />
        </Link>
      </div>
    </main>
  )
}
