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

  function getPosition(val: string | number) {
    return Math.max(
      0,
      Math.min(100, ((Number(val) - overall_min) / total_range) * 100),
    )
  }

  const value_position = getPosition(value)
  const previous_position = previous_value != null
    ? getPosition(previous_value)
    : null

  const padding_x = 16
  const bar_width = 320
  const svg_width = bar_width + (padding_x * 2)
  const svg_height = 50
  const bar_height = 8
  const bar_y = 12
  const border_radius = 4

  // Find the green range to display its boundaries as labels
  const green_range = reference_ranges.find((r) => r.color === 'green')

  return (
    <div className='w-full min-w-[200px] max-w-[200px]'>
      <svg
        viewBox={`0 0 ${svg_width} ${svg_height}`}
        className='w-full'
        preserveAspectRatio='xMidYMid meet'
      >
        <defs>
          <clipPath id={`rounded-bar-${value}`}>
            <rect
              x={padding_x}
              y={bar_y}
              width={bar_width}
              height={bar_height}
              rx={border_radius}
              ry={border_radius}
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#rounded-bar-${value})`}>
          {reference_ranges.map((range, i) => {
            const start_position = getPosition(range.low)
            const end_position = getPosition(range.high)
            const width_percent = end_position - start_position
            return (
              <rect
                key={i}
                x={padding_x + (start_position / 100) * bar_width}
                y={bar_y}
                width={(width_percent / 100) * bar_width}
                height={bar_height}
                fill={RANGE_COLORS[range.color]}
              />
            )
          })}
        </g>

        {previous_position !== null && (
          <g>
            <line
              x1={padding_x + (previous_position * bar_width / 100)}
              y1={bar_y - 1}
              x2={padding_x + (previous_position * bar_width / 100)}
              y2={bar_y + bar_height + 1}
              stroke='#ffffff'
              strokeWidth='6'
              strokeLinecap='round'
            />
            <line
              x1={padding_x + (previous_position * bar_width / 100)}
              y1={bar_y - 1}
              x2={padding_x + (previous_position * bar_width / 100)}
              y2={bar_y + bar_height + 1}
              stroke='#9ca3af'
              strokeWidth='3.5'
              strokeLinecap='round'
            />

            <polygon
              points={`${
                padding_x + (previous_position * bar_width / 100) - 5
              },${bar_y - 13} ${
                padding_x + (previous_position * bar_width / 100) + 5
              },${bar_y - 13} ${
                padding_x + (previous_position * bar_width / 100)
              },${bar_y - 4.5}`}
              fill='#9ca3af'
            />
          </g>
        )}

        <g>
          <line
            x1={padding_x + (value_position * bar_width / 100)}
            y1={bar_y - 2}
            x2={padding_x + (value_position * bar_width / 100)}
            y2={bar_y + bar_height + 4}
            stroke='#ffffff'
            strokeWidth='6'
            strokeLinecap='round'
          />
          <line
            x1={padding_x + (value_position * bar_width / 100)}
            y1={bar_y - 2}
            x2={padding_x + (value_position * bar_width / 100)}
            y2={bar_y + bar_height + 4}
            stroke='#000000'
            strokeWidth='3.5'
            strokeLinecap='round'
          />

          <polygon
            points={`${padding_x + (value_position * bar_width / 100) - 5},${
              bar_y - 14
            } ${padding_x + (value_position * bar_width / 100) + 5},${
              bar_y - 14
            } ${padding_x + (value_position * bar_width / 100)},${bar_y - 5.5}`}
            fill='#000000'
          />
        </g>

        {green_range && (
          <>
            <text
              x={padding_x + (getPosition(green_range.low) / 100) * bar_width}
              y={bar_y + bar_height + 14}
              textAnchor='middle'
              fontSize='12'
              fill='#6b7280'
              fontWeight='500'
            >
              {green_range.low}
            </text>

            <text
              x={padding_x + (getPosition(green_range.high) / 100) * bar_width}
              y={bar_y + bar_height + 14}
              textAnchor='middle'
              fontSize='12'
              fill='#6b7280'
              fontWeight='500'
            >
              {green_range.high}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
