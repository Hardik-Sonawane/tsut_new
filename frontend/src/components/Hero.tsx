import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { DATA } from '../data'

function useCounter(target: number, duration = 1200, trigger: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * ease))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, trigger])
  return val
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const c1 = useCounter(DATA.config.testSamples, 1000, visible)
  const c2 = useCounter(DATA.config.trainSamples, 1200, visible)
  const c3 = useCounter(DATA.config.epochs, 800, visible)
  const c4 = useCounter(2, 600, visible)

  const stats = [
    { label: 'Test Samples', val: c1, suffix: '' },
    { label: 'Train Samples', val: c2, suffix: '' },
    { label: 'Training Epochs', val: c3, suffix: '' },
    { label: 'Models Compared', val: c4, suffix: '' },
  ]

  return (
    <section id="overview" ref={ref} style={{
      paddingTop: 128, paddingBottom: 80,
      background: 'linear-gradient(180deg, #FDFCFA 0%, #F7F6F3 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -40, left: -40, width: 320, height: 320,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 120, left: '10%', width: 200, height: 200,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}>
        {/* Tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
          padding: '6px 16px', borderRadius: 99,
          background: 'var(--indigo-light)', border: '1px solid var(--indigo-mid)',
          fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          color: 'var(--indigo)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--indigo)',
            animation: 'pulse 2s infinite',
            display: 'inline-block',
          }} />
          Deep Learning · NLP · Transformer Models
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 76px)', fontWeight: 900,
          letterSpacing: '-3px', lineHeight: 1.0, marginBottom: 20, color: 'var(--text-primary)',
        }}>
          Text Summarization<br />
          <span style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 40%, #0D9488 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            display: 'inline-block',
          }}>
            Using Transformers
          </span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 40px',
          lineHeight: 1.75,
        }}>
          Comparing <strong style={{ color: 'var(--indigo)', fontWeight: 700 }}>BART-large-CNN</strong> (pretrained)
          vs <strong style={{ color: 'var(--teal)', fontWeight: 700 }}>T5-small</strong> (fine-tuned 3 epochs)
          on CNN/DailyMail. Evaluated with ROUGE metrics.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <a href="#scores" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            color: '#fff', textDecoration: 'none',
            boxShadow: '0 6px 24px rgba(79,70,229,0.35)',
            transition: 'all 0.2s',
          }}>
            View ROUGE Scores <ArrowRight size={16} />
          </a>
          <a href="#demo" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: 'var(--bg-card)', color: 'var(--text-primary)', textDecoration: 'none',
            border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s',
          }}>
            ⚡ Try Live Demo
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16,
          maxWidth: 680, margin: '0 auto',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              borderRadius: 16, padding: '20px 12px', boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--indigo-mid)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
              }}
            >
              <div style={{
                fontSize: 34, fontWeight: 900, fontFamily: 'var(--mono)',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {s.val.toLocaleString()}{s.suffix}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center' }}>
          <a href="#scores" style={{ color: 'var(--text-faint)', animation: 'bounce 2s infinite' }}>
            <ChevronDown size={24} />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(.8); } }
        @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(6px); } }
      `}</style>
    </section>
  )
}
