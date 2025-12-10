export type SimpleReferenceRangeIndicatorProps = {
  value: number
  previous_value?: number
  normal_min: number
  normal_max: number
  critical_min?: number
  critical_max?: number
  units: string
}

export function ReferenceRangeIndicator({
  value,
  previous_value,
  normal_min,
  normal_max,
  critical_min,
  critical_max,
  // units,
}: SimpleReferenceRangeIndicatorProps) {
  const defined_range_min = critical_min ?? normal_min
  const defined_range_max = critical_max ?? normal_max
  const total_defined_range = defined_range_max - defined_range_min

  const extension_cap = total_defined_range * 0.25

  let overall_min: number
  if (critical_min !== undefined && critical_min < normal_min) {
    const abnormal_low_width = normal_min - critical_min

    const low_extension = Math.min(abnormal_low_width, extension_cap)
    overall_min = critical_min - low_extension
  } else {
    overall_min = normal_min
  }

  let overall_max: number
  if (critical_max !== undefined && critical_max > normal_max) {
    const abnormal_high_width = critical_max - normal_max

    const high_extension = Math.min(abnormal_high_width, extension_cap)
    overall_max = critical_max + high_extension
  } else {
    overall_max = normal_max
  }

  const total_range = overall_max - overall_min

  const get_position = (val: number) => {
    return Math.max(
      0,
      Math.min(100, ((val - overall_min) / total_range) * 100),
    )
  }

  const value_position = get_position(value)
  const previous_position = previous_value !== undefined
    ? get_position(previous_value)
    : null

  const normal_start_position = ((normal_min - overall_min) / total_range) * 100
  const normal_width = ((normal_max - normal_min) / total_range) * 100

  const has_abnormal_low = critical_min !== undefined &&
    critical_min < normal_min
  const critical_low_position = has_abnormal_low
    ? ((critical_min - overall_min) / total_range) * 100
    : 0
  const abnormal_low_width = has_abnormal_low
    ? normal_start_position - critical_low_position
    : 0

  const has_abnormal_high = critical_max !== undefined &&
    critical_max > normal_max
  const abnormal_high_position = normal_start_position + normal_width
  const abnormal_high_width = has_abnormal_high
    ? (((critical_max - normal_max) / total_range) * 100)
    : 0

  const has_critical_low = has_abnormal_low
  const critical_low_width = has_critical_low ? critical_low_position : 0

  const has_critical_high = has_abnormal_high
  const critical_high_position = abnormal_high_position + abnormal_high_width
  const critical_high_width = has_critical_high
    ? 100 - critical_high_position
    : 0

  const padding_x = 16
  const bar_width = 320
  const svg_width = bar_width + (padding_x * 2)
  const svg_height = 50
  const bar_height = 8
  const bar_y = 12
  const border_radius = 4

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
          {has_critical_low && (
            <rect
              x={padding_x}
              y={bar_y}
              width={(critical_low_width / 100) * bar_width}
              height={bar_height}
              fill='#dc2626'
            />
          )}

          {has_abnormal_low && (
            <rect
              x={padding_x + (critical_low_position / 100) * bar_width}
              y={bar_y}
              width={(abnormal_low_width / 100) * bar_width}
              height={bar_height}
              fill='#fbbf24'
            />
          )}

          <rect
            x={padding_x + (normal_start_position / 100) * bar_width}
            y={bar_y}
            width={(normal_width / 100) * bar_width}
            height={bar_height}
            fill='#10b981'
          />

          {has_abnormal_high && (
            <rect
              x={padding_x + (abnormal_high_position / 100) * bar_width}
              y={bar_y}
              width={(abnormal_high_width / 100) * bar_width}
              height={bar_height}
              fill='#fbbf24'
            />
          )}

          {has_critical_high && (
            <rect
              x={padding_x + (critical_high_position / 100) * bar_width}
              y={bar_y}
              width={(critical_high_width / 100) * bar_width}
              height={bar_height}
              fill='#dc2626'
            />
          )}
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

        {has_abnormal_low && (
          <text
            x={padding_x + (critical_low_position * bar_width / 100)}
            y={bar_y + bar_height + 14}
            textAnchor='middle'
            fontSize='12'
            fill='#6b7280'
            fontWeight='500'
          >
            {critical_min}
          </text>
        )}

        <text
          x={padding_x + (normal_start_position * bar_width / 100)}
          y={bar_y + bar_height + 14}
          textAnchor='middle'
          fontSize='12'
          fill='#6b7280'
          fontWeight='500'
        >
          {normal_min}
        </text>

        <text
          x={padding_x +
            ((normal_start_position + normal_width) * bar_width / 100)}
          y={bar_y + bar_height + 14}
          textAnchor='middle'
          fontSize='12'
          fill='#6b7280'
          fontWeight='500'
        >
          {normal_max}
        </text>

        {has_abnormal_high && (
          <text
            x={padding_x + (critical_high_position * bar_width / 100)}
            y={bar_y + bar_height + 14}
            textAnchor='middle'
            fontSize='12'
            fill='#6b7280'
            fontWeight='500'
          >
            {critical_max}
          </text>
        )}
      </svg>
    </div>
  )
}
