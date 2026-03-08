import { useState } from 'react'

const TIMES = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', time: '', notes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    // In production: send to a backend / Calendly / etc.
    setSubmitted(true)
  }

  const fieldCls = `
    w-full bg-charcoal border border-champagne/15 text-pearl
    font-sans text-[0.88rem] px-4 py-3
    placeholder:text-smoke/40 focus:outline-none
    focus:border-champagne/50 transition-colors duration-300
  `.trim()

  return (
    <main className="bg-obsidian min-h-screen pt-20">
      <section className="border-b border-champagne/10 py-20 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-[1fr_480px] gap-16 lg:gap-24">

            {/* Left — context */}
            <div>
              <p className="font-mono text-[0.56rem] tracking-widest3 text-champagne uppercase mb-6">
                Contact
              </p>
              <h1 className="font-display font-light text-[clamp(2.8rem,6vw,5.5rem)]
                             leading-[0.95] tracking-tight text-pearl mb-8">
                Book Your<br />Appointment
              </h1>
              <span className="gold-rule mx-0 mb-8" aria-hidden />
              <p className="font-sans font-light text-[0.95rem] leading-[1.8] text-silver mb-10 max-w-sm">
                Private viewings are available by appointment only, six days
                a week. Complimentary champagne on arrival. Allow 60–90 minutes
                for a complete consultation.
              </p>

              <div className="flex flex-col gap-4">
                {[
                  { label: 'Studio', value: '14 Savile Row, London W1S 3JN' },
                  { label: 'Hours',  value: 'Mon–Sat · 10:00–18:00' },
                  { label: 'Tel',    value: '+44 20 7946 0958' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-6 items-baseline">
                    <span className="font-mono text-[0.5rem] tracking-widest2 uppercase text-smoke w-12 shrink-0">
                      {label}
                    </span>
                    <span className="font-sans text-[0.88rem] text-silver">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div>
              {submitted ? (
                <div className="glass-card p-10 flex flex-col gap-4 items-start">
                  <span className="gold-rule mx-0" aria-hidden />
                  <p className="font-display font-light italic text-[1.6rem] text-pearl">
                    Your appointment request has been received.
                  </p>
                  <p className="font-sans font-light text-[0.88rem] text-smoke leading-[1.75]">
                    A member of our team will confirm your preferred time within 24 hours.
                    We look forward to welcoming you.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={set('name')}
                    required
                    className={fieldCls}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={set('email')}
                    required
                    className={fieldCls}
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={form.phone}
                    onChange={set('phone')}
                    className={fieldCls}
                  />

                  {/* Preferred time */}
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[0.52rem] tracking-widest2 uppercase text-smoke">
                      Preferred Time
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TIMES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, time: t }))}
                          className={[
                            'px-4 py-2 font-mono text-[0.58rem] tracking-wider border',
                            'transition-colors duration-200',
                            form.time === t
                              ? 'border-champagne bg-champagne/10 text-champagne'
                              : 'border-champagne/15 text-smoke hover:border-champagne/40 hover:text-silver',
                          ].join(' ')}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Notes — frames of interest, prescription details, etc."
                    value={form.notes}
                    onChange={set('notes')}
                    className={`${fieldCls} resize-none`}
                  />

                  <button
                    type="submit"
                    className="relative inline-flex items-center justify-center
                               px-8 py-4 bg-champagne text-obsidian
                               font-sans text-[0.68rem] tracking-widest2 uppercase
                               overflow-hidden group transition-colors duration-400"
                  >
                    <span
                      className="absolute inset-0 bg-[#e8c98a] translate-x-[-101%]
                                 group-hover:translate-x-0 transition-transform duration-400 ease-luxury"
                    />
                    <span className="relative">Request Appointment</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
