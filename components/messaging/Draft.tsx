import { RenderedMessageDraft } from '../../types.ts'
import Form from '../library/Form.tsx'
import { Button } from '../library/Button.tsx'
import PriorityDropdown from '../../islands/messaging/drafts/PriorityDropdown.tsx'
import RichTextEditor from '../../islands/messaging/drafts/RichTextEditor.tsx'
import RemovableChip from '../RemovableChip.tsx'
import { TargetsRow } from '../../islands/messaging/drafts/TargetsRow.tsx'

export type DraftProps = {
  draft?: Partial<RenderedMessageDraft>
}

export default function MessageDraft({ draft = {} }: DraftProps) {
  const priority = draft.priority ?? 'Emergency'
  const body = draft.body ?? ''

  // Mock data for demonstration - these would come from the draft object
  const regions = [
    {
      target_value: '1',
      target_type: 'region' as const,
      display_name: 'Polokwane',
    },
  ]
  const facilities = [
    {
      target_value: '1',
      target_type: 'organization' as const,
      display_name: 'All facilities',
    },
    {
      target_value: '2',
      target_type: 'organization' as const,
      display_name: 'All hospitals',
    },
    {
      target_value: '3',
      target_type: 'organization' as const,
      display_name: 'All clinics',
    },
  ]
  const recipients = [
    {
      target_value: 'doctor',
      target_type: 'profession' as const,
      display_name: 'All doctors',
    },
  ]
  const concerning = ['Patient: Andries Dlamini', 'ARIPIPRAZOLE prescription']
  const subject = 'What is the correct dosage?'

  return (
    <div class='max-w-6xl mx-auto p-8'>
      <Form
        method='POST'
        class='bg-white shadow-sm rounded-lg'
      >
        {/* Header with Title and Priority */}
        <div class='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h1 class='text-2xl font-semibold text-gray-900'>Draft Message</h1>
          <PriorityDropdown
            name='priority'
            initial_priority={priority}
          />
        </div>

        <div class='space-y-0'>
          {/* Regions Row */}
          <TargetsRow
            label='Regions'
            target_types={['region']}
            targets={regions}
          />

          {/* Facilities Row */}
          <TargetsRow
            label='Facilities'
            target_types={['organization']}
            targets={facilities}
          />

          {/* Recipients Row */}
          <TargetsRow
            label='Recipients'
            target_types={['employment', 'profession']}
            targets={recipients}
          >
            <span class='ml-auto text-sm text-gray-600 whitespace-nowrap'>
              Total recipient count: 98
            </span>
          </TargetsRow>
          {/* Concerning Row */}
          <div class='flex items-center gap-2 px-6 py-3 border-b border-gray-200'>
            <label class='text-sm text-gray-700 w-24 flex-shrink-0'>
              Concerning
            </label>
            <div class='flex flex-wrap gap-2 flex-1'>
              {concerning.map((item) => (
                <RemovableChip
                  key={item}
                  name={`targets.concernings.${item}`}
                  display={item}
                  remove={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Subject Row */}
          <div class='flex items-center gap-2 px-6 py-3 border-b border-gray-200'>
            <label class='text-sm text-gray-700 w-24 flex-shrink-0'>
              Subject:
            </label>
            <div class='flex-1'>
              <input
                type='text'
                name='subject'
                value={subject}
                class='block w-full border-0 py-0 px-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm'
                placeholder='Enter subject...'
              />
            </div>
          </div>

          {/* Message Body with Toolbar */}
          <div class='px-6 py-4'>
            <RichTextEditor
              name='body'
              initial_value={body}
            />
          </div>

          {/* Action Buttons */}
          <div class='flex justify-end gap-3 px-6 py-4'>
            <Button
              type='button'
              variant='outline'
              color='gray'
            >
              Save to drafts
            </Button>
            <Button
              type='submit'
              variant='solid'
              color='indigo'
            >
              Send Message
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}
