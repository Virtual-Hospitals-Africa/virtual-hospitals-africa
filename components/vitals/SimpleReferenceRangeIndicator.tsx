interface SimpleReferenceRangeIndicatorProps {
  value: number
  previousValue?: number
  normal_min: number
  normal_max: number
  critical_min?: number
  critical_max?: number
  units: string
}

export function ReferenceRangeIndicator({
  value,
  previousValue,
  normal_min,
  normal_max,
  critical_min,
  critical_max,
  units,
}: SimpleReferenceRangeIndicatorProps) {
  const definedRangeMin = critical_min ?? normal_min
  const definedRangeMax = critical_max ?? normal_max
  const totalDefinedRange = definedRangeMax - definedRangeMin

  const extensionCap = totalDefinedRange * 0.25

  let overallMin: number
  if (critical_min !== undefined && critical_min < normal_min) {
    const abnormalLowWidth = normal_min - critical_min

    const lowExtension = Math.min(abnormalLowWidth, extensionCap)
    overallMin = critical_min - lowExtension
  } else {
    overallMin = normal_min
  }

  let overallMax: number
  if (critical_max !== undefined && critical_max > normal_max) {
    const abnormalHighWidth = critical_max - normal_max

    const highExtension = Math.min(abnormalHighWidth, extensionCap)
    overallMax = critical_max + highExtension
  } else {
    overallMax = normal_max
  }

  const totalRange = overallMax - overallMin

  const getPosition = (val: number) => {
    return Math.max(
      0,
      Math.min(100, ((val - overallMin) / totalRange) * 100),
    )
  }

  const valuePosition = getPosition(value)
  const previousPosition = previousValue !== undefined
    ? getPosition(previousValue)
    : null

  const normalStartPosition = ((normal_min - overallMin) / totalRange) * 100
  const normalWidth = ((normal_max - normal_min) / totalRange) * 100

  const hasAbnormalLow = critical_min !== undefined && critical_min < normal_min
  const criticalLowPosition = hasAbnormalLow
    ? ((critical_min - overallMin) / totalRange) * 100
    : 0
  const abnormalLowWidth = hasAbnormalLow
    ? normalStartPosition - criticalLowPosition
    : 0

  const hasAbnormalHigh = critical_max !== undefined &&
    critical_max > normal_max
  const abnormalHighPosition = normalStartPosition + normalWidth
  const abnormalHighWidth = hasAbnormalHigh
    ? (((critical_max - normal_max) / totalRange) * 100)
    : 0

  const hasCriticalLow = hasAbnormalLow
  const criticalLowWidth = hasCriticalLow ? criticalLowPosition : 0

  const hasCriticalHigh = hasAbnormalHigh
  const criticalHighPosition = abnormalHighPosition + abnormalHighWidth
  const criticalHighWidth = hasCriticalHigh ? 100 - criticalHighPosition : 0

  const paddingX = 16
  const barWidth = 320
  const svgWidth = barWidth + (paddingX * 2)
  const svgHeight = 50
  const barHeight = 8
  const barY = 12
  const borderRadius = 4

  return (
    <div className='w-full min-w-[200px] max-w-[200px]'>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className='w-full'
        preserveAspectRatio='xMidYMid meet'
      >
        <defs>
          <clipPath id={`rounded-bar-${value}`}>
            <rect
              x={paddingX}
              y={barY}
              width={barWidth}
              height={barHeight}
              rx={borderRadius}
              ry={borderRadius}
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#rounded-bar-${value})`}>
          {hasCriticalLow && (
            <rect
              x={paddingX}
              y={barY}
              width={(criticalLowWidth / 100) * barWidth}
              height={barHeight}
              fill='#dc2626'
            />
          )}

          {hasAbnormalLow && (
            <rect
              x={paddingX + (criticalLowPosition / 100) * barWidth}
              y={barY}
              width={(abnormalLowWidth / 100) * barWidth}
              height={barHeight}
              fill='#fbbf24'
            />
          )}

          <rect
            x={paddingX + (normalStartPosition / 100) * barWidth}
            y={barY}
            width={(normalWidth / 100) * barWidth}
            height={barHeight}
            fill='#10b981'
          />

          {hasAbnormalHigh && (
            <rect
              x={paddingX + (abnormalHighPosition / 100) * barWidth}
              y={barY}
              width={(abnormalHighWidth / 100) * barWidth}
              height={barHeight}
              fill='#fbbf24'
            />
          )}

          {hasCriticalHigh && (
            <rect
              x={paddingX + (criticalHighPosition / 100) * barWidth}
              y={barY}
              width={(criticalHighWidth / 100) * barWidth}
              height={barHeight}
              fill='#dc2626'
            />
          )}
        </g>

        {previousPosition !== null && (
          <g>
            <line
              x1={paddingX + (previousPosition * barWidth / 100)}
              y1={barY - 1}
              x2={paddingX + (previousPosition * barWidth / 100)}
              y2={barY + barHeight + 1}
              stroke='#ffffff'
              strokeWidth='6'
              strokeLinecap='round'
            />
            <line
              x1={paddingX + (previousPosition * barWidth / 100)}
              y1={barY - 1}
              x2={paddingX + (previousPosition * barWidth / 100)}
              y2={barY + barHeight + 1}
              stroke='#9ca3af'
              strokeWidth='3.5'
              strokeLinecap='round'
            />

            <polygon
              points={`${paddingX + (previousPosition * barWidth / 100) - 5},${
                barY - 13
              } ${paddingX + (previousPosition * barWidth / 100) + 5},${
                barY - 13
              } ${paddingX + (previousPosition * barWidth / 100)},${
                barY - 4.5
              }`}
              fill='#9ca3af'
            />
          </g>
        )}

        <g>
          <line
            x1={paddingX + (valuePosition * barWidth / 100)}
            y1={barY - 2}
            x2={paddingX + (valuePosition * barWidth / 100)}
            y2={barY + barHeight + 4}
            stroke='#ffffff'
            strokeWidth='6'
            strokeLinecap='round'
          />
          <line
            x1={paddingX + (valuePosition * barWidth / 100)}
            y1={barY - 2}
            x2={paddingX + (valuePosition * barWidth / 100)}
            y2={barY + barHeight + 4}
            stroke='#000000'
            strokeWidth='3.5'
            strokeLinecap='round'
          />

          <polygon
            points={`${paddingX + (valuePosition * barWidth / 100) - 5},${
              barY - 14
            } ${paddingX + (valuePosition * barWidth / 100) + 5},${barY - 14} ${
              paddingX + (valuePosition * barWidth / 100)
            },${barY - 5.5}`}
            fill='#000000'
          />
        </g>

        {hasAbnormalLow && (
          <text
            x={paddingX + (criticalLowPosition * barWidth / 100)}
            y={barY + barHeight + 14}
            textAnchor='middle'
            fontSize='12'
            fill='#6b7280'
            fontWeight='500'
          >
            {critical_min}
          </text>
        )}

        <text
          x={paddingX + (normalStartPosition * barWidth / 100)}
          y={barY + barHeight + 14}
          textAnchor='middle'
          fontSize='12'
          fill='#6b7280'
          fontWeight='500'
        >
          {normal_min}
        </text>

        <text
          x={paddingX + ((normalStartPosition + normalWidth) * barWidth / 100)}
          y={barY + barHeight + 14}
          textAnchor='middle'
          fontSize='12'
          fill='#6b7280'
          fontWeight='500'
        >
          {normal_max}
        </text>

        {hasAbnormalHigh && (
          <text
            x={paddingX + (criticalHighPosition * barWidth / 100)}
            y={barY + barHeight + 14}
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
