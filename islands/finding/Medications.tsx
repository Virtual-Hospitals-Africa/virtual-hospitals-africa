import { Signal, useComputed, useSignal, useSignalEffect } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import AsyncSearch from '../AsyncSearch.tsx'
import { Button } from '../../components/library/Button.tsx'
import { PlusIcon, XMarkIcon } from '../../components/library/icons/heroicons/mini.tsx'
import { medicationFormIcon } from '../../components/library/icons/medication_forms.tsx'
import { Select } from '../form/inputs/select.tsx'
import { TextInput } from '../form/inputs/text.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { TextArea } from '../form/inputs/textarea.tsx'
import type { MedicinalProductOption, MedicinalProductSearchResult } from '../../types.ts'
import { DURATION_UNITS, Medication, medicationDisplay, medicationToSExpression, parseMedicationSExpression } from '../../shared/medication_s_expression.ts'
import { MEDICATION_FREQUENCIES, medicationChoices, strengthsKey, withImplied, withoutImplied } from '../../shared/medication_options.ts'
import { DOSAGES } from '../../shared/prescription.ts'
import capitalize from '../../util/capitalize.ts'
import cls from '../../util/cls.ts'
import compact from '../../util/compact.ts'

const search_route = '/app/snomed/medicinal-product'
const options_route = '/app/snomed/medicinal-product-options'

// How long the panel takes to collapse into its pill once added
const COLLAPSE_MILLISECONDS = 200

/*
  The forms, strengths and routes a medicinal product comes in, fetched once per product for
  as long as the page lives. Both the panel (to know what to ask) and the pill (to describe what
  the product implies) want them.
*/
const options_by_product_name = new Map<string, Promise<MedicinalProductOption[]>>()

function fetchOptions(medicinal_product_name: string): Promise<MedicinalProductOption[]> {
  const cached = options_by_product_name.get(medicinal_product_name)
  if (cached) return cached
  const fetching = fetch(`${options_route}?${new URLSearchParams({ name: medicinal_product_name })}`, {
    headers: { accept: 'application/json' },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`${options_route} responded ${response.status}: ${await response.text()}`)
      const { options } = await response.json()
      return options
    })
    .catch((error) => {
      // Without options nothing is implied and nothing is asked beyond dosage, frequency and
      // duration, so the medication can still be recorded. Don't cache the failure.
      console.error(error)
      options_by_product_name.delete(medicinal_product_name)
      return []
    })
  options_by_product_name.set(medicinal_product_name, fetching)
  return fetching
}

function useOptions(medicinal_product_name: string): Signal<MedicinalProductOption[] | null> {
  const options = useSignal<MedicinalProductOption[] | null>(null)
  useEffect(() => {
    let current = true
    options.value = null
    fetchOptions(medicinal_product_name).then((fetched) => {
      if (current) options.value = fetched
    })
    return () => {
      current = false
    }
  }, [medicinal_product_name])
  return options
}

/*
  A medication in the search box. Straight from the search it has no medication yet: it is
  picked, and what the health worker enters in the panel makes it one.
*/
type AddedMedication = {
  id: string
  name: string
  medication: Medication
  chip: preact.ComponentChildren
}

type Picked = {
  // The brand name when a brand was picked, otherwise the active ingredients
  name: string
  // The active ingredients, when name is the brand name
  description: string | null
  medicinal_product_name: string
  medication_id: string | null
}

type SearchItem = AddedMedication | MedicinalProductSearchResult

function isAdded(item: SearchItem): item is AddedMedication {
  return 'medication' in item
}

// "10mg cetirizine" with the icon of its form, or with its form named when there is no icon for it
function MedicationPill({ medication }: { medication: Medication }) {
  const options = useOptions(medication.snomed_concept.name)
  const in_full = withImplied(medication, options.value ?? [])
  const display = medicationDisplay(in_full)
  const FormIcon = medicationFormIcon({ form: in_full.form?.name ?? null, route: in_full.route?.name ?? null })

  return (
    <span className='flex items-center gap-1' title={display.full}>
      {FormIcon && <FormIcon className='h-4 w-4 shrink-0 text-indigo-700' />}
      {compact([display.strength, display.name, !FormIcon && display.form]).join(' ')}
    </span>
  )
}

function asAdded(medication: Medication): AddedMedication {
  return {
    id: crypto.randomUUID(),
    name: medicationDisplay(medication).short,
    medication,
    chip: <MedicationPill medication={medication} />,
  }
}

