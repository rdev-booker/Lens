import { Link } from 'react-router-dom'

const STEPS = [
  {
    num: '01',
    title: 'Private Consultation',
    body: 'Arrive at our studio and meet your dedicated frame specialist. We study your face geometry, skin tone, and lifestyle before presenting a curated edit of frames.',
  },
  {
    num: '02',
    title: 'Frame Fitting',
    body: 'Each candidate frame is placed on your face and mapped digitally. Temple pressure, bridge fit, and pupillary distance are recorded with sub-millimetre accuracy.',
  },
  {
    num: '03',
    title: 'Lens Configuration',
    body: 'Using our real-time compositing studio, you design your lens in situ — tint, gradient, prescription curve — watching every change on a live rendering of your chosen frame.',
  },
  {
    num: '04',
    title: 'Crafting & Delivery',
    body: 'Your lenses are ground to prescription in our workshop over seven to ten days. Delivery is by hand, with a final fitting included.',
  },
]

export default function Experience() {
  return (
    <main className="bg-obsidian min-h-screen pt-20">
      <section className="border-b border-champagne/10 py-20 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <p className="font-mono text-[0.56rem] tracking-widest3 text-champagne uppercase mb-6">
            The Experience
          </p>
          <h1 className="font-display font-light text-[clamp(2.8rem,7vw,6.5rem)]
                         leading-[0.95] tracking-tight text-pearl mb-10 max-w-3xl">
            An Appointment<br />Unlike Any Other
          </h1>
          <span className="gold-rule mx-0 mb-16" aria-hidden />

          <div className="grid md:grid-cols-2 gap-px bg-champagne/10 max-w-4xl">
            {STEPS.map(({ num, title, body }) => (
              <div key={num} className="bg-obsidian p-10 flex flex-col gap-4">
                <span className="font-mono text-[0.5rem] tracking-widest3 text-champagne/50">{num}</span>
                <h2 className="font-display font-light text-[1.5rem] text-pearl">{title}</h2>
                <p className="font-sans font-light text-[0.88rem] leading-[1.8] text-smoke">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="py-20 max-w-[1440px] mx-auto px-6 lg:px-12">
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
            Book Your Experience
          </span>
        </Link>
      </div>
    </main>
  )
}
