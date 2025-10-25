import { useState } from 'preact/hooks'
import { FamilyRelation } from '../../types.ts'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/FormRow.tsx'

import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { TextInput } from '../form/inputs/text.tsx'

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
            search_route='/app/patients'
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
                  patient_sex: person.sex ||
                    patientDependent?.patient_sex,
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
            name={`${name}.family_relation_sexed`}
            family_relation_sexed={patientDependent
              ?.family_relation_sexed ?? undefined}
            type='dependent'
            sex={patientDependent?.patient_sex}
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
