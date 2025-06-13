import {
  CheckboxInput,
  SelectWithOptions,
  TextArea,
} from '../../islands/form/Inputs.tsx'
import FormRow from '../library/FormRow.tsx'
import { Maybe } from '../../types.ts'
import FormSection from '../library/FormSection.tsx'
import { EncounterReason } from '../../db.d.ts'
import { SqlBool } from 'kysely'
import { ENCOUNTER_REASONS } from '../../shared/encounter.ts'

export default function ThisVisitSection(
  { this_visit, departments }: {
    this_visit: {
      reason: Maybe<EncounterReason>
      emergency: Maybe<SqlBool>
      department_id: Maybe<string>
      notes: Maybe<string>
    }
    departments: {
      id: string
      name: string
    }[]
  },
) {
  return (
    <>
      <FormSection header='Patient Information'>
        <FormRow>
          <SelectWithOptions
            name='reason'
            value={this_visit.reason ?? undefined}
            options={ENCOUNTER_REASONS}
            required
          />
          <SelectWithOptions
            name='department_id'
            label='Assign case to a department'
            value={this_visit.department_id ?? undefined}
            options={departments}
            required
          />
          <CheckboxInput name='emergency' checked={!!this_visit.emergency} />
        </FormRow>
        <FormRow>
          <TextArea
            name='notes'
            label='Additional notes'
            value={this_visit.notes}
          />
        </FormRow>
      </FormSection>
    </>
  )
}
