import { useEffect, useRef, useState } from 'react'
import { DATA } from '../data'
import { TrendingUp, Zap, Info } from 'lucide-react'

function AnimatedBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setWidth(pct), delay)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [pct, delay])

  return (
    <div ref={ref} style={{
      height: 10, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden', flex: 1,
    }}>
      <div style={{
        height: '100%', width: `${width}%`, borderRadius: 99,
        background: color, transition: 'width 1.4s cubic-bezier(.4,0,.2,1)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          animation: 'shimmer 2s infinite',
        }} />
      </div>
    </div>
  )
}

export default function ScoresSection() {
  const maxScore = 50 // normalise bars to 50 as 100%

  const bartMetrics = [
    { label: 'ROUGE-1', val: DATA.bart.rouge1, pct: (DATA.bart.rouge1 / maxScore) * 100 },
    { label: 'ROUGE-2', val: DATA.bart.rouge2, pct: (DATA.bart.rouge2 / maxScore) * 100 },
    { label: 'ROUGE-L', val: DATA.bart.rougeL, pct: (DATA.bart.rougeL / maxScore) * 100 },
  ]
  const t5Metrics = [
    { label: 'ROUGE-1', val: DATA.t5.rouge1, pct: (DATA.t5.rouge1 / maxScore) * 100 },
    { label: 'ROUGE-2', val: DATA.t5.rouge2, pct: (DATA.t5.rouge2 / maxScore) * 100 },
    { label: 'ROUGE-L', val: DATA.t5.rougeL, pct: (DATA.t5.rougeL / maxScore) * 100 },
  ]

  function ModelCard({
    name, subtitle, icon, metrics, color, gradFrom, gradTo, badge, badgeColor, badgeBg,
  }: {
    name: string; subtitle: string; icon: string; badge: string; badgeColor: string; badgeBg: string
    metrics: typeof bartMetrics; color: string; gradFrom: string; gradTo: string
  }) {
    return (
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20,
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow)',
        padding: 28, flex: 1,
        transition: 'all 0.25s',
        position: 'relative', overflow: 'hidden',
      }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'
          ;(e.currentTarget as HTMLElement).style.borderColor = color
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        }}
      >
        {/* Accent top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, fontSize: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${gradFrom}18, ${gradTo}14)`,
            border: `1.5px solid ${gradFrom}30`,
          }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
            background: badgeBg, color: badgeColor, border: `1px solid ${color}40`,
          }}>{badge}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {metrics.map((m, i) => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                width: 60, flexShrink: 0, fontFamily: 'var(--mono)',
              }}>{m.label}</span>
              <AnimatedBar pct={m.pct} color={`linear-gradient(90deg, ${gradFrom}, ${gradTo})`} delay={i * 150} />
              <span style={{
                fontSize: 15, fontWeight: 800, fontFamily: 'var(--mono)',
                color: gradFrom, width: 44, textAlign: 'right', flexShrink: 0,
              }}>{m.val}</span>
            </div>
          ))}
        </div>

        {/* Avg badge */}
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: `linear-gradient(135deg, ${gradFrom}10, ${gradTo}08)`,
          border: `1px solid ${gradFrom}20`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Average ROUGE</span>
          <span style={{
            fontSize: 18, fontWeight: 900, fontFamily: 'var(--mono)', color: gradFrom,
          }}>
            {((metrics[0].val + metrics[1].val + metrics[2].val) / 3).toFixed(2)}
          </span>
        </div>
      </div>
    )
  }

  const tableRows = [
    { metric: 'ROUGE-1', bart: 36.84, t5: 31.49, delta: 5.35 },
    { metric: 'ROUGE-2', bart: 16.44, t5: 12.46, delta: 3.98 },
    { metric: 'ROUGE-L', bart: 27.65, t5: 23.48, delta: 4.17 },
  ]

  return (
    <section id="scores" style={{ padding: '80px 24px', background: 'var(--bg-warm)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: 'var(--indigo)', marginBottom: 12,
          }}>
            <TrendingUp size={14} /> Performance Metrics
          </div>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900,
            letterSpacing: '-1.5px', marginBottom: 12, color: 'var(--text-primary)',
          }}>ROUGE Score Comparison</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
            Evaluated on 100 CNN/DailyMail test articles. Higher is better.
          </p>
        </div>

        {/* Model cards */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <ModelCard
            name="BART-large-CNN" subtitle="Pretrained · No Fine-tuning"
            icon="🦁" badge="🏆 Top Score" badgeColor="#4F46E5" badgeBg="#EEF2FF"
            metrics={bartMetrics} color="#4F46E5" gradFrom="#4F46E5" gradTo="#7C3AED"
          />

          {/* VS */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 8, padding: '0 4px', flexShrink: 0,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: '#fff', fontWeight: 800, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(79,70,229,0.3)',
            }}>VS</div>
          </div>

          <ModelCard
            name="T5-small" subtitle="Fine-tuned · 3 Epochs on CNN/DM"
            icon="🤖" badge="⚡ Lightweight" badgeColor="#0D9488" badgeBg="#F0FDFA"
            metrics={t5Metrics} color="#0D9488" gradFrom="#0D9488" gradTo="#059669"
          />
        </div>

        {/* Detail table */}
        <div style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border)',
          borderRadius: 20, boxShadow: 'var(--shadow)', overflow: 'hidden',
        }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', marginBottom: 4 }}>
              Detailed Score Breakdown
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              ROUGE F-scores (×100) on 100 test articles — CNN/DailyMail 3.0.0
            </p>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
            padding: '12px 28px', background: 'var(--bg-subtle)',
          }}>
            {['Metric', 'BART-large-CNN', 'T5-small (FT)', 'Δ Difference'].map(h => (
              <div key={h} style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 1, color: 'var(--text-muted)',
              }}>{h}</div>
            ))}
          </div>

          {tableRows.map((row, i) => (
            <div key={row.metric} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
              padding: '16px 28px',
              borderBottom: i < tableRows.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>
                {row.metric}
              </span>
              <span style={{ fontWeight: 800, color: '#4F46E5', fontFamily: 'var(--mono)', fontSize: 15 }}>
                {row.bart}
              </span>
              <span style={{ fontWeight: 800, color: '#0D9488', fontFamily: 'var(--mono)', fontSize: 15 }}>
                {row.t5}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)',
                padding: '2px 12px', borderRadius: 99,
                background: '#ECFDF5', color: '#059669', border: '1px solid #BBF7D0',
                width: 'fit-content',
              }}>
                <Zap size={11} /> +{row.delta}
              </span>
            </div>
          ))}

          {/* Avg row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
            padding: '16px 28px', background: 'var(--indigo-light)',
          }}>
            <span style={{ fontWeight: 800, color: 'var(--indigo)', fontFamily: 'var(--mono)' }}>Average</span>
            <span style={{ fontWeight: 900, color: '#4F46E5', fontFamily: 'var(--mono)', fontSize: 16 }}>26.98</span>
            <span style={{ fontWeight: 900, color: '#0D9488', fontFamily: 'var(--mono)', fontSize: 16 }}>22.48</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 800,
              fontFamily: 'var(--mono)', padding: '2px 12px', borderRadius: 99,
              background: '#ECFDF5', color: '#059669', border: '1px solid #BBF7D0', width: 'fit-content',
            }}>
              +4.50
            </span>
          </div>

          {/* Insight */}
          <div style={{
            padding: '20px 28px', background: 'var(--amber-light)',
            borderTop: '1px solid #FDE68A',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <Info size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14, color: '#92400E', lineHeight: 1.65 }}>
              <strong>Key Insight:</strong> Despite T5-small having only <strong>60M parameters</strong> (vs BART's 1.6B),
              fine-tuning for just 3 epochs achieves <strong>82% of BART's ROUGE-L</strong> — remarkable efficiency.
              More data or longer training could close this gap further.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      `}</style>
    </section>
  )
}
