import FormRow from '../library/FormRow.tsx'
import { Maybe } from '../../types.ts'
import FormSection from '../library/FormSection.tsx'
import { EncounterReason } from '../../db.d.ts'
import { ENCOUNTER_REASONS } from '../../shared/reasons.ts'
import { without } from '../../util/without.ts'
import { SelectWithOptions } from '../../islands/form/inputs/select_with_options.tsx'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'

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
