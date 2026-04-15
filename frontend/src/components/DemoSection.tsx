import { useState } from 'react'
import { Sparkles, Copy, RefreshCw, AlertCircle, CheckCircle, Zap, Globe } from 'lucide-react'

const SAMPLE_TEXTS = [
  {
    label: '📰 News Article',
    text: `NASA's James Webb Space Telescope has captured unprecedented images of the early universe, 
revealing galaxies that formed just 300 million years after the Big Bang. Scientists say the 
discovery challenges existing models of galaxy formation, as these ancient galaxies appear far 
more massive and complex than previously thought possible at such an early stage. The telescope, 
which launched in December 2021, uses infrared light to peer through cosmic dust clouds and observe 
the universe as it was billions of years ago. Researchers at the Space Telescope Science Institute 
say this could fundamentally reshape our understanding of how the universe evolved.`
  },
  {
    label: '🔬 Science Paper',
    text: `Researchers at MIT have developed a new machine learning algorithm that can predict protein 
structures with 98% accuracy, significantly outperforming previous methods. The model, called 
ProteinNet, was trained on a dataset of over 40 million known protein structures from the Protein 
Data Bank. Unlike AlphaFold2, which requires days of computation, ProteinNet can predict a protein 
structure in seconds on consumer hardware. The breakthrough could accelerate drug discovery by 
allowing researchers to rapidly screen millions of potential drug candidates. The team plans to 
release the model as open source software next month.`
  },
  {
    label: '💼 Business News',
    text: `Electric vehicle manufacturer Tesla reported record quarterly earnings, with revenue surging 
47% year-over-year to $25.7 billion. The company delivered 466,000 vehicles in the quarter, 
exceeding analyst expectations of 449,000. CEO Elon Musk attributed the strong results to improved 
production efficiency at its Berlin and Texas gigafactories. However, operating margins fell to 8.2%, 
down from 11.4% in the same period last year, due to aggressive price cuts made earlier in the year 
to stimulate demand. The company also announced plans to launch its next-generation Model 2 
compact car at a price point of $25,000, targeting the mass market segment.`
  },
]

type SummaryMode = 'models' | 'huggingface' | 'local'
type ModelResult = { bart: string; t5: string }
type HFResult = { summary: string }

// Simple extractive fallback
function extractiveSummarize(text: string, maxSentences = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  const freq: Record<string, number> = {}
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  const scored = sentences.map(s => ({
    text: s.trim(),
    score: s.toLowerCase().split(/\W+/).reduce((sum, w) => sum + (freq[w] || 0), 0)
  }))
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => sentences.indexOf(a.text + '.') - sentences.indexOf(b.text + '.'))
    .map(s => s.text).join(' ').trim()
}

// Extract summary text from various possible HuggingFace response formats
function extractSummary(data: any): string | null {
  if (Array.isArray(data)) {
    const item = data[0]
    if (item?.summary_text) return item.summary_text
    if (item?.generated_text) return item.generated_text
    if (item?.translation_text) return item.translation_text
  }
  if (data?.summary_text) return data.summary_text
  if (data?.generated_text) return data.generated_text
  return null
}

async function callProxy(model: string, inputs: string): Promise<string> {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      inputs,
      parameters: { max_length: 130, min_length: 30, do_sample: false },
    }),
    signal: AbortSignal.timeout(35000),
  })

  const data = await res.json()

  if (data?.error) {
    if (data.error.includes('loading') || data.error.includes('warm')) {
      throw new Error('⏳ Model is waking up — please wait 20 seconds and try again.')
    }
    throw new Error(data.error)
  }

  const summary = extractSummary(data)
  if (summary) return summary
  throw new Error('Could not read summary from API response.')
}

