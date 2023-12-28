import { useState } from 'preact/hooks'
import {
  FamilyRelation,
  PatientDemographicInfo,
  PreExistingConditionWithDrugs,
} from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import {
  CheckboxInput,
  Select,
  TextInput,
} from '../../components/library/form/Inputs.tsx'
import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'

export default function Dependent({
  key,
  name,
  value,
  onRemove,
}: {
  key: string
  name: string
  value?: Partial<FamilyRelation>
  onRemove(): void
}) {
  const [patientDependent, setPatientDependent] = useState<
    Partial<FamilyRelation> | undefined
  >(value ?? undefined)

  return (
    <RemoveRow onClick={onRemove} key={key} labelled>
      <div class='w-full justify-normal'>
        <FormRow>
          <PersonSearch
            name={`${name}.patient`}
            href='/app/patients'
            label='Name'
            required
            addable
            value={{ id: value?.patient_id!, name: value!.patient_name! }}
            onSelect={(person) =>
              setPatientDependent({
                ...value!,
                patient_gender: person.gender,
                patient_phone_number: person.phone_number,
                patient_name: person.name,
              })}
          />
          <TextInput
            name={`${name}.patient_phone_number`}
            label='Phone Number'
            value={patientDependent?.patient_phone_number}
          />
          <RelationshipSelect
            name={`${name}.guardian_relation`}
            value={patientDependent?.guardian_relation ?? undefined}
            type='dependent'
            gender={patientDependent?.patient_gender ?? undefined}
          />
        </FormRow>
      </div>
      {patientDependent && patientDependent.relation_id && (
        <input
          type='hidden'
          name={`${name}.relation_id`}
          value={patientDependent.relation_id}
        />
      )}
    </RemoveRow>
  )
}
