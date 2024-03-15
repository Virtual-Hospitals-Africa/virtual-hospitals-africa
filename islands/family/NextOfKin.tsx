import { useState } from 'preact/hooks'
import { NextOfKin } from '../../types.ts'
import FormRow from '../form/Row.tsx'
import { TextInput } from '../form/Inputs.tsx'
import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'

export default function NextOfKin({
  name,
  value,
}: {
  name: string
  value?: Partial<NextOfKin>
}) {
  const [patientKin, setPatientKin] = useState<
    Partial<NextOfKin> | undefined
  >(value ?? undefined)

  return (
    <div class='w-full justify-normal'>
      <FormRow>
        <PersonSearch
          name={`${name}.patient`}
          href='/app/patients'
          label='Name'
          addable
          value={patientKin &&
            {
              id: patientKin.patient_id,
              name: patientKin.patient_name!,
            }}
          // deno-lint-ignore no-explicit-any
          onSelect={(person: any) =>
            person && setPatientKin({
              patient_gender: person.gender ||
                patientKin?.patient_gender,
              patient_phone_number: person.phone_number ||
                patientKin?.patient_phone_number,
              patient_name: person.name || patientKin?.patient_name,
            })}
        />
        <TextInput
          name={`${name}.patient_phone_number`}
          label='Phone Number'
          value={patientKin?.patient_phone_number}
        />
        <RelationshipSelect
          name={`${name}.family_relation_gendered`}
          family_relation_gendered={patientKin
            ?.relation ?? undefined}
          type='guardian'
          gender={patientKin?.patient_gender}
          additionalRelations={new Map([
            ['friend', 'friend'],
            ['spouse', 'spouse'],
          ])}
        />
      </FormRow>
    </div>
  )
}
