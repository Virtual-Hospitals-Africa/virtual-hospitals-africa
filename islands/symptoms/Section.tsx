import { useSignal } from '@preact/signals'
import { RenderedPatientSymptom } from '../../types.ts'
import SymptomInput from './Input.tsx'
import { AddRow } from '../AddRemove.tsx'

export type EditingSymptom =
  | RenderedPatientSymptom & { removed?: false; is_new?: false }
  | { removed: true; is_new?: false }
  | { removed?: false; is_new: true }

export default function SymptomSection(props: {
  patient_symptoms: RenderedPatientSymptom[]
  today: string
}) {
  const patient_symptoms = useSignal<EditingSymptom[]>(props.patient_symptoms)

  const add = () =>
    patient_symptoms.value = [...patient_symptoms.value, { is_new: true }]

  return (
    <div className='flex flex-col space-y-2'>
      {patient_symptoms.value.map((symptom, index) => (
        !symptom.removed && (
          <SymptomInput
            key={index}
            name={`symptoms.${index}`}
            value={!symptom.is_new && !symptom.removed ? symptom : undefined}
            today={props.today}
            remove={() =>
              patient_symptoms.value = patient_symptoms.value.map(
                (s, i) => (i === index ? { removed: true } : s),
              )}
          />
        )
      ))}
      <AddRow text='Add Symptom' onClick={add} />
    </div>
  )
}
