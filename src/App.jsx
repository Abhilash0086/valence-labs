import { useEffect, useRef, useState } from 'react'
import './App.css'

// TODO: Replace with your actual Fixora Vercel deployment URL
const FIXORA_URL = 'https://fixora-repair-management-system.vercel.app'

// ─── SVG Logo ────────────────────────────────────────────────────────────────
function VLogo({ size = 40 }) {
  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 80 90" fill="none" aria-label="Valence Labs logo">
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e6bf0" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
      <line x1="7" y1="7" x2="28" y2="38" stroke="url(#vg)" strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="7" x2="52" y2="38" stroke="url(#vg)" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
      <line x1="73" y1="7" x2="52" y2="38" stroke="url(#vg)" strokeWidth="2" strokeLinecap="round" />
      <line x1="73" y1="7" x2="28" y2="38" stroke="url(#vg)" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
      <line x1="28" y1="38" x2="40" y2="58" stroke="url(#vg)" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="38" x2="40" y2="58" stroke="url(#vg)" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="58" x2="40" y2="83" stroke="url(#vg)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7" cy="7" r="5" fill="#1e6bf0" />
      <circle cx="73" cy="7" r="5" fill="#00d4ff" />
      <circle cx="28" cy="38" r="3.5" fill="#1e6bf0" />
      <circle cx="52" cy="38" r="3.5" fill="#4ba3f5" />
      <circle cx="40" cy="58" r="5" fill="none" stroke="#00d4ff" strokeWidth="2" />
      <circle cx="40" cy="58" r="2" fill="#00d4ff" />
      <circle cx="40" cy="83" r="6" fill="#1e6bf0" />
    </svg>
  )
}

