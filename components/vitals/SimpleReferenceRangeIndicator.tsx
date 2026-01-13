import { Maybe, ReferenceRangeX } from '../../types.ts'

export type SimpleReferenceRangeIndicatorProps = {
  value: string
  previous_value?: Maybe<string>
  units: string
  reference_ranges: ReferenceRangeX[]
}

const RANGE_COLORS: Record<ReferenceRangeX['color'], string> = {
  green: '#10b981',
  yellow: '#fbbf24',
  orange: '#f97316',
  red: '#dc2626',
}

export function ReferenceRangeIndicator({
  value,
  previous_value,
  reference_ranges,
}: SimpleReferenceRangeIndicatorProps) {
  const overall_min = reference_ranges[0].low
  const overall_max = reference_ranges[reference_ranges.length - 1].high
  const total_range = overall_max - overall_min

  // Layout Constants - Padding removed
  const bar_width = 320
  const svg_width = bar_width
  const svg_height = 50 // Reduced height to fit content tightly
  const bar_height = 8

  // Center the bar horizontally, but vertically we need space for labels
  const bar_y = 20
  const border_radius = 4

  function getXPos(val: string | number) {
    const percent = Math.max(0, Math.min(100, ((Number(val) - overall_min) / total_range) * 100))
    // padding_x is now 0
    return (percent / 100) * bar_width
  }

  const current_x = getXPos(value)
  const previous_x = previous_value != null ? getXPos(previous_value) : null

  const boundaries = reference_ranges.slice(0, -1).map((r) => ({
    val: r.high,
    x: getXPos(r.high),
  }))

  return (
    <svg
      viewBox={`0 0 ${svg_width} ${svg_height}`}
      class='w-full h-auto max-w-90 min-w-75;'
      preserveAspectRatio='xMidYMid meet'
      style={{ display: 'block' }}
    >
      <defs>
        <clipPath id={`rounded-bar-${value}`}>
          <rect x='0' y={bar_y} width={bar_width} height={bar_height} rx={border_radius} ry={border_radius} />
        </clipPath>
      </defs>

      {/* Track */}
      <g clipPath={`url(#rounded-bar-${value})`}>
        {reference_ranges.map((range, i) => {
          const x1 = getXPos(range.low)
          const x2 = getXPos(range.high)
          return <rect key={i} x={x1} y={bar_y} width={Math.max(0, x2 - x1)} height={bar_height} fill={RANGE_COLORS[range.color]} />
        })}
      </g>

      {/* Previous Value Indicator */}
      {previous_x !== null && (
        <g opacity='0.5'>
          <polygon
            points={`${previous_x - 3},${bar_y - 8} ${previous_x + 3},${bar_y - 8} ${previous_x},${bar_y - 2}`}
            fill='#9ca3af'
          />
        </g>
      )}

      {/* Current Value Indicator & Top Label */}
      <g>
        <text
          x={current_x}
          y={bar_y - 6}
          textAnchor='middle'
          fontSize='11'
          fontWeight='700'
          fill='#000000'
        >
          {value}
        </text>
        <line
          x1={current_x}
          y1={bar_y - 2}
          x2={current_x}
          y2={bar_y + bar_height + 2}
          stroke='#ffffff'
          strokeWidth='4'
          strokeLinecap='round'
        />
        <line
          x1={current_x}
          y1={bar_y - 2}
          x2={current_x}
          y2={bar_y + bar_height + 2}
          stroke='#000000'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </g>

      {/* Range Labels (Bottom) */}
      <g fontSize='10' fontWeight='500' fill='#6b7280'>
        {boundaries.map((b, idx) => (
          <text
            key={idx}
            x={b.x}
            y={bar_y + bar_height + 14}
            textAnchor='middle'
          >
            {b.val}
          </text>
        ))}
      </g>
    </svg>
  )
}
