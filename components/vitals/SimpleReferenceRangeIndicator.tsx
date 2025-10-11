interface SimpleReferenceRangeIndicatorProps {
  value: number
  previousValue?: number
  normalMin: number
  normalMax: number
  criticalMin?: number
  criticalMax?: number
  units: string
}

export function SimpleReferenceRangeIndicator({
  value,
  previousValue,
  normalMin,
  normalMax,
  criticalMin,
  criticalMax,
  units,
}: SimpleReferenceRangeIndicatorProps) {
  const rangeBuffer = (normalMax - normalMin) * 0.3
  const overallMin = criticalMin ?? (normalMin - rangeBuffer)
  const overallMax = criticalMax ?? (normalMax + rangeBuffer)
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

  const hasElevatedRange = criticalMax && criticalMax > normalMax
  const elevatedWidth = hasElevatedRange
    ? ((criticalMax - normalMax) / totalRange) * 100
    : 0

  const svgWidth = 320
  const svgHeight = 40
  const barHeight = 16
  const barY = 20

  return (
    <div className='w-full rounded-full overflow-hidden'>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className='w-full'
        preserveAspectRatio='xMidYMid meet'
      >
        {criticalMin && normalStartPosition > 0 && (
          <rect
            x='0'
            y={barY}
            width={`${normalStartPosition}%`}
            height={barHeight}
            fill='#fbbf24'
          />
        )}
        <rect
          x={`${normalStartPosition}%`}
          y={barY}
          width={`${normalWidth}%`}
          height={barHeight}
          fill='#10b981'
        />
        {hasElevatedRange && (
          <rect
            x={`${normalStartPosition + normalWidth}%`}
            y={barY}
            width={`${elevatedWidth}%`}
            height={barHeight}
            fill='#f97316'
          />
        )}
        {criticalMax &&
          (normalStartPosition + normalWidth + elevatedWidth) < 100 && (
          <rect
            x={`${normalStartPosition + normalWidth + elevatedWidth}%`}
            y={barY}
            width={`${
              100 - (normalStartPosition + normalWidth + elevatedWidth)
            }%`}
            height={barHeight}
            fill='#7f1d1d'
          />
        )}
        {previousPosition !== null && (
          <g>
            <polygon
              points={`${previousPosition * svgWidth / 100 - 4},${barY - 2} ${
                previousPosition * svgWidth / 100 + 4
              },${barY - 2} ${previousPosition * svgWidth / 100},${barY + 3}`}
              fill='#9ca3af'
            />
            <polygon
              points={`${previousPosition * svgWidth / 100 - 4},${
                barY + barHeight + 2
              } ${previousPosition * svgWidth / 100 + 4},${
                barY + barHeight + 2
              } ${previousPosition * svgWidth / 100},${barY + barHeight - 3}`}
              fill='#9ca3af'
            />
          </g>
        )}
        <g>
          <polygon
            points={`${valuePosition * svgWidth / 100 - 5},${barY - 3} ${
              valuePosition * svgWidth / 100 + 5
            },${barY - 3} ${valuePosition * svgWidth / 100},${barY + 4}`}
            fill='#000000'
          />
          <polygon
            points={`${valuePosition * svgWidth / 100 - 5},${
              barY + barHeight + 3
            } ${valuePosition * svgWidth / 100 + 5},${barY + barHeight + 3} ${
              valuePosition * svgWidth / 100
            },${barY + barHeight - 4}`}
            fill='#000000'
          />
        </g>
        <text
          x={normalStartPosition * svgWidth / 100}
          y={svgHeight - 2}
          textAnchor='middle'
          fontSize='10'
          fill='#6b7280'
          fontWeight='500'
        >
          {normalMin}
        </text>
        <text
          x={(normalStartPosition + normalWidth) * svgWidth / 100}
          y={svgHeight - 2}
          textAnchor='middle'
          fontSize='10'
          fill='#6b7280'
          fontWeight='500'
        >
          {normalMax}
        </text>
        {criticalMax && hasElevatedRange && (
          <text
            x={(normalStartPosition + normalWidth + elevatedWidth) * svgWidth /
              100}
            y={svgHeight - 2}
            textAnchor='middle'
            fontSize='10'
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
