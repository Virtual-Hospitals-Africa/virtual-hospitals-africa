import { computed, effect, useSignal } from '@preact/signals'
import { MedicationSchedule, RenderedOrganizationMedication } from '../../types.ts'
import FormRow from '../../components/library/FormRow.tsx'
import { MedicationOrganizationSearch } from './Search.tsx'
import { DOSAGES, PrescriptionFrequencies } from '../../shared/prescription.ts'
import { Select } from '../form/inputs/select.tsx'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'
import { NumberInput } from '../form/inputs/number.tsx'
import { TextArea } from '../form/inputs/textarea.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import { NoLabelButSpaceAsPlaceholder } from '../form/inputs/labelled.tsx'

export default function MedicationOrganizationPrescriptionInput({
  organization_id,
  name,
}: {
  organization_id: string
  name: string
}) {
  const medication = useSignal<RenderedOrganizationMedication | null>(null)
  const dose_index = useSignal<number | null>(null)
  const route = useSignal<string | null>(null)
  const special_instructions = useSignal<string | null>(null)
  const schedules = useSignal<Partial<MedicationSchedule>[]>([{}])

  effect(() => {
    const m = medication.value
    if (!m) return
    if (dose_index.value !== null) return
    if (m.doses.length === 1) dose_index.value = 0
  })

  effect(() => {
    const m = medication.value
    if (!m) return
    if (route.value) return
    if (m.routes.length === 1) route.value = m.routes[0]
  })

  const selected_dose = computed(() => dose_index.value !== null ? medication.value?.doses[dose_index.value] ?? null : null)

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <MedicationOrganizationSearch
          organization_id={organization_id}
          label='Medication'
          name={name}
          value={medication.value}
          required
          onSelect={(value) => {
            medication.value = value ?? null
            dose_index.value = null
            route.value = null
          }}
        />
      </FormRow>
      <FormRow className='w-full justify-normal'>
        {medication.value && medication.value.routes.length > 1 && (
          <Select
            name={`${name}.route`}
            required
            label='Route'
            onChange={(e) => route.value = e.currentTarget.value || null}
          >
            <option value=''>Select Route</option>
            {medication.value.routes.map((r) => <option key={r} value={r} selected={route.value === r}>{r}</option>)}
          </Select>
        )}
        {medication.value && medication.value.routes.length === 1 && <input name={`${name}.route`} type='hidden' value={medication.value.routes[0]} />}
        <Select
          name={`${name}.dose`}
          required
          label='Dose'
          disabled={!medication.value}
          onChange={(e) => dose_index.value = e.currentTarget.value !== '' ? Number(e.currentTarget.value) : null}
        >
          <option value=''>Select Dose</option>
          {medication.value?.doses.map((dose, i) => (
            <option value={i} selected={dose_index.value === i}>
              {doseLabel(dose)}
            </option>
          ))}
        </Select>
      </FormRow>
      <div>
        <h3 className='py-2 text-sm'>Schedules</h3>
        {schedules.value.map((schedule, index) => {
          const schedule_name = `${name}.schedules.${index}`
          const fields = (
            <ScheduleFields
              labelled={index === 0}
              name={schedule_name}
              value={schedule}
              dose={selected_dose.value}
            />
          )
          if (index === 0) {
            return <div key={index} className='pl-8'>{fields}</div>
          }
          return (
            <RemoveRow
              onClick={() => {
                schedules.value = schedules.value.filter((_, i) => i !== index)
              }}
            >
              {fields}
            </RemoveRow>
          )
        })}
        <AddRow
          onClick={() => {
            schedules.value = [...schedules.value, {}]
          }}
          text='Add Schedule'
        />
      </div>
      <FormRow>
        <TextArea
          name={`${name}.special_instructions`}
          className='w-full'
          label='Special Instructions'
          value={special_instructions.value}
          onInput={(e) => special_instructions.value = e.currentTarget.value}
        />
      </FormRow>
    </div>
  )
}

type Dose = RenderedOrganizationMedication['doses'][number]

function doseLabel(dose: Dose): string {
  const ingredients = dose.ingredients.map((ing) => `${ing.value}${ing.units} ${ing.snomed_concept.name}`).join(', ')
  return ingredients ? `${dose.value} ${dose.description} (${ingredients})` : `${dose.value} ${dose.description}`
}

function dosageLabel(dosage_text: string, dosage_value: number, dose: Dose): string {
  if (dose.description_is_units) {
    return `${dosage_text} (${dosage_value * parseFloat(dose.value)}${dose.description})`
  }
  const unit = dosage_value === 1 ? dose.description : pluralizeUnit(dose.description)
  return `${dosage_text} ${unit}`
}

function pluralizeUnit(description: string): string {
  if (description === 'SUPPOSITORY') return 'SUPPOSITORIES'
  return description + 'S'
}

function ScheduleFields({
  labelled,
  name,
  value,
  dose,
}: {
  labelled?: boolean
  name: string
  value: Partial<MedicationSchedule>
  dose: Dose | null
}) {
  const dosage = useSignal(value.dosage ?? '')
  const frequency = useSignal(value.frequency ?? '')
  const duration = useSignal(value.duration ?? 1)
  const duration_unit = useSignal(value.duration_unit ?? 'days')

  return (
    <FormRow className='w-full pb-2 justify-normal'>
      <Select
        name={`${name}.dosage`}
        label={labelled ? 'Dosage' : null}
        required
        disabled={!dose}
      >
        <option value=''>Select Dosage</option>
        {dose && DOSAGES.map(([dosage_text, dosage_value]) => (
          <option value={dosage_value} selected={dosage.value === dosage_value}>
            {dosageLabel(dosage_text, parseFloat(dosage_value), dose)}
          </option>
        ))}
      </Select>
      <SelectWithOptions
        name={`${name}.frequency`}
        required
        label={labelled ? 'Frequency' : null}
        disabled={!dose}
        blank_option='Select Frequency'
        value={frequency.value}
        options={Object.entries(PrescriptionFrequencies).map(([code, label]) => ({
          value: code,
          label: `${code} - ${label}`,
        }))}
      />
      <NumberInput
        name={`${name}.duration`}
        label={labelled ? 'Duration' : null}
        value={duration.value}
        min={1}
        required
      />
      <SelectWithOptions
        name={`${name}.duration_unit`}
        label={labelled ? NoLabelButSpaceAsPlaceholder : null}
        required
        value={duration_unit.value}
        options={[
          { value: 'days', label: 'Days' },
          { value: 'weeks', label: 'Weeks' },
          { value: 'months', label: 'Months' },
          { value: 'years', label: 'Years' },
        ]}
      />
    </FormRow>
  )
}
