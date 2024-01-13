import { computed, useSignal } from '@preact/signals'
import SymptomSearch from './Search.tsx'
import { SYMPTOMS } from '../../shared/symptoms.ts'
import { PatientSymptomUpsert } from '../../types.ts'
import SymptomInput from './Input.tsx'

const all_symptoms_options = SYMPTOMS.map(({ symptom, category, aliases }) => ({
  id: symptom,
  name: symptom,
  category,
  aliases,
}))

export type SymptomOption = typeof all_symptoms_options[number]

export type EditingSymptom = {
  symptom: string
} & Partial<PatientSymptomUpsert>

export default function SymptomSection(props: {
  patient_symptoms: PatientSymptomUpsert[]
}) {
  const patient_symptoms = useSignal<EditingSymptom[]>(props.patient_symptoms)

  const options = computed(() =>
    all_symptoms_options.filter((o) =>
      patient_symptoms.value.every((ps) => ps.symptom !== o.id)
    )
  )

  const add = (symptom: SymptomOption) =>
    patient_symptoms.value = [...patient_symptoms.value, {
      symptom: symptom.id,
    }]

  return (
    <div className='flex flex-col gap-1'>
      <SymptomSearch
        options={options.value}
        add={add}
      />
      {patient_symptoms.value.map((symptom, i) => (
        <SymptomInput
          key={i}
          name={`symptoms.${i}`}
          value={symptom}
        />
      ))}
    </div>
  )
}
