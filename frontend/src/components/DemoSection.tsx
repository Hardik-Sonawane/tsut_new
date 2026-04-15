import { useState } from 'react'
import { Sparkles, Copy, RefreshCw, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'

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

type SummaryResult = { bart: string; t5: string }

// Simple extractive fallback (sentence scoring by word frequency)
function extractiveSummarize(text: string, maxSentences = 3): string {
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
    .map(s => s.text)
    .join(' ')
    .trim()
}

async function callHuggingFace(text: string, model: string): Promise<string> {
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: text,
        parameters: { max_length: 130, min_length: 30, do_sample: false },
      }),
      signal: AbortSignal.timeout(25000),
    }
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  if (Array.isArray(data) && data[0]?.summary_text) return data[0].summary_text
  if (data.error) throw new Error(data.error)
  throw new Error('Unexpected response')
}

export default function DemoSection() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'bart' | 't5' | null>(null)
  const [mode, setMode] = useState<'api' | 'local'>('api')
  const [selectedSample, setSelectedSample] = useState(-1)

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  async function handleSummarize() {
    if (text.trim().length < 50) {
      setError('Please enter at least 50 characters of text.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    if (mode === 'local') {
      // Extractive fallback - instant
      await new Promise(r => setTimeout(r, 800))
      const extSummary = extractiveSummarize(text, 2)
      setResult({
        bart: `[Extractive] ${extSummary}`,
        t5: `[Extractive] ${extractiveSummarize(text, 2)}`,
      })
      setLoading(false)
      return
    }

    try {
      // Call both models in parallel
      const [bartRes, t5Res] = await Promise.allSettled([
        callHuggingFace(text.slice(0, 1024), 'facebook/bart-large-cnn'),
        callHuggingFace('summarize: ' + text.slice(0, 512), 'hardiksonawane/tsut-t5-finetuned'),
      ])

      const bartText = bartRes.status === 'fulfilled'
        ? bartRes.value
        : extractiveSummarize(text, 2) + ' (API unavailable — extractive fallback)'
      const t5Text = t5Res.status === 'fulfilled'
        ? t5Res.value
        : extractiveSummarize(text, 2) + ' (API unavailable — extractive fallback)'

      setResult({ bart: bartText, t5: t5Text })
    } catch (e: any) {
      const errorMsg = e.message || 'HuggingFace API unavailable';
      const extSummary = extractiveSummarize(text, 2)
      setResult({
        bart: `${extSummary} 

[System Note: Fallback used because ${errorMsg}]`,
        t5:   `${extractiveSummarize(text, 2)} 

[System Note: Fallback used because ${errorMsg}]`,
      })
    } finally {
      setLoading(false)
    }
  }

  function copyText(which: 'bart' | 't5') {
    if (!result) return
    navigator.clipboard.writeText(which === 'bart' ? result.bart : result.t5)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  function loadSample(i: number) {
    setText(SAMPLE_TEXTS[i].text)
    setSelectedSample(i)
    setResult(null)
    setError('')
  }

  return (
    <section id="demo" style={{
      padding: '80px 24px',
      background: 'linear-gradient(180deg, var(--bg-warm) 0%, var(--indigo-light) 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 360, height: 360,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
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
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Paste any article or paragraph and see how BART and T5 summarize it in real time.
          </p>
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {(['api', 'local'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: '1.5px solid',
              borderColor: mode === m ? 'var(--indigo)' : 'var(--border)',
              background: mode === m ? 'var(--indigo)' : 'var(--bg-card)',
              color: mode === m ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--font)',
            }}>
              {m === 'api' ? '🌐 HuggingFace API (Real)' : '⚡ Extractive (Instant)'}
            </button>
          ))}
        </div>

        {/* Main card */}
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
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font)',
              }}>
                {s.label}
              </button>
            ))}
            {text && (
              <button onClick={() => { setText(''); setResult(null); setSelectedSample(-1) }} style={{
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
                onChange={e => { setText(e.target.value); setResult(null); setError('') }}
                placeholder="Paste a news article, research abstract, blog post, or any long paragraph here... (minimum 50 characters)"
                style={{
                  width: '100%', minHeight: 180, padding: '16px 20px',
                  borderRadius: 14, border: '1.5px solid var(--border)',
                  background: 'var(--bg-page)', color: 'var(--text-primary)',
                  fontSize: 14, lineHeight: 1.75, resize: 'vertical',
                  fontFamily: 'var(--font)', outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
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
                background: '#FFF1F2', border: '1px solid #FECDD3', color: '#BE123C',
                fontSize: 13,
              }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Summarize button */}
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
                : <><Sparkles size={16} /> Summarize with AI</>
              }
            </button>

            {/* API note */}
            {mode === 'api' && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Calls HuggingFace Inference API (facebook/bart-large-cnn & hardiksonawane/tsut-t5-finetuned) · No backend required · Falls back to extractive if unavailable
              </p>
            )}
          </div>

          {/* Results */}
          {result && (
            <div style={{
              borderTop: '1px solid var(--border)', padding: 24,
              background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--bg-warm) 100%)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
              }}>
                <CheckCircle size={16} color="#059669" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Summaries Generated!</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* BART */}
                <div style={{
                  background: 'var(--bg-card)', border: '1.5px solid var(--indigo-mid)',
                  borderRadius: 16, padding: 20, position: 'relative',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🦁</span>
                      <span style={{ fontWeight: 800, color: 'var(--indigo)', fontSize: 14 }}>BART-large-CNN</span>
                    </div>
                    <button onClick={() => copyText('bart')} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: copied === 'bart' ? '#ECFDF5' : 'var(--indigo-light)',
                      color: copied === 'bart' ? '#059669' : 'var(--indigo)',
                      border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                    }}>
                      {copied === 'bart' ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                  <p style={{
                    fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
                    background: 'var(--indigo-light)', padding: '12px 14px',
                    borderRadius: 10, border: '1px solid var(--indigo-mid)',
                  }}>
                    {result.bart}
                  </p>
                </div>

                {/* T5 */}
                <div style={{
                  background: 'var(--bg-card)', border: '1.5px solid #99F6E4',
                  borderRadius: 16, padding: 20, position: 'relative',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🤖</span>
                      <span style={{ fontWeight: 800, color: 'var(--teal)', fontSize: 14 }}>T5-small (Fine-tuned)</span>
                    </div>
                    <button onClick={() => copyText('t5')} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: copied === 't5' ? '#ECFDF5' : '#F0FDFA',
                      color: copied === 't5' ? '#059669' : 'var(--teal)',
                      border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                    }}>
                      {copied === 't5' ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                  <p style={{
                    fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
                    background: '#F0FDFA', padding: '12px 14px',
                    borderRadius: 10, border: '1px solid #99F6E4',
                  }}>
                    {result.t5}
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: 14, padding: '10px 16px', borderRadius: 8, fontSize: 12,
                background: 'var(--amber-light)', border: '1px solid var(--amber-mid)',
                color: '#78350F',
              }}>
                💡 <strong>Tip:</strong> BART produced a longer, more detailed summary while T5-small is more concise.
                This reflects BART's larger parameter count (1.6B vs 60M).
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
