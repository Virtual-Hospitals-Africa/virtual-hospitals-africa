import { useSignal } from '@preact/signals'
import { RenderedPatientSymptom } from '../../types.ts'
import SymptomInput from './Input.tsx'
import EmptyState from '../../components/library/EmptyState.tsx'
import { Symptoms } from '../../components/library/icons/SeekingTreatment.tsx'
import { AddRow } from '../AddRemove.tsx'

export type EditingSymptom = Partial<RenderedPatientSymptom> & {
  removed?: boolean
}

export default function SymptomSection(props: {
  patient_symptoms: RenderedPatientSymptom[]
  today: string
}) {
  const patient_symptoms = useSignal<EditingSymptom[]>(props.patient_symptoms)

  const add = () => patient_symptoms.value = [...patient_symptoms.value, {}]

  return (
    <div className='flex flex-col space-y-2'>
      {patient_symptoms.value.map((symptom, index) => (
        !symptom.removed && (
          <SymptomInput
            key={index}
            name={`symptoms.${index}`}
            value={symptom}
            today={props.today}
            remove={() =>
              patient_symptoms.value = patient_symptoms.value.map(
                (s, i) => (i === index ? { ...s, removed: true } : s),
              )}
          />
        )
      ))}
      {
        /* {patient_symptoms.value.length === 0 && (
        <EmptyState
          header='No symptoms'
          explanation='Use the search box above to add symptoms.'
          icon={<Symptoms className='mx-auto h-12 w-12 text-gray-400' />}
        />
      )} */
      }
      <AddRow text='Add Symptom' onClick={add} />
    </div>
  )
}
