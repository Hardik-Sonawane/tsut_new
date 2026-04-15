import { useState } from 'react'
import { DATA } from '../data'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ExamplesSection() {
  const [current, setCurrent] = useState(0)
  const ex = DATA.examples[current]
  const topicColors: Record<string, { bg: string; color: string }> = {
    Sports:     { bg: '#FEF3C7', color: '#92400E' },
    Science:    { bg: '#EFF6FF', color: '#1E40AF' },
    Technology: { bg: '#F5F3FF', color: '#5B21B6' },
  }
  const tc = topicColors[ex.topic] || { bg: '#F3F4F6', color: '#374151' }

  return (
    <section id="examples" style={{ padding: '80px 24px', background: 'var(--bg-warm)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: '#D97706', marginBottom: 12,
          }}>
            <BookOpen size={14} /> Qualitative Evaluation
          </div>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900,
            letterSpacing: '-1.5px', marginBottom: 12, color: 'var(--text-primary)',
          }}>Example Summaries</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Side-by-side comparison of BART vs T5 on real test articles.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border)',
          borderRadius: 24, boxShadow: 'var(--shadow-md)', overflow: 'hidden',
          animation: 'fadeIn .3s ease',
        }}>
          {/* Card header */}
          <div style={{
            padding: '18px 28px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-subtle)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 12px',
              borderRadius: 99, background: tc.bg, color: tc.color,
            }}>📌 {ex.topic}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Example {current + 1} of {DATA.examples.length}
            </span>
          </div>

          <div style={{ padding: 28 }}>
            {/* Article */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>
                📰 Article Excerpt
              </div>
              <div style={{
                fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)', borderRadius: 12, padding: '14px 18px',
                border: '1px solid var(--border)', maxHeight: 120, overflowY: 'auto',
              }}>
                {ex.article}
              </div>
            </div>

            {/* Model summaries */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* BART */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                }}>
                  <span style={{ fontSize: 18 }}>🦁</span>
                  <span style={{ fontWeight: 800, color: 'var(--indigo)', fontSize: 13 }}>BART-large-CNN</span>
                </div>
                <div style={{
                  fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
                  background: 'var(--indigo-light)', padding: '14px 16px',
                  borderRadius: 12, border: '1.5px solid var(--indigo-mid)',
                  minHeight: 90,
                }}>
                  {ex.bart}
                </div>
              </div>

              {/* T5 */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontWeight: 800, color: 'var(--teal)', fontSize: 13 }}>T5-small (Fine-tuned)</span>
                </div>
                <div style={{
                  fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
                  background: '#F0FDFA', padding: '14px 16px',
                  borderRadius: 12, border: '1.5px solid #99F6E4',
                  minHeight: 90,
                }}>
                  {ex.t5}
                </div>
              </div>
            </div>

            {/* Reference */}
            <div style={{
              padding: '14px 18px', borderRadius: 12,
              background: '#ECFDF5', border: '1.5px solid #A7F3D0',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#059669', marginBottom: 6 }}>
                ✅ Reference Summary (Ground Truth)
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: '#065F46' }}>
                {ex.reference}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          <button onClick={() => setCurrent(p => Math.max(0, p - 1))}
            disabled={current === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              color: current === 0 ? 'var(--text-faint)' : 'var(--text-primary)',
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)', boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s',
            }}>
            <ChevronLeft size={16} /> Previous
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            {DATA.examples.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i === current ? 24 : 8,
                height: 8, borderRadius: 99,
                background: i === current ? 'var(--indigo)' : 'var(--border)',
                border: 'none', cursor: 'pointer', transition: 'all 0.25s',
              }} />
            ))}
          </div>

          <button onClick={() => setCurrent(p => Math.min(DATA.examples.length - 1, p + 1))}
            disabled={current === DATA.examples.length - 1}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              color: current === DATA.examples.length - 1 ? 'var(--text-faint)' : 'var(--text-primary)',
              cursor: current === DATA.examples.length - 1 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)', boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s',
            }}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </section>
  )
}