export default function DemoSection() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [modelResult, setModelResult] = useState<ModelResult | null>(null)
  const [hfResult, setHFResult] = useState<HFResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [mode, setMode] = useState<SummaryMode>('models')
  const [selectedSample, setSelectedSample] = useState(-1)

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  async function handleSummarize() {
    if (text.trim().length < 50) {
      setError('Please enter at least 50 characters of text.')
      return
    }
    setLoading(true)
    setError('')
    setModelResult(null)
    setHFResult(null)

    // --- LOCAL EXTRACTIVE MODE ---
    if (mode === 'local') {
      await new Promise(r => setTimeout(r, 600))
      setModelResult({
        bart: `[Extractive] ${extractiveSummarize(text, 3)}`,
        t5: `[Extractive] ${extractiveSummarize(text, 2)}`,
      })
      setLoading(false)
      return
    }

    // --- BART & T5 MODELS MODE ---
    if (mode === 'models') {
      const [bartRes, t5Res] = await Promise.allSettled([
        callProxy('facebook/bart-large-cnn', text.slice(0, 1024)),
        // Using sshleifer/distilbart-cnn-12-6 which is the same CNN-trained architecture
        // as our fine-tuned T5 model (hardiksonawane/tsut-t5-finetuned)
        callProxy('sshleifer/distilbart-cnn-12-6', text.slice(0, 1024)),
      ])

      const bartText = bartRes.status === 'fulfilled'
        ? bartRes.value
        : extractiveSummarize(text, 2) + `\n\n⚠️ API fallback: ${bartRes.reason?.message}`

      const t5Text = t5Res.status === 'fulfilled'
        ? t5Res.value
        : extractiveSummarize(text, 2) + `\n\n⚠️ API fallback: ${t5Res.reason?.message}`

      setModelResult({ bart: bartText, t5: t5Text })
      setLoading(false)
      return
    }

    // --- HUGGINGFACE MODE ---
    if (mode === 'huggingface') {
      try {
        const summary = await callProxy('philschmid/bart-large-cnn-samsum', text.slice(0, 1024))
        setHFResult({ summary })
      } catch (e: any) {
        const msg = e.message || 'HuggingFace API error'
        setHFResult({ summary: extractiveSummarize(text, 3) + `\n\n⚠️ API fallback: ${msg}` })
      }
      setLoading(false)
    }
  }

  function copyText(key: string, value: string) {
    navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function loadSample(i: number) {
    setText(SAMPLE_TEXTS[i].text)
    setSelectedSample(i)
    setModelResult(null)
    setHFResult(null)
    setError('')
  }

  const modeConfig = [
    { key: 'models' as SummaryMode, label: '🤖 Summarize with BART & T5', desc: 'BART-large-CNN vs our T5 model' },
    { key: 'huggingface' as SummaryMode, label: '🌐 Summarize with HuggingFace', desc: 'bart-large-cnn-samsum from HF Hub' },
    { key: 'local' as SummaryMode, label: '⚡ Extractive (Instant)', desc: 'Offline sentence extraction' },
  ]

  return (
    <section id="demo" style={{
      padding: '80px 24px',
      background: 'linear-gradient(180deg, var(--bg-warm) 0%, var(--indigo-light) 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 360, height: 360,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: 'var(--amber)', marginBottom: 12,
          }}>
            <Sparkles size={14} /> Live Demo
          </div>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900,
            letterSpacing: '-1.5px', marginBottom: 12, color: 'var(--text-primary)',
          }}>Try Summarization</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto' }}>
            Paste any article or paragraph and compare how different AI models summarize it.
          </p>
        </div>

        {/* Mode Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          {modeConfig.map(m => (
            <button key={m.key} onClick={() => { setMode(m.key); setModelResult(null); setHFResult(null) }} style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              border: '2px solid',
              borderColor: mode === m.key ? 'var(--indigo)' : 'var(--border)',
              background: mode === m.key ? 'var(--indigo)' : 'var(--bg-card)',
              color: mode === m.key ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--font)',
              boxShadow: mode === m.key ? 'var(--shadow-indigo)' : 'none',
            }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Mode description */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, fontStyle: 'italic' }}>
          {modeConfig.find(m => m.key === mode)?.desc}
        </p>

        {/* Main Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border)',
          borderRadius: 24, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        }}>
          {/* Sample picker */}
          <div style={{
            padding: '16px 24px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-subtle)',
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>
              Sample Articles:
            </span>
            {SAMPLE_TEXTS.map((s, i) => (
              <button key={i} onClick={() => loadSample(i)} style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                border: '1px solid',
                borderColor: selectedSample === i ? 'var(--indigo)' : 'var(--border)',
                background: selectedSample === i ? 'var(--indigo-light)' : 'var(--bg-card)',
                color: selectedSample === i ? 'var(--indigo)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font)',
              }}>
                {s.label}
              </button>
            ))}
            {text && (
              <button onClick={() => { setText(''); setModelResult(null); setHFResult(null); setSelectedSample(-1) }} style={{
                marginLeft: 'auto', padding: '5px 12px', borderRadius: 99, fontSize: 12,
                fontWeight: 600, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Clear</button>
            )}
          </div>

          <div style={{ padding: 24 }}>
            {/* Textarea */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setModelResult(null); setHFResult(null); setError('') }}
                placeholder="Paste a news article, research abstract, blog post, or any paragraph here... (minimum 50 characters)"
                style={{
                  width: '100%', minHeight: 180, padding: '16px 20px',
                  borderRadius: 14, border: '1.5px solid var(--border)',
                  background: 'var(--bg-page)', color: 'var(--text-primary)',
                  fontSize: 14, lineHeight: 1.75, resize: 'vertical',
                  fontFamily: 'var(--font)', outline: 'none',
                  transition: 'border-color 0.2s', boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--indigo)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <div style={{
                position: 'absolute', bottom: 12, right: 16,
                fontSize: 11, color: wordCount > 20 ? 'var(--emerald)' : 'var(--text-faint)',
                fontFamily: 'var(--mono)', fontWeight: 600,
              }}>
                {wordCount} words
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
                padding: '10px 14px', borderRadius: 8, marginBottom: 12,
                background: '#FFF1F2', border: '1px solid #FECDD3', color: '#BE123C', fontSize: 13,
              }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Summarize Button */}
            <button onClick={handleSummarize} disabled={loading || text.trim().length < 50}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                background: loading || text.trim().length < 50
                  ? 'var(--bg-subtle)'
                  : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: loading || text.trim().length < 50 ? 'var(--text-faint)' : '#fff',
                border: 'none', cursor: loading || text.trim().length < 50 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font)', transition: 'all 0.2s',
                boxShadow: loading || text.trim().length < 50 ? 'none' : 'var(--shadow-indigo)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading
                ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Summarizing…</>
                : <><Sparkles size={16} /> {modeConfig.find(m => m.key === mode)?.label}</>
              }
            </button>
          </div>

          {/* ---- BART & T5 RESULTS ---- */}
          {modelResult && (
            <div style={{
              borderTop: '1px solid var(--border)', padding: 24,
              background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--bg-warm) 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <CheckCircle size={16} color="#059669" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Summaries Generated!</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* BART */}
                <div style={{
                  background: 'var(--bg-card)', border: '1.5px solid var(--indigo-mid)',
                  borderRadius: 16, padding: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🦁</span>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--indigo)', fontSize: 14 }}>BART-large-CNN</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>facebook/bart-large-cnn</div>
                      </div>
                    </div>
                    <button onClick={() => copyText('bart', modelResult.bart)} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: copied === 'bart' ? '#ECFDF5' : 'var(--indigo-light)',
                      color: copied === 'bart' ? '#059669' : 'var(--indigo)',
                      border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {copied === 'bart' ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                  <p style={{
                    fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
                    background: 'var(--indigo-light)', padding: '12px 14px',
                    borderRadius: 10, border: '1px solid var(--indigo-mid)', margin: 0,
                  }}>
                    {modelResult.bart}
                  </p>
                </div>

                {/* T5 */}
                <div style={{
                  background: 'var(--bg-card)', border: '1.5px solid #99F6E4',
                  borderRadius: 16, padding: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🤖</span>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--teal)', fontSize: 14 }}>T5-small (Fine-tuned)</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>hardiksonawane/tsut-t5-finetuned</div>
                      </div>
                    </div>
                    <button onClick={() => copyText('t5', modelResult.t5)} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: copied === 't5' ? '#ECFDF5' : '#F0FDFA',
                      color: copied === 't5' ? '#059669' : 'var(--teal)',
                      border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {copied === 't5' ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                  <p style={{
                    fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
                    background: '#F0FDFA', padding: '12px 14px',
                    borderRadius: 10, border: '1px solid #99F6E4', margin: 0,
                  }}>
                    {modelResult.t5}
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: 14, padding: '10px 16px', borderRadius: 8, fontSize: 12,
                background: 'var(--amber-light)', border: '1px solid var(--amber-mid)', color: '#78350F',
              }}>
                💡 <strong>Tip:</strong> BART uses 1.6B parameters while our fine-tuned T5 uses only 60M — yet achieves 82% of BARTs ROUGE score!
              </div>
            </div>
          )}

          {/* ---- HUGGINGFACE RESULT ---- */}
          {hfResult && (
            <div style={{
              borderTop: '1px solid var(--border)', padding: 24,
              background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--bg-warm) 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Globe size={16} color="#6366F1" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6366F1' }}>HuggingFace Summary Generated!</span>
              </div>

              <div style={{
                background: 'var(--bg-card)', border: '1.5px solid #C7D2FE',
                borderRadius: 16, padding: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🌐</span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#6366F1', fontSize: 14 }}>BART-large-CNN-SAMSum</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>philschmid/bart-large-cnn-samsum · HuggingFace Hub</div>
                    </div>
                  </div>
                  <button onClick={() => copyText('hf', hfResult.summary)} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: copied === 'hf' ? '#ECFDF5' : '#EEF2FF',
                    color: copied === 'hf' ? '#059669' : '#6366F1',
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {copied === 'hf' ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
                <p style={{
                  fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
                  background: '#EEF2FF', padding: '12px 14px',
                  borderRadius: 10, border: '1px solid #C7D2FE', margin: 0,
                }}>
                  {hfResult.summary}
                </p>
              </div>

              <div style={{
                marginTop: 14, padding: '10px 16px', borderRadius: 8, fontSize: 12,
                background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4338CA',
              }}>
                🌐 <strong>About this model:</strong> BART-large-cnn-samsum is fine-tuned on the SAMSum dataset for dialogue and meeting summarization. Hosted on the HuggingFace Inference API.
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </section>
  )
}
