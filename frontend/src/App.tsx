import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ScoresSection from './components/ScoresSection'
import TrainingSection from './components/TrainingSection'
import DemoSection from './components/DemoSection'
import ExamplesSection from './components/ExamplesSection'
import PipelineSection from './components/PipelineSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />
      <main>
        <Hero />
        <ScoresSection />
        <TrainingSection />
        <DemoSection />
        <ExamplesSection />
        <PipelineSection />
      </main>
      <Footer />
    </div>
  )
}
