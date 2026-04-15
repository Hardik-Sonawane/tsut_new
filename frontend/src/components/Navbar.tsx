import { useState, useEffect } from 'react'
import { Github, ExternalLink } from 'lucide-react'

const links = [
  { label: 'Overview', href: '#overview' },
  { label: 'Scores', href: '#scores' },
  { label: 'Training', href: '#training' },
  { label: 'Demo', href: '#demo' },
  { label: 'Examples', href: '#examples' },
  { label: 'Pipeline', href: '#pipeline' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('overview')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(253,252,250,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', gap: 32,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
          }}>T</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            TSUT
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            background: 'var(--indigo-light)', color: 'var(--indigo)',
            borderRadius: 99, fontFamily: 'var(--mono)',
            border: '1px solid var(--indigo-mid)',
          }}>v1.0</span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
          {links.map(l => (
            <a key={l.href} href={l.href}
              onClick={() => setActive(l.label.toLowerCase())}
              style={{
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                padding: '6px 14px', borderRadius: 8,
                color: active === l.label.toLowerCase() ? 'var(--indigo)' : 'var(--text-secondary)',
                background: active === l.label.toLowerCase() ? 'var(--indigo-light)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (active !== l.label.toLowerCase()) {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (active !== l.label.toLowerCase()) {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                }
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="https://www.kaggle.com/code/sonawanehardik/tsut-new" target="_blank" rel="noopener"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              color: 'var(--text-secondary)', textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s',
            }}>
            <ExternalLink size={14} /> Kaggle
          </a>
          <a href="https://github.com/Hardik-Sonawane/tsut_new" target="_blank" rel="noopener"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--indigo)', color: '#fff', textDecoration: 'none',
              boxShadow: 'var(--shadow-indigo)',
              transition: 'all 0.2s',
            }}>
            <Github size={14} /> GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
