import { useState, useRef } from 'react'
import HomePage from './components/HomePage'
import InputForm from './components/InputForm'
import ResultCard from './components/ResultCard'
import ShapChart from './components/ShapChart'
import Explanation from './components/Explanation'
import { predictRisk } from './services/api'

/*
  App — Two-page layout:
  1. HomePage  → landing with hero, glass tiles, CTA
  2. Assessment → side-by-side form + results (stacks on mobile)
*/
export default function App() {
  const [page, setPage] = useState('home')        // 'home' | 'assess'
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const resultRef = useRef(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const data = await predictRisk(formData)
      setResult(data)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    } catch (err) {
      console.error('Prediction error:', err)
      setError('Unable to generate assessment. Please check your inputs and try again.')
    } finally {
      setLoading(false)
    }
  }

  const goToAssess = () => {
    setPage('assess')
    setResult(null)
    setError('')
  }

  // ─── HOMEPAGE ───
  if (page === 'home') {
    return <HomePage onNavigate={goToAssess} />
  }

  // ─── ASSESSMENT PAGE ───
  return (
    <div className="page-bg flex flex-col min-h-screen">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage('home')}
              className="flex items-center gap-2 text-sm text-subtle hover:text-heading transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-base font-semibold text-heading">CreditGuard</span>
            </div>
          </div>
          <p className="text-sm text-faint">Risk Assessment</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Page title */}
        <div className="mb-8 anim-enter">
          <p className="text-xs sm:text-sm font-semibold text-accent uppercase tracking-widest mb-1">New Assessment</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Credit Risk Evaluation</h1>
        </div>

        {/* Two-column: Form + Results — stacks on mobile/tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">

          {/* Left — Form (sticky on desktop so it stays visible while scrolling results) */}
          <div className="lg:sticky lg:top-24">
            <InputForm onSubmit={handleSubmit} isLoading={loading} />
          </div>

          {/* Right — Results / Placeholder / Loading / Error */}
          <div className="space-y-6">
            {/* Placeholder — before any submission */}
            {!result && !loading && !error && (
              <div className="glass rounded-2xl p-8 sm:p-12 text-center anim-enter-d2 min-h-[420px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass-subtle flex items-center justify-center">
                  <svg className="w-10 h-10 text-accent/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-heading mb-3">Ready for Assessment</h3>
                <p className="text-base text-subtle max-w-md mx-auto leading-relaxed mb-8">
                  Fill in the borrower details and click <strong>"Run Assessment"</strong> to generate a comprehensive risk report.
                </p>
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                  {[
                    { label: 'Risk Score', icon: '◎' },
                    { label: 'Factors', icon: '◫' },
                    { label: 'Summary', icon: '◧' },
                  ].map((t, i) => (
                    <div key={t.label} className={`glass-subtle glass-hover rounded-xl py-5 px-3 cursor-default anim-enter-d${i + 3}`}>
                      <div className="text-2xl text-accent/40 mb-2">{t.icon}</div>
                      <p className="text-xs font-medium text-subtle">{t.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="glass rounded-2xl p-8 sm:p-12 text-center anim-enter min-h-[420px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-risk-bg border border-risk-border flex items-center justify-center">
                  <svg className="w-10 h-10 text-risk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-heading mb-3">Assessment Failed</h3>
                <p className="text-base text-subtle max-w-md mx-auto leading-relaxed mb-6">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="text-base font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer"
                >
                  ← Try Again
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="glass rounded-2xl p-12 sm:p-16 min-h-[420px] flex flex-col items-center justify-center anim-fade">
                <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-6" />
                <p className="text-lg font-medium text-heading">Analyzing borrower data…</p>
                <p className="text-sm text-faint mt-2">Running credit risk evaluation</p>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div ref={resultRef} className="space-y-6">
                <div className="anim-enter">
                  <p className="text-xs sm:text-sm font-semibold text-accent uppercase tracking-widest mb-1">Generated Report</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-heading">Risk Assessment Results</h2>
                </div>
                <ResultCard result={result} />
                <ShapChart shapValues={result.shapValues} />
                <Explanation text={result.explanation} prediction={result.prediction} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-faint">
          © 2026 CreditGuard. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
