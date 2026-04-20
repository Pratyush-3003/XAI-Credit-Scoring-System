import { useEffect, useState } from 'react'

/*
  RiskGauge — SVG semi-circular gauge using stroke-dashoffset
  for pixel-perfect alignment between track and fill.
*/
function getColor(p) {
  if (p < 0.25) return '#16A34A'
  if (p < 0.5)  return '#22C55E'
  if (p < 0.65) return '#D97706'
  if (p < 0.8)  return '#DC2626'
  return '#B91C1C'
}

export default function RiskGauge({ probability, size = 240 }) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(probability), 100)
    return () => clearTimeout(timer)
  }, [probability])

  const strokeWidth = 18
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2

  // Semi-circle arc path (left to right, curving upward)
  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`

  // Total length of the semi-circle
  const semiCircumference = Math.PI * radius

  // How much of the arc to fill (0 = empty, semiCircumference = full)
  const fillLength = semiCircumference * animatedValue
  const dashOffset = semiCircumference - fillLength

  const color = getColor(animatedValue)
  const pct = (animatedValue * 100).toFixed(1)

  const svgHeight = size / 2 + 40

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={svgHeight} viewBox={`0 0 ${size} ${svgHeight}`}>
        {/* Background track */}
        <path
          d={arcPath}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc — same path, clipped with dasharray */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={semiCircumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' }}
        />
        {/* Percentage text */}
        <text x={cx} y={cy - 12} textAnchor="middle"
          style={{ fontSize: '36px', fontWeight: 700, fill: color, fontFamily: 'Inter, sans-serif',
                   transition: 'fill 0.5s ease' }}>
          {pct}%
        </text>
        {/* Label */}
        <text x={cx} y={cy + 14} textAnchor="middle"
          style={{ fontSize: '13px', fontWeight: 500, fill: '#64748B', fontFamily: 'Inter, sans-serif',
                   textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Default Risk
        </text>
      </svg>
      <div className="flex justify-between w-full px-4 -mt-2 text-xs text-faint">
        <span>0%</span><span>50%</span><span>100%</span>
      </div>
    </div>
  )
}
