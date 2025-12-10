import { useSignal } from '@preact/signals'
import { PencilIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { TextArea } from '../form/inputs/textarea.tsx'
import PriorityDropdown from './PriorityDropdown.tsx'
import { ReferenceRangeIndicator } from '../../components/vitals/SimpleReferenceRangeIndicator.tsx'

interface VitalsTableRowProps {
  measurement: any
  range: any
  previousValue?: number
  previousDisplay?: string
  systemEvaluation: string
  isComputed: boolean
  isComponentOfComputed: boolean
  vitalDisplayName: string
}

export default function VitalsTableRow({
  measurement,
  range,
  previousValue,
  previousDisplay,
  systemEvaluation,
  isComputed,
  isComponentOfComputed,
  vitalDisplayName,
}: VitalsTableRowProps) {
  const name = `findings.${measurement.finding_id}`
  const hasExistingNote = !!measurement.existing_evaluation?.note
  const showNote = useSignal(hasExistingNote)
  const value = parseFloat(measurement.value_display)

  return (
    <>
      <tr className={isComponentOfComputed ? 'bg-gray-50' : ''}>
        <td
          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
            isComputed ? 'font-bold' : 'font-normal'
          } ${isComponentOfComputed ? 'pl-10' : ''}`}
        >
          {vitalDisplayName}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
          {measurement.value_display}
        </td>
        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
          {previousDisplay || '-'}
        </td>
        <td className='px-6 py-4'>
          {range && !isNaN(value)
            ? (
              <ReferenceRangeIndicator
                value={value}
                previousValue={previousValue}
                normal_min={range.normal_min}
                normal_max={range.normal_max}
                critical_min={range.critical_min}
                critical_max={range.critical_max}
                units={range.units}
              />
            )
            : (
              <span className='text-gray-500 text-sm'>
                No range available
              </span>
            )}
        </td>
        <td className='px-6 py-4 whitespace-nowrap'>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              systemEvaluation === 'CRITICAL'
                ? 'bg-red-100 text-red-800'
                : systemEvaluation === 'Abnormal'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {systemEvaluation}
          </span>
        </td>
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='flex items-center gap-2'>
            <PriorityDropdown
              name={name}
              vitalName={vitalDisplayName}
              initialPriority={measurement.existing_evaluation?.priority}
            />
          </div>
        </td>
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => (showNote.value = !showNote.value)}
              className={`inline-flex items-center justify-center size-10 border rounded-md cursor-pointer hover:bg-gray-50 ${
                showNote.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300'
              }`}
              title={`Add note for ${vitalDisplayName}`}
            >
              <PencilIcon
                className={`size-4 ${
                  showNote.value ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
            </button>
            <HiddenInput
              name={`${name}.snomed_concept_id`}
              value={measurement.snomed_concept_id}
            />
            <HiddenInput
              name={`${name}.finding_id`}
              value={measurement.finding_id}
            />
          </div>
        </td>
      </tr>
      {showNote.value && (
        <tr>
          <td colSpan={7} className='px-6 py-4 bg-gray-50'>
            <div className='max-w-2xl'>
              <TextArea
                name={`${name}.note`}
                label='Clinical Notes'
                placeholder={`Add clinical notes for ${vitalDisplayName}...`}
                rows={3}
                value={measurement.existing_evaluation?.note || ''}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
