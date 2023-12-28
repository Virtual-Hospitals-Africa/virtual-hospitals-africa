import { useState } from 'preact/hooks'
import {
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
import ReligionSelect from '../ReligionSelect.tsx'
import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'

export default function Dependent({
  key,
  name,
  onRemove,
}: {
  key: string
  name: string
  onRemove(): void
}) {
  const [patientDependent, setPatientDependent] = useState<
    PatientDemographicInfo
  >()

  return (
    <RemoveRow onClick={onRemove} key={key} labelled>
      <div class='w-full justify-normal'>
        <FormRow>
          <PersonSearch
            name={`${name}.dependent`}
            href='/app/patients'
            label='Name'
            required
            addable
            onSelect={(person) => setPatientDependent(person)}
          />
          <TextInput
            name={`${name}.phone_number`}
            label='Phone Number'
            value={patientDependent?.phone_number}
          />
          <RelationshipSelect
            name={`${name}.dependent`}
            type='dependent'
            gender={patientDependent?.gender ?? undefined}
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
