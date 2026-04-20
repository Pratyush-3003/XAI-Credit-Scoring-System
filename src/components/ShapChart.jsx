import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-border rounded-lg px-4 py-3 shadow-lg">
      <p className="font-semibold text-base text-heading mb-1">{d.feature}</p>
      <p className={`text-base font-medium ${d.impact === 'positive' ? 'text-safe' : 'text-risk'}`}>
        {d.value > 0 ? '+' : ''}{d.value.toFixed(4)}
      </p>
      <p className="text-faint text-sm mt-1">{d.impact === 'positive' ? 'Lowers risk' : 'Raises risk'}</p>
    </div>
  )
}

export default function ShapChart({ shapValues }) {
  const data = shapValues.map(s => ({
    feature: s.feature,
    value: parseFloat(s.value.toFixed(4)),
    impact: s.impact,
  }))

  return (
    <div className="glass-strong rounded-2xl p-6 sm:p-8 lg:p-10 anim-enter-d2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <p className="text-sm sm:text-base font-semibold text-subtle uppercase tracking-wider">Contributing Factors</p>
          <p className="text-sm text-faint mt-1">Impact of each factor on the assessment</p>
        </div>
        <div className="flex items-center gap-5 text-sm text-subtle">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-safe" />Lowers risk</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-risk" />Raises risk</span>
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 13 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={{ stroke: '#E2E8F0' }} />
            <YAxis type="category" dataKey="feature" width={140} tick={{ fill: '#334155', fontSize: 14 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,130,246,0.04)' }} />
            <ReferenceLine x={0} stroke="#94A3B8" strokeWidth={1} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.impact === 'positive' ? '#16A34A' : '#DC2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
