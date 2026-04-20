export default function Explanation({ text, prediction }) {
  const isDefault = prediction === 'Default'

  return (
    <div className="glass-strong rounded-2xl p-6 sm:p-8 lg:p-10 anim-enter-d3">
      <p className="text-sm sm:text-base font-semibold text-subtle uppercase tracking-wider mb-5">
        Assessment Summary
      </p>
      <div className={`rounded-xl p-5 sm:p-6 border-l-4 ${isDefault ? 'bg-risk-bg border-risk' : 'bg-safe-bg border-safe'}`}>
        <p className="text-base sm:text-lg text-body leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
