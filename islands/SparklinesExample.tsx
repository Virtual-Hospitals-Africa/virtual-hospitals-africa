/* Ported from https://github.com/borisyankov/react-sparklines/tree/master */
/* I want the hover effect from this one, could be worth merging
  https://codepen.io/fnando/pen/GOQLVE */
import type { JSX } from 'preact/jsx-runtime'

export function SparklinesExample() {
  return <Sparklines data={[8, 10, 5, 20]} />
}

type SparklinesProps = {
  data: number[]
  limit?: number
  width?: number
  height?: number
  svgWidth?: number
  svgHeight?: number
  preserveAspectRatio?: string
  margin?: number
  min?: number
  max?: number
  // deno-lint-ignore ban-types
  onMouseMove?: Function
  className?: string
}

function Sparklines(
  {
    data,
    limit,
    width = 240,
    height = 60,
    svgWidth,
    svgHeight,
    preserveAspectRatio = 'none',
    margin = 2,
    className,
    max,
    min,
    onMouseMove,
  }: SparklinesProps,
) {
  if (data.length === 0) return null

  console.log('data', data)
  const points = dataToPoints({ data, limit, width, height, margin, max, min })

  const svgOpts: JSX.SVGAttributes<SVGSVGElement> = {
    className,
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: preserveAspectRatio,
  }
  if (svgWidth && svgWidth > 0) svgOpts.width = svgWidth
  if (svgHeight && svgHeight > 0) svgOpts.height = svgHeight

  console.log('points', points)
  return (
    <svg {...svgOpts}>
      <SparklinesLine
        data={data}
        points={points}
        width={width}
        height={height}
        margin={margin}
        onMouseMove={onMouseMove}
      />
    </svg>
  )
}

type SparklinesLineProps = {
  data: number[]
  points: Point[]
  width: number
  height: number
  margin: number
  // deno-lint-ignore ban-types
  onMouseMove?: Function
}

function SparklinesLine(
  { data, points, height, margin, onMouseMove }: SparklinesLineProps,
) {
  const linePoints = points.map((p) => [p.x, p.y]).reduce((a, b) => a.concat(b))

  const closePolyPoints = [
    points[points.length - 1].x,
    height - margin,
    margin,
    height - margin,
    margin,
    points[0].y,
  ]

  const fillPoints = linePoints.concat(closePolyPoints)

  const lineStyle = {
    stroke: 'slategray',
    strokeWidth: '1',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    fill: 'none',
  }

  const fillStyle = {
    stroke: 'none',
    strokeWidth: '0',
    fillOpacity: '.1',
    fill: 'slategray',
    pointerEvents: 'auto',
  }

  const tooltips = points.map((p, i) => (
    <circle
      key={i}
      cx={p.x}
      cy={p.y}
      r={2}
      style={fillStyle}
      onMouseEnter={(_e) => onMouseMove?.('enter', data[i], p)}
      onClick={(_e) => onMouseMove?.('click', data[i], p)}
    />
  ))

  return (
    <g>
      {tooltips}
      <polyline points={fillPoints.join(' ')} style={fillStyle} />
      <polyline points={linePoints.join(' ')} style={lineStyle} />
    </g>
  )
}

function arrayMin(data: number[]): number {
  return Math.min.apply(Math, data)
}

function arrayMax(data: number[]): number {
  return Math.max.apply(Math, data)
}

type Point = { x: number; y: number }

function dataToPoints(
  {
    data,
    limit,
    width = 1,
    height = 1,
    margin = 0,
    max = arrayMax(data),
    min = arrayMin(data),
  }: {
    data: number[]
    limit?: number
    width?: number
    height?: number
    margin?: number
    min?: number
    max?: number
  },
): Point[] {
  const len = data.length

  if (limit && limit < len) {
    data = data.slice(len - limit)
  }

  const vfactor = (height - margin * 2) / ((max - min) || 2)
  const hfactor = (width - margin * 2) / ((limit || len) - (len > 1 ? 1 : 0))

  return data.map((d, i) => ({
    x: i * hfactor + margin,
    y: (max === min ? 1 : (max - d)) * vfactor + margin,
  }))
}
