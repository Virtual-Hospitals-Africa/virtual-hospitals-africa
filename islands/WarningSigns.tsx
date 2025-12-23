
import { CheckedWarningSign } from '../types.ts'
import { groupBy } from '../util/groupBy.ts'

const PRIORITIES = [
  {
    priority: 'Emergency' as const,
    header_bg: '#fee2e2', // error-bg
    header_text: '#991b1b', // error-textIcon
  },
  {
    priority: 'Very urgent' as const,
    header_bg: '#ffedd5', // accent-orange-bg
    header_text: '#c2410c', // accent-orange-textIcon
  },
  {
    priority: 'Urgent' as const,
    header_bg: '#fef9c3', // warning-bg
    header_text: '#854d0e', // warning-textIcon
  },
]

type PriorityConfig = typeof PRIORITIES[number]

function KeyedWarningSignCheckbox({ sign }: { sign: CheckedWarningSign }) {
  const name = `warning_signs.${sign.key}`
  return (
    <label class='flex gap-3 items-start cursor-pointer'>
      <div class='pt-0.5'>
        <input
          id={name}
          type='checkbox'
          name={name}
          value={sign.clinical_finding_s_expression}
          checked={sign.checked}
          class='w-5 h-5 rounded-md border-gray-300 text-indigo-700 focus:ring-indigo-700'
        />
      </div>
      <label class='flex flex-col gap-1' for={name}>
        <span class='text-sm font-medium text-gray-600 leading-5'>
          {sign.sats_primary_name}
        </span>
        {sign.sats_secondary_text && (
          <span class='text-xs text-gray-500 leading-4'>
            {sign.sats_secondary_text}
          </span>
        )}
      </label>
    </label>
  )
}

function KeyedWarningSignsTable({
  priority_config,
  signs,
}: {
  priority_config: PriorityConfig
  signs: CheckedWarningSign[]
}) {
  const columns = 5
  const rows: CheckedWarningSign[][] = []

  for (let i = 0; i < signs.length; i += columns) {
    rows.push(signs.slice(i, i + columns))
  }

  return (
    <div class='flex flex-col w-full overflow-hidden rounded-xl border border-gray-200'>
      {/* Header */}
      <div
        class='py-3 flex items-center justify-center'
        style={{ backgroundColor: priority_config.header_bg }}
      >
        <span
          class='text-xl font-semibold uppercase'
          style={{ color: priority_config.header_text }}
        >
          {priority_config.priority}
        </span>
      </div>
      {/* Content rows */}
      <div class='flex flex-col bg-white'>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} class='flex'>
            {row.map((sign) => (
              console.log(sign),
                (
                  <div
                    key={sign.key}
                    class='flex-1 p-3 min-w-0'
                  >
                    <KeyedWarningSignCheckbox sign={sign} />
                  </div>
                )
            ))}
            {/* Fill remaining columns with empty cells */}
            {row.length < columns &&
              Array.from({ length: columns - row.length }).map((_, i) => (
                <div key={`empty-${i}`} class='flex-1 p-3 min-w-0' />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KeyedWarningSigns({
  warning_signs,
}: {
  warning_signs: CheckedWarningSign[]
}) {
  const grouped = groupBy(warning_signs, 'sats_priority')

  return (
    <div class='flex flex-col gap-4 w-full'>
      {PRIORITIES.map((priority_config) => {
        const signs = grouped.get(priority_config.priority)
        if (!signs?.length) return null
        return (
          <KeyedWarningSignsTable
            key={priority_config.priority}
            priority_config={priority_config}
            signs={signs}
          />
        )
      })}
    </div>
  )
}
