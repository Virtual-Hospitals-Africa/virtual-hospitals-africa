import { YesNoQuestion } from '../../../islands/form/inputs/yes_no.tsx'
import { MostRecentRecord } from '../../../islands/MostRecentRecord.tsx'
import { RenderedTask } from '../../../types.ts'
import { HiddenInput } from '../../library/HiddenInput.tsx'
import { uniqueIdentifier } from './uniqueIdentifier.ts'

export function CheckForTask({
  organization_id,
  task,
}: {
  organization_id: string
  task: RenderedTask & { atom: 'finding' }
}) {
  const name = `check_for.${uniqueIdentifier(task)}`

  return (
    <>
      <HiddenInput
        name={`${name}.s_expression`}
        value={task.s_expression}
      />
      <HiddenInput
        name={`${name}.existing_finding.id`}
        value={task.existing_finding?.id}
      />
      <HiddenInput
        name={`${name}.existing_finding.existence`}
        value={task.existing_finding?.existence}
      />
      <YesNoQuestion
        name={`${name}.existence`}
        value={task.existing_finding?.existence}
        label={task.displays.full}
        required
        most_recent_finding={
          <MostRecentRecord
            record={task.existing_finding}
            organization_id={organization_id}
          />
        }
      />
    </>
  )
}
