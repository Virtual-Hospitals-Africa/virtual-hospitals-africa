import { useState } from 'preact/hooks'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import {
  CheckboxInput,
  TextInput,
} from '../../components/library/form/Inputs.tsx'
import ReligionSelect from '../ReligionSelect.tsx'
import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { PatientDemographicInfo } from '../../types.ts'

export default function Guardian({
  key,
  name,
  onRemove,
}: {
  key: string
  name: string
  onRemove(): void
}) {
  const [patientGuardian, setPatientGuardian] = useState<
    PatientDemographicInfo
  >()

  return (
    <RemoveRow onClick={onRemove} key={'test'} labelled>
      <div class='w-full justify-normal'>
        <FormRow>
          <PersonSearch
            name={`${name}.guardian`}
            href='/app/patients'
            label='Name'
            required
            addable
            onSelect={(person) => setPatientGuardian(person)}
          />
          <RelationshipSelect
            name={`${name}.guardian`}
            type='guardian'
            gender={patientGuardian?.gender ?? undefined}
          />
          <CheckboxInput
            name={`${name}.next_of_kin`}
            required
            label='Next of kin'
            onInput={(event)=> {
              //Only one kin allowed
              const target = event.target as HTMLInputElement
              if (target.checked) {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(function (cb : Element) {
                  const input = cb as HTMLInputElement;
                  if (cb !== target && input.name.includes('next_of_kin')) {
                    input.checked = false;
                  }
                });
              }
            }}
          />
        </FormRow>
        <FormRow>
          <TextInput name={`${name}.phone_number`} label='Phone Number' value={patientGuardian?.phone_number} />
        </FormRow>
        {
          /* <FormRow>
          <TextInput name={`${name}.profession`} label='Profession' />
          <TextInput name={`${name}.work_location`} label='Work Location' />
          <ReligionSelect />
        </FormRow> */
        }
      </div>
    </RemoveRow>
  )
}
