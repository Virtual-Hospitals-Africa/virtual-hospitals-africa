import { useState } from 'preact/hooks'
import { NextOfKin } from '../../types.ts'
import FormRow from '../../components/library/FormRow.tsx'

import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { TextInput } from '../form/inputs/text.tsx'

export default function NextOfKinInput({
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
          search_route='/app/patients'
          label='Name'
          addable
          required
          value={patientKin &&
            {
              id: patientKin.patient_id,
              name: patientKin.patient_name!,
            }}
          // deno-lint-ignore no-explicit-any
          onSelect={(person: any) =>
            person && setPatientKin({
              patient_sex: person.sex ||
                patientKin?.patient_sex,
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
          required
          name={`${name}.family_relation_sexed`}
          family_relation_sexed={patientKin
            ?.relation ?? undefined}
          type='guardian'
          sex={patientKin?.patient_sex}
          additionalRelations={new Map([
            ['friend', 'friend'],
            ['spouse', 'spouse'],
          ])}
        />
      </FormRow>
    </div>
  )
}
