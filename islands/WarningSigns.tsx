import { KeyedWarningSign } from '../shared/warning_signs.ts'

// SNOMED concept IDs for priority levels
const PRIORITY = {
  EMERGENCY: '25876001',
  VERY_URGENT: '1356878002',
  URGENT: '103391001',
} as const

type PriorityLevel = (typeof PRIORITY)[keyof typeof PRIORITY]

const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; headerBg: string; headerText: string }
> = {
  [PRIORITY.EMERGENCY]: {
    label: 'EMERGENCY',
    headerBg: '#fee2e2', // error-bg
    headerText: '#991b1b', // error-textIcon
  },
  [PRIORITY.VERY_URGENT]: {
    label: 'VERY URGENT',
    headerBg: '#ffedd5', // accent-orange-bg
    headerText: '#c2410c', // accent-orange-textIcon
  },
  [PRIORITY.URGENT]: {
    label: 'URGENT',
    headerBg: '#fef9c3', // warning-bg
    headerText: '#854d0e', // warning-textIcon
  },
}

const PRIORITIES_IN_ORDER: PriorityLevel[] = [
  PRIORITY.EMERGENCY,
  PRIORITY.VERY_URGENT,
  PRIORITY.URGENT,
]

function groupByPriority(signs: readonly KeyedWarningSign[]) {
  const grouped: Record<PriorityLevel, KeyedWarningSign[]> = {
    [PRIORITY.EMERGENCY]: [],
    [PRIORITY.VERY_URGENT]: [],
    [PRIORITY.URGENT]: [],
  }
  for (const sign of signs) {
    const priority = sign.sats_priority_snomed_concept_id as PriorityLevel
    if (grouped[priority]) {
      grouped[priority].push(sign)
    }
  }
  return grouped
}

function KeyedWarningSignCheckbox({ sign }: { sign: KeyedWarningSign }) {
  const name = `warning_signs.${sign.key}`
  return (
    <label class='flex gap-3 items-start cursor-pointer'>
      <div class='pt-0.5'>
        <input
          id={name}
          type='checkbox'
          name={name}
          value='true'
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
  priority,
  signs,
}: {
  priority: PriorityLevel
  signs: KeyedWarningSign[]
}) {
  const config = PRIORITY_CONFIG[priority]
  const columns = 5
  const rows: KeyedWarningSign[][] = []

  for (let i = 0; i < signs.length; i += columns) {
    rows.push(signs.slice(i, i + columns))
  }

  return (
    <div class='flex flex-col w-full overflow-hidden rounded-xl border border-gray-200'>
      {/* Header */}
      <div
        class='py-3 flex items-center justify-center'
        style={{ backgroundColor: config.headerBg }}
      >
        <span
          class='text-xl font-semibold uppercase'
          style={{ color: config.headerText }}
        >
          {config.label}
        </span>
      </div>
      {/* Content rows */}
      <div class='flex flex-col bg-white'>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} class='flex'>
            {row.map((sign) => (
              <div
                key={sign.key}
                class='flex-1 p-3 min-w-0'
              >
                <KeyedWarningSignCheckbox sign={sign} />
              </div>
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
  warning_signs: readonly KeyedWarningSign[]
}) {
  const grouped = groupByPriority(warning_signs)

  return (
    <div class='flex flex-col gap-4 w-full'>
      {PRIORITIES_IN_ORDER.map((priority) => {
        const signs = grouped[priority]
        if (!signs.length) return null
        return (
          <KeyedWarningSignsTable
            key={priority}
            priority={priority}
            signs={signs}
          />
        )
      })}
    </div>
  )
}
