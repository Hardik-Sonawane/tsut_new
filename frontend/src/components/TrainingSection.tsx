import { BarChart2 } from 'lucide-react'
import { DATA } from '../data'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export default function TrainingSection() {
  const chartData = DATA.training.map(row => ({
    name: row.epoch,
    'Train Loss': row.trainLoss,
    'Val Loss': row.valLoss,
  }))

  const configs = [
    { icon: '🧠', label: 'Model', val: 't5-small' },
    { icon: '📈', label: 'Learning Rate', val: '5e-4' },
    { icon: '📦', label: 'Batch Size', val: '4' },
    { icon: '🔥', label: 'Warmup Steps', val: '200' },
    { icon: '⚖️', label: 'Weight Decay', val: '0.01' },
    { icon: '🖥️', label: 'Hardware', val: 'Tesla T4' },
    { icon: '📏', label: 'Max Input Len', val: '512 tokens' },
    { icon: '📐', label: 'Max Output Len', val: '128 tokens' },
  ]

  return (
    <section id="training" style={{ padding: '80px 24px', background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: 'var(--violet)', marginBottom: 12,
          }}>
            <BarChart2 size={14} /> Training Analytics
          </div>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900,
            letterSpacing: '-1.5px', marginBottom: 12, color: 'var(--text-primary)',
          }}>T5 Fine-tuning Progress</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Training on 2,000 CNN/DailyMail articles · Nvidia Tesla T4 GPU · fp16 precision
          </p>
        </div>

        {/* Chart + epoch cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 24 }}>
          {/* Chart */}
          <div style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: 'var(--text-primary)' }}>
              Training & Validation Loss per Epoch
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis domain={[1.5, 2.4]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'white', border: '1px solid var(--border)',
                    borderRadius: 10, fontSize: 13,
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
                <Line
                  type="monotone" dataKey="Train Loss"
                  stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 5, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone" dataKey="Val Loss"
                  stroke="#0D9488" strokeWidth={2.5} dot={{ r: 5, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  strokeDasharray="5 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Epoch cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DATA.training.map((ep, i) => (
              <div key={ep.epoch} style={{
                background: i === 2 ? 'linear-gradient(135deg, #EEF2FF, #F5F3FF)' : 'var(--bg-card)',
                border: `1.5px solid ${i === 2 ? 'var(--indigo-mid)' : 'var(--border)'}`,
                borderRadius: 16, padding: '18px 20px',
                boxShadow: 'var(--shadow-sm)',
                flex: 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                    Epoch {ep.epoch.replace('E', '')}
                  </div>
                  {i === 2 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: '#ECFDF5', color: '#059669',
                    }}>✓ Best</span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Train Loss</div>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--mono)', color: '#4F46E5' }}>{ep.trainLoss}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Val Loss</div>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--mono)', color: '#0D9488' }}>{ep.valLoss}</div>
                  </div>
                </div>
                <div style={{
                  marginTop: 10, height: 5, background: 'var(--bg-muted)', borderRadius: 99, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${(i + 1) / 3 * 100}%`,
                    background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                    borderRadius: 99,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Config grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        }}>
          {configs.map((c) => (
            <div key={c.label} style={{
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              borderRadius: 14, padding: '16px 18px',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--indigo-mid)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <span style={{ fontSize: 22 }}>{c.icon}</span>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{c.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
