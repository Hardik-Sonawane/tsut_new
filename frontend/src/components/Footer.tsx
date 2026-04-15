import { Github, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--text-primary)', color: 'rgba(255,255,255,0.7)',
      padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
          }}>T</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>TSUT Dashboard</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Text Summarization Using Transformers</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <a href="https://github.com/Hardik-Sonawane/tsut_new" target="_blank" rel="noopener"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
          >
            <Github size={14} /> GitHub Repo
          </a>
          <a href="https://www.kaggle.com/code/sonawanehardik/tsut-new" target="_blank" rel="noopener"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
          >
            <ExternalLink size={14} /> Kaggle Notebook
          </a>
          <a href="https://raw.githubusercontent.com/Hardik-Sonawane/tsut_new/main/results.json" target="_blank" rel="noopener"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
          >
            Raw Data
          </a>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Built by Hardik Sonawane · DL &amp; GAI Project · 2026
        </div>
      </div>
    </footer>
  )
}
