import { GitBranch } from 'lucide-react'

const steps = [
  { num: '01', icon: '📦', title: 'Data Loading', desc: 'CNN/DailyMail 3.0.0 via Hugging Face Datasets. 2,000 train / 200 val / 100 test samples extracted.' },
  { num: '02', icon: '🔤', title: 'Tokenization', desc: 'T5 tokenizer with "summarize:" prefix. Max 512 input / 128 target tokens with padding.' },
  { num: '03', icon: '🧠', title: 'T5 Fine-tuning', desc: 'Seq2SeqTrainer · 3 epochs · fp16 · batch size 4 · LR 5e-4. Best checkpoint selected by val loss.' },
  { num: '04', icon: '⚡', title: 'BART Baseline', desc: 'facebook/bart-large-cnn — pretrained on CNN/DailyMail. Used zero-shot for comparison baseline.' },
  { num: '05', icon: '📊', title: 'ROUGE Evaluation', desc: 'ROUGE-1, ROUGE-2, ROUGE-L F-scores via rouge_score library on 100 test articles.' },
  { num: '06', icon: '💾', title: 'Results Export', desc: 'ROUGE scores + 10 example summaries saved to results.json and published to GitHub.' },
]

const techs = [
  'Python 3.12', 'PyTorch', 'Hugging Face Transformers', 'Datasets', 'T5-small',
  'BART-large-CNN', 'rouge_score', 'Kaggle GPU (T4)', 'fp16 Mixed Precision', 'Seq2SeqTrainer',
]

export default function PipelineSection() {
  return (
    <section id="pipeline" style={{ padding: '80px 24px 100px', background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: 'var(--teal)', marginBottom: 12,
          }}>
            <GitBranch size={14} /> Architecture
          </div>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900,
            letterSpacing: '-1.5px', marginBottom: 12, color: 'var(--text-primary)',
          }}>Project Pipeline</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            End-to-end summarization pipeline from raw data to evaluation and deployment.
          </p>
        </div>

        {/* Steps grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32,
        }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              borderRadius: 18, padding: 24, position: 'relative',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.25s',
              overflow: 'hidden',
            }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--indigo-mid)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
              }}
            >
              {/* Step number watermark */}
              <div style={{
                position: 'absolute', top: -8, right: 12,
                fontSize: 64, fontWeight: 900, color: 'rgba(79,70,229,0.06)',
                fontFamily: 'var(--mono)', lineHeight: 1, pointerEvents: 'none',
              }}>{step.num}</div>

              <div style={{ fontSize: 36, marginBottom: 12 }}>{step.icon}</div>
              <div style={{
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)',
                color: 'var(--indigo)', letterSpacing: 1, marginBottom: 6,
              }}>{step.num}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>
                {step.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                {step.desc}
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (i + 1) % 3 !== 0 && (
                <div style={{
                  position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 20, color: 'var(--indigo-mid)', zIndex: 2,
                }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border)',
          borderRadius: 18, padding: 28, boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
            color: 'var(--text-muted)', marginBottom: 16,
          }}>Technology Stack</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {techs.map(t => (
              <span key={t} style={{
                fontSize: 13, fontWeight: 600, padding: '6px 14px',
                borderRadius: 99, fontFamily: 'var(--mono)',
                background: 'var(--indigo-light)', color: 'var(--indigo)',
                border: '1px solid var(--indigo-mid)',
                transition: 'all 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--indigo)'
                  ;(e.currentTarget as HTMLElement).style.color = '#fff'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--indigo-light)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--indigo)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
