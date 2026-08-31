export type BubbleCell = { col_key: string; value: number }

export type BubbleRow = {
  key: string
  label: string
  color: string
  cells: readonly BubbleCell[]
}

export type BubbleMatrixProps = {
  col_keys: readonly string[]
  col_labels: readonly string[]
  rows: readonly BubbleRow[]
  reference_sizes?: readonly number[]
}

const CELL_WIDTH = 72
const ROW_HEIGHT = 36
const CELL_RADIUS_MAX = 18
const HEADER_HEIGHT = 96

export default function BubbleMatrix(
  { col_keys, col_labels, rows, reference_sizes }: BubbleMatrixProps,
) {
  if (rows.length === 0 || col_keys.length === 0) {
    return <div class='text-sm text-gray-500'>No data</div>
  }

  let max = 0
  for (const row of rows) for (const cell of row.cells) if (cell.value > max) max = cell.value
  if (max === 0) max = 1

  function radius(value: number): number {
    if (value <= 0) return 0
    return Math.sqrt(value / max) * CELL_RADIUS_MAX
  }

  const visible_values: number[] = []
  for (const row of rows) for (const cell of row.cells) if (cell.value > 0) visible_values.push(cell.value)
  visible_values.sort((a, b) => a - b)
  function quantile(p: number): number {
    if (visible_values.length === 0) return 0
    const idx = Math.min(visible_values.length - 1, Math.floor(p * visible_values.length))
    return visible_values[idx]
  }
  const legend_sizes = reference_sizes ?? [
    Math.max(1, Math.round(quantile(0.5))),
    Math.max(2, Math.round(quantile(0.9))),
    Math.max(3, max),
  ]

  return (
    <div class='overflow-x-auto'>
      <table class='border-separate border-spacing-0 text-[11px]'>
        <thead>
          <tr>
            <th
              scope='col'
              class='px-3 pb-1 text-right align-bottom font-medium text-gray-700'
              style={{ height: HEADER_HEIGHT }}
            >
              Condition
            </th>
            {col_keys.map((key, i) => (
              <th
                key={key}
                scope='col'
                class='p-0 align-bottom'
                style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH, height: HEADER_HEIGHT }}
              >
                <div class='relative h-full'>
                  <div class='absolute bottom-1 left-1/2 origin-bottom-left -rotate-45 whitespace-nowrap font-medium text-gray-700'>
                    {col_labels[i] ?? key}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, row_idx) => {
            const cells_by_col = new Map(row.cells.map((c) => [c.col_key, c.value]))
            const stripe = row_idx % 2 === 0
            return (
              <tr key={row.key} class={stripe ? 'bg-gray-50' : ''}>
                <th
                  scope='row'
                  class='whitespace-nowrap px-3 text-right font-normal text-gray-800'
                  style={{ height: ROW_HEIGHT }}
                >
                  {row.label}
                </th>
                {col_keys.map((col, col_idx) => {
                  const value = cells_by_col.get(col) ?? 0
                  const r = radius(value)
                  return (
                    <td
                      key={col}
                      class='p-0 text-center'
                      style={{ width: CELL_WIDTH, height: ROW_HEIGHT }}
                    >
                      {r > 0 && (
                        <svg
                          class='inline-block overflow-visible align-middle'
                          width={1}
                          height={1}
                          aria-hidden='true'
                        >
                          <circle
                            cx={0}
                            cy={0}
                            r={r}
                            fill={row.color}
                            fillOpacity={0.7}
                            stroke={row.color}
                            strokeWidth={0.5}
                          >
                            <title>{`${row.label} — ${col_labels[col_idx] ?? col}: ${value.toLocaleString()}`}</title>
                          </circle>
                        </svg>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div class='mt-3 flex items-center gap-4 border-t border-gray-200 pt-3'>
        <span class='text-[10px] uppercase tracking-wide text-gray-500'>Bubble size</span>
        {legend_sizes.map((size, i) => {
          const r = radius(size)
          const box = CELL_RADIUS_MAX * 2
          return (
            <div key={i} class='flex items-center gap-2'>
              <svg width={box} height={box} class='block'>
                <circle
                  cx={CELL_RADIUS_MAX}
                  cy={CELL_RADIUS_MAX}
                  r={r}
                  fill='#9ca3af'
                  fillOpacity={0.4}
                  stroke='#6b7280'
                  strokeWidth={0.5}
                />
              </svg>
              <span class='text-[10px] tabular-nums text-gray-600'>{size.toLocaleString()}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
