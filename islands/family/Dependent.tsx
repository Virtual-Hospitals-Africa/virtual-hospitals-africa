import { useState } from 'preact/hooks'
import { FamilyRelation, PatientDemographicInfo } from '../../types.ts'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import { TextInput } from '../../components/library/form/Inputs.tsx'
import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'

export default function Dependent({
  name,
  value,
  onRemove,
}: {
  name: string
  value?: Partial<FamilyRelation>
  onRemove(): void
}) {
  const [patientDependent, setPatientDependent] = useState<
    Partial<FamilyRelation> | undefined
  >(value ?? undefined)

  return (
    <RemoveRow onClick={onRemove} labelled>
      <div class='w-full justify-normal'>
        <FormRow>
          <PersonSearch
            name={`${name}.patient`}
            href='/app/patients'
            label='Name'
            required
            addable
            value={patientDependent &&
              {
                id: patientDependent.patient_id,
                name: patientDependent.patient_name!,
              }}
            // deno-lint-ignore no-explicit-any
            onSelect={(person: any) =>
              setPatientDependent(
                person && {
                  patient_gender: person.gender ||
                    patientDependent?.patient_gender,
                  patient_phone_number: person.phone_number ||
                    patientDependent?.patient_phone_number,
                  patient_name: person.name || patientDependent?.patient_name,
                },
              )}
          />
          <TextInput
            name={`${name}.patient_phone_number`}
            label='Phone Number'
            value={patientDependent?.patient_phone_number}
          />
          <RelationshipSelect
            name={`${name}.family_relation_gendered`}
            family_relation_gendered={patientDependent
              ?.family_relation_gendered ?? undefined}
            type='dependent'
            gender={patientDependent?.patient_gender}
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
