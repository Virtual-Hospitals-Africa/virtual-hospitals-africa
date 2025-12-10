interface SimpleReferenceRangeIndicatorProps {
  value: number
  previousValue?: number
  normalMin: number
  normalMax: number
  criticalMin?: number
  criticalMax?: number
  units: string
}

export function ReferenceRangeIndicator({
  value,
  previousValue,
  normalMin,
  normalMax,
  criticalMin,
  criticalMax,
  units,
}: SimpleReferenceRangeIndicatorProps) {
  const definedRangeMin = criticalMin ?? normalMin
  const definedRangeMax = criticalMax ?? normalMax
  const totalDefinedRange = definedRangeMax - definedRangeMin

  const extensionCap = totalDefinedRange * 0.25

  let overallMin: number
  if (criticalMin !== undefined && criticalMin < normalMin) {
    const abnormalLowWidth = normalMin - criticalMin

    const lowExtension = Math.min(abnormalLowWidth, extensionCap)
    overallMin = criticalMin - lowExtension
  } else {
    overallMin = normalMin
  }

  let overallMax: number
  if (criticalMax !== undefined && criticalMax > normalMax) {
    const abnormalHighWidth = criticalMax - normalMax

    const highExtension = Math.min(abnormalHighWidth, extensionCap)
    overallMax = criticalMax + highExtension
  } else {
    overallMax = normalMax
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

  const normalStartPosition = ((normalMin - overallMin) / totalRange) * 100
  const normalWidth = ((normalMax - normalMin) / totalRange) * 100

  const hasAbnormalLow = criticalMin !== undefined && criticalMin < normalMin
  const criticalLowPosition = hasAbnormalLow
    ? ((criticalMin - overallMin) / totalRange) * 100
    : 0
  const abnormalLowWidth = hasAbnormalLow
    ? normalStartPosition - criticalLowPosition
    : 0

  const hasAbnormalHigh = criticalMax !== undefined && criticalMax > normalMax
  const abnormalHighPosition = normalStartPosition + normalWidth
  const abnormalHighWidth = hasAbnormalHigh
    ? (((criticalMax - normalMax) / totalRange) * 100)
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
            {criticalMin}
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
          {normalMin}
        </text>

        <text
          x={paddingX + ((normalStartPosition + normalWidth) * barWidth / 100)}
          y={barY + barHeight + 14}
          textAnchor='middle'
          fontSize='12'
          fill='#6b7280'
          fontWeight='500'
        >
          {normalMax}
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
            {criticalMax}
          </text>
        )}
      </svg>
    </div>
  )
}
