import { useState } from 'preact/hooks'
import { FamilyRelation, PatientDemographicInfo } from '../../types.ts'
import FormRow from '../../components/library/form/Row.tsx'
import { TextInput } from '../../components/library/form/Inputs.tsx'
import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'

export default function Kin({
  name,
  value,
}: {
  name: string
  value?: Partial<FamilyRelation>
}) {
  const [patientKin, setPatientKin] = useState<
    Partial<FamilyRelation> | undefined
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
            onSelect={(person: PatientDemographicInfo) =>
              setPatientKin({
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
              ?.family_relation_gendered ?? undefined}
            type='guardian'
            gender={patientKin?.patient_gender}
          />
        </FormRow>
      </div>
  )
}