// ─── Particle Network Canvas ──────────────────────────────────────────────────
function NetworkCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let mouse = { x: -9999, y: -9999 }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999 })

    const N = 75
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }))

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < N; i++) {
        const p = ps[i]

        // mouse repulsion
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < 100) {
          p.vx += (mdx / md) * 0.04
          p.vy += (mdy / md) * 0.04
        }

        p.vx *= 0.999; p.vy *= 0.999
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        for (let j = i + 1; j < N; j++) {
          const q = ps[j]
          const dx = p.x - q.x, dy = p.y - q.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 170) {
            const a = (1 - d / 170) * 0.22
            ctx.strokeStyle = `rgba(30,160,255,${a})`
            ctx.lineWidth = 0.7
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke()
          }
        }

        const brightness = md < 120 ? 0.9 : 0.55
        ctx.fillStyle = `rgba(30,160,255,${brightness})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }

      animId = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="net-canvas" />
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useReveal()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <div className="app">

      {/* ── NAVBAR ── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
        <a href="#home" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <VLogo size={34} />
          <span className="logo-text"><em>VALENCE</em> LABS</span>
        </a>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#products" onClick={() => setMenuOpen(false)}>Products</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a href="#contact" className="btn-primary btn-sm mobile-cta" onClick={() => setMenuOpen(false)}>Get Started</a>
        </div>

        <a href="#contact" className="btn-primary btn-sm desktop-cta">Get Started</a>

        <button className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="home">
        <NetworkCanvas />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="badge-dot" />
            Valence Labs — Engineering Digital Solutions
          </div>
          <h1 className="hero-title reveal">
            Engineering<br />
            <span className="gradient-text">Intelligent Growth</span>
          </h1>
          <p className="hero-sub reveal">
            We build the digital systems that power your business —<br className="br-desktop" />
            websites, WhatsApp integrations, automation, and AI.
          </p>
          <div className="hero-ctas reveal">
            <a href="#services" className="btn-primary btn-lg">Explore Services</a>
            <a href="#contact" className="btn-ghost btn-lg">Let's Talk →</a>
          </div>
          <div className="hero-stats reveal">
            {[['5+', 'Services Offered'], ['100%', 'Custom Built'], ['Real', 'Local Support']].map(([n, l]) => (
              <div key={l} className="hero-stat">
                <span className="stat-num">{n}</span>
                <span className="stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <a href="#services" className="scroll-indicator" aria-label="Scroll down">
          <span className="scroll-line" />
        </a>
      </section>

      {/* ── SERVICES ── */}
      <section className="section" id="services">
        <div className="container">
          <p className="section-label reveal">What We Do</p>
          <h2 className="section-title reveal">Services Built for <span className="gradient-text">Real Business</span></h2>
          <p className="section-sub reveal">Every service solves a real problem — nothing generic, nothing templated.</p>
          <div className="services-grid">
            {SERVICES.map((s, i) => (
              <div key={i} className="service-card reveal" style={{ '--delay': `${i * 70}ms` }}>
                <div className="service-icon-wrap">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="card-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="section section-alt" id="products">
        <div className="container">
          <p className="section-label reveal">Our Products</p>
          <h2 className="section-title reveal">Built by Us, <span className="gradient-text">Used by Businesses</span></h2>
          <p className="section-sub reveal">Real software we've shipped into the real world.</p>

          <div className="products-grid">
            {/* Fixora card */}
            <div className="product-card product-featured reveal">
              <div className="product-card-glow" />
              <div className="product-header">
                <div className="product-logo">
                  <span>F</span>
                </div>
                <div className="product-meta">
                  <h3>Fixora</h3>
                  <span className="product-category">Mobile Repair Management</span>
                </div>
                <span className="product-live-badge">Live</span>
              </div>
              <p className="product-desc">
                A complete repair shop management system — from the moment a device walks in to the second it's delivered back. Manage job cards, assign technicians, send automated email updates to customers, and track your business performance with analytics.
              </p>
              <div className="product-features">
                {['Job Card Tracking', 'Multi-Role Access', 'Email Notifications', 'Customer Portal', 'Analytics Dashboard', 'Print Slips'].map(f => (
                  <span key={f} className="feature-chip">{f}</span>
                ))}
              </div>
              <div className="product-footer">
                <div className="product-stack">
                  {['React', 'Node.js', 'Supabase', 'Vercel'].map(t => (
                    <span key={t} className="stack-chip">{t}</span>
                  ))}
                </div>
                <a href={FIXORA_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Visit Fixora →
                </a>
              </div>
            </div>

            {/* Coming soon card */}
            <div className="product-card product-soon reveal">
              <div className="soon-icon">
                <LabIcon />
              </div>
              <div className="soon-label">In Development</div>
              <h3>More from the Lab</h3>
              <p>We're constantly building. More products from Valence Labs are in the pipeline — from WhatsApp-powered tools to AI-assisted business systems.</p>
              <a href="#contact" className="btn-ghost" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Stay Updated →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="section" id="why">
        <div className="container">
          <p className="section-label reveal">Why Choose Us</p>
          <h2 className="section-title reveal">The Difference <span className="gradient-text">You'll Notice</span></h2>
          <div className="why-grid">
            {WHY.map((w, i) => (
              <div key={i} className="why-card reveal" style={{ '--delay': `${i * 100}ms` }}>
                <div className="why-icon">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="section contact-section" id="contact">
        <div className="container">
          <div className="contact-card reveal">
            <div className="contact-bg-glow" />
            <p className="section-label">Get In Touch</p>
            <h2 className="section-title">Ready to Build<br /><span className="gradient-text">Something Great?</span></h2>
            <p className="contact-sub">Tell us what you need. We'll turn it into something remarkable.</p>
            <div className="contact-channels">
              <a href="tel:+919487626537" className="contact-item">
                <PhoneIcon />
                <div>
                  <span className="contact-item-label">Call us</span>
                  <span className="contact-item-value">+91 9487626537</span>
                </div>
              </a>
              <a href="mailto:valencelabscbe@gmail.com" className="contact-item">
                <MailIcon />
                <div>
                  <span className="contact-item-label">Email us</span>
                  <span className="contact-item-value">valencelabscbe@gmail.com</span>
                </div>
              </a>
              <a href="https://wa.me/919487626537" target="_blank" rel="noopener noreferrer" className="contact-item">
                <WAIcon />
                <div>
                  <span className="contact-item-label">WhatsApp</span>
                  <span className="contact-item-value">Chat instantly</span>
                </div>
              </a>
            </div>
            <div className="contact-ctas">
              <a href="mailto:valencelabscbe@gmail.com" className="btn-primary btn-lg">Send a Message</a>
              <a href="https://wa.me/919487626537" target="_blank" rel="noopener noreferrer" className="btn-ghost btn-lg">WhatsApp Us →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <VLogo size={28} />
            <div>
              <div className="logo-text footer-logo-text"><em>VALENCE</em> LABS</div>
              <div className="footer-tagline">Engineering Intelligent Growth</div>
            </div>
          </div>
          <div className="footer-nav">
            <a href="#services">Services</a>
            <a href="#products">Products</a>
            <a href="#contact">Contact</a>
            <a href="mailto:valencelabscbe@gmail.com">Email</a>
          </div>
          <div className="footer-copy">© 2025 Valence Labs. All rights reserved.</div>
        </div>
      </footer>

    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: <WebIcon />,
    title: 'Website Creation',
    desc: 'Professional, fast websites that represent your brand and turn visitors into paying customers. Built to perform, built to impress.',
  },
  {
    icon: <WAServiceIcon />,
    title: 'WhatsApp Integration',
    desc: 'Connect your business to customers via WhatsApp — orders, updates, and support, all on autopilot. Meet your customers where they already are.',
  },
  {
    icon: <AppIcon />,
    title: 'Windows Applications',
    desc: 'Custom desktop software built for Windows — powerful tools engineered exactly around how your team works, not the other way around.',
  },
  {
    icon: <AutoIcon />,
    title: 'Automation',
    desc: 'Stop doing things manually. We build smart workflows that eliminate repetitive tasks and save you hours every single week.',
  },
  {
    icon: <AIIcon />,
    title: 'AI Solutions',
    desc: 'Intelligent tools tailored to your business — from smart assistants to data-driven insights. AI that actually works for you.',
  },
]

const WHY = [
  {
    icon: <SpeedIcon />,
    title: 'Fast Turnaround',
    desc: 'From idea to launch in weeks, not months. We move quickly without cutting corners.',
  },
  {
    icon: <CustomIcon />,
    title: 'Built Just for You',
    desc: 'No templates, no generic solutions. Every product is engineered around your specific needs.',
  },
  {
    icon: <SupportIcon />,
    title: 'Real Support',
    desc: "Real people, real conversations. Support that doesn't disappear after delivery.",
  },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
function WebIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function WAServiceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="13" y2="14" />
    </svg>
  )
}
function AppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
function AutoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
function AIIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
      <circle cx="7.5" cy="14.5" r="1.5" /><circle cx="16.5" cy="14.5" r="1.5" />
    </svg>
  )
}
function SpeedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}
function CustomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M3 12H1m22 0h-2M4.93 4.93l1.41 1.41M18.66 18.66l1.41 1.41M12 19v2M12 3V1" />
    </svg>
  )
}
function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
function WAIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
function LabIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
    </svg>
  )
}
