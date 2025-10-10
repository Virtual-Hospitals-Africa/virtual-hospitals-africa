import { SelectWithOptions, TextArea } from '../../islands/form/Inputs.tsx'
import FormRow from '../library/FormRow.tsx'
import { Maybe } from '../../types.ts'
import FormSection from '../library/FormSection.tsx'
import { EncounterReason } from '../../db.d.ts'
import { ENCOUNTER_REASONS } from '../../shared/reasons.ts'
import { without } from '../../util/without.ts'

export default function ThisVisitSection(
  { this_visit }: {
    this_visit: {
      reason: Maybe<EncounterReason>
      notes?: Maybe<string>
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
            options={without(ENCOUNTER_REASONS, 'follow up')}
            required
          />
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