function Implied({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-2' data-implied={label.toLowerCase()}>
      <span className='text-sm font-semibold leading-5 text-gray-600'>{label}</span>
      <span className='text-sm font-medium text-gray-900'>{value}</span>
    </div>
  )
}

function pluralize(units: string, value: string) {
  const singular = units.replace(/s$/, '')
  return parseFloat(value) === 1 ? singular : `${singular}s`
}

/*
  The details of a picked medication. A detail the medicinal product leaves no choice about
  (its only form, say) is shown, not asked, and not recorded. Everything asked is optional.
*/
function MedicationPanel({ picked, onChange, onAdd, onRemove }: {
  picked: Picked
  // Called with the medication as currently entered: once shown and again on every edit
  onChange(medication: Medication): void
  onAdd(medication: Medication): void
  onRemove(): void
}) {
  const options = useOptions(picked.medicinal_product_name)
  const form = useSignal<string | null>(null)
  const strength = useSignal<string | null>(null)
  const route = useSignal<string | null>(null)
  const dosage = useSignal('')
  const frequency = useSignal('')
  const duration = useSignal<number | string>('')
  const duration_units = useSignal<string>('days')
  const started = useSignal('')
  const notes = useSignal('')
  const collapsing = useSignal(false)

  const choices = useComputed(() => medicationChoices(options.value ?? [], { form: form.value, strength: strength.value, route: route.value }))
  const dosage_units = useComputed(() => choices.value.dosage_units ?? 'dose')

  const medication = useComputed((): Medication => {
    const frequency_concept = MEDICATION_FREQUENCIES.find((concept) => concept.name === frequency.value)
    const duration_value = String(duration.value).trim()
    const entered: Medication = {
      snomed_concept: { name: picked.medicinal_product_name, category: 'medicinal product' },
      form: choices.value.form,
      route: choices.value.route,
      strengths: choices.value.strength ?? [],
      dosage: dosage.value ? { value: dosage.value, units: dosage_units.value } : null,
      frequency: frequency_concept ? { name: frequency_concept.name, category: frequency_concept.category } : null,
      duration: /^\d+$/.test(duration_value) && parseInt(duration_value) > 0 ? { value: duration_value, units: duration_units.value } : null,
      started: started.value || null,
      medication_id: picked.medication_id,
      notes: notes.value.trim() || null,
    }
    return withoutImplied(entered, options.value ?? [])
  })

  useSignalEffect(() => {
    onChange(medication.value)
  })

  // Brought into view when picked, as the modal may be scrolled such that it is out of sight
  const panel_ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    panel_ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  function add() {
    collapsing.value = true
    const added = medication.value
    setTimeout(() => onAdd(added), COLLAPSE_MILLISECONDS)
  }

  const { forms, strengths, routes } = choices.value

  return (
    <div
      ref={panel_ref}
      id='medication-panel'
      className={cls(
        'flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 origin-top transition-all ease-in',
        collapsing.value ? 'max-h-0 scale-y-0 opacity-0 overflow-hidden !p-0 !border-0' : 'max-h-[60rem] opacity-100',
      )}
      style={{ transitionDuration: `${COLLAPSE_MILLISECONDS}ms` }}
    >
      <div className='flex items-start gap-2'>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-semibold text-gray-900'>{picked.name}</p>
          {picked.description && <p className='text-xs text-gray-500'>{picked.description}</p>}
        </div>
        <button
          type='button'
          title={`Remove ${picked.name}`}
          className='rounded-md p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          onClick={onRemove}
        >
          <XMarkIcon className='h-5 w-5' />
        </button>
      </div>

      {forms.length === 1 && choices.value.form && <Implied label='Form' value={choices.value.form.name} />}
      {forms.length > 1 && (
        <Select
          name={null}
          label='Form'
          onChange={(event) => {
            form.value = event.currentTarget.value || null
            strength.value = null
            route.value = null
          }}
        >
          <option value=''>Select form</option>
          {forms.map((option) => <option key={option.name} value={option.name} selected={form.value === option.name}>{option.name}</option>)}
        </Select>
      )}

      {strengths.length === 1 && choices.value.strength && <Implied label='Strength' value={strengthsKey(choices.value.strength)} />}
      {strengths.length > 1 && (
        <Select
          name={null}
          label='Strength'
          onChange={(event) => {
            strength.value = event.currentTarget.value || null
            route.value = null
          }}
        >
          <option value=''>Select strength</option>
          {strengths.map(strengthsKey).map((key) => <option key={key} value={key} selected={strength.value === key}>{key}</option>)}
        </Select>
      )}

      {routes.length === 1 && choices.value.route && <Implied label='Route' value={choices.value.route.name} />}
      {routes.length > 1 && (
        <Select
          name={null}
          label='Route'
          onChange={(event) => route.value = event.currentTarget.value || null}
        >
          <option value=''>Select route</option>
          {routes.map((option) => <option key={option.name} value={option.name} selected={route.value === option.name}>{option.name}</option>)}
        </Select>
      )}

      <div className='flex items-end gap-3'>
        <Select
          name={null}
          label='Dosage'
          onChange={(event) => dosage.value = event.currentTarget.value}
        >
          <option value=''>Select</option>
          {DOSAGES.map(([dosage_text, dosage_value]) => (
            <option key={dosage_value} value={dosage_value} selected={dosage.value === dosage_value}>
              {dosage_text} {pluralize(dosage_units.value, dosage_value)}
            </option>
          ))}
        </Select>
        <Select
          name={null}
          label='Frequency'
          onChange={(event) => frequency.value = event.currentTarget.value}
        >
          <option value=''>Select</option>
          {MEDICATION_FREQUENCIES.map((concept) => (
            <option key={concept.id} value={concept.name} selected={frequency.value === concept.name}>{concept.name}</option>
          ))}
        </Select>
      </div>

      <div className='flex items-end gap-3'>
        <TextInput name={null} label='Duration' signal={duration} inputmode='numeric' min={1} />
        <Select
          name={null}
          label={null}
          onChange={(event) => duration_units.value = event.currentTarget.value}
        >
          {DURATION_UNITS.map((units) => <option key={units} value={units} selected={duration_units.value === units}>{capitalize(units)}</option>)}
        </Select>
      </div>

      <DateInput name={null} label='Start date' signal={started} max={new Date().toISOString().slice(0, 10)} />
      <TextArea name={null} label='Notes' signal={notes} rows={2} />

      <div className='flex justify-end'>
        <Button
          id='medication-panel-add'
          type='button'
          variant='primary'
          left_icon={<PlusIcon className='h-4 w-4' />}
          onClick={add}
        >
          Add
        </Button>
      </div>
    </div>
  )
}

function asPicked(result: MedicinalProductSearchResult): Picked {
  return {
    name: result.name,
    description: result.description,
    medicinal_product_name: result.snomed_concept.name,
    medication_id: result.medication_id,
  }
}

/*
  The medications a patient is taking due to the finding. Searching picks a medication, opening a
  panel below the search box for its details; adding it collapses the panel into a pill in the
  search box, where more can be searched for. A medication still in the panel when the finding
  is saved is saved as entered so far: the health worker picked it, so it is not dropped.
*/
export function Medications({ initial, onChange }: {
  // (medication ...) s-expressions, see shared/medication_s_expression.ts
  initial: string[]
  onChange(medication_s_expressions: string[]): void
}) {
  const items = useSignal<SearchItem[]>(initial.map((medication_s_expression) => {
    const parsed = parseMedicationSExpression(medication_s_expression)
    assert(parsed.ok, parsed.ok ? '' : parsed.error)
    return asAdded(parsed.value)
  }))
  const picked = useSignal<Picked | null>(null)
  const in_panel = useSignal<Medication | null>(null)

  // The search adds what is selected straight to its pills. A selection is not a medication
  // until its details are entered, so it is taken back out and opened in the panel.
  useSignalEffect(() => {
    const selection = items.value.find((item) => !isAdded(item))
    if (!selection || isAdded(selection)) return
    items.value = items.value.filter(isAdded)
    picked.value = asPicked(selection)
    in_panel.value = null
  })

  useSignalEffect(() => {
    const added = items.value.filter(isAdded).map((item) => item.medication)
    onChange(compact([...added, in_panel.value]).map(medicationToSExpression))
  })

  return (
    <div className='flex flex-col gap-2' id='finding-medications'>
      <h3 className='text-sm font-semibold text-gray-900'>Medications</h3>
      <AsyncSearch<SearchItem>
        multi
        search_route={search_route}
        signal={items}
        placeholder='Search for a medication...'
        option_description_field='description'
        skip_blank_search
      />
      {picked.value && (
        <MedicationPanel
          // A panel per pick, so picking another medication starts from blank
          key={`${picked.value.medicinal_product_name}:${picked.value.medication_id}`}
          picked={picked.value}
          onChange={(medication) => in_panel.value = medication}
          onAdd={(medication) => {
            items.value = [...items.value, asAdded(medication)]
            picked.value = null
            in_panel.value = null
          }}
          onRemove={() => {
            picked.value = null
            in_panel.value = null
          }}
        />
      )}
    </div>
  )
}
