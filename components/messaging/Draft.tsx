import { RenderedMessageDraft } from '../../types.ts'
import Form from '../library/Form.tsx'
import { Button } from '../library/Button.tsx'
import PriorityDropdown from '../../islands/messaging/drafts/PriorityDropdown.tsx'
import RichTextEditor from '../../islands/messaging/drafts/RichTextEditor.tsx'
import RemovableChip from '../RemovableChip.tsx'

export type DraftProps = {
  draft?: Partial<RenderedMessageDraft>
}

export default function MessageDraft({ draft = {} }: DraftProps) {
  const priority = draft.priority ?? 'Emergency'
  const body = draft.body ?? ''

  // Mock data for demonstration - these would come from the draft object
  const regions = ['Polokwane']
  const facilities = ['All facilities', 'All hospitals', 'All clinics']
  const recipients = [
    'All administrators',
    'All practitioners',
    'All doctors',
    'All nurses',
  ]
  const concerning = ['Patient: Andries Dlamini', 'ARIPIPRAZOLE prescription']
  const subject = 'What is the correct dosage?'

  return (
    <div class='max-w-6xl mx-auto p-8'>
      <Form
        method='POST'
        class='bg-white shadow-sm rounded-lg border border-gray-200'
      >
        {/* Header with Title and Priority */}
        <div class='flex items-center justify-between px-8 py-6 border-b border-gray-200'>
          <h1 class='text-2xl font-semibold text-gray-900'>Draft Message</h1>
          <PriorityDropdown
            name='priority'
            initial_priority={priority}
          />
        </div>

        <div class='px-8 py-6 space-y-6'>
          {/* Regions Row */}
          <div class='flex items-start gap-4'>
            <label class='text-sm font-medium text-gray-700 w-32 pt-2'>
              Regions
            </label>
            <div class='flex flex-wrap gap-2 flex-1'>
              {regions.map((region) => (
                <RemovableChip
                  key={region}
                  name={`region_${region}`}
                  display={region}
                  remove={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Facilities Row */}
          <div class='flex items-start gap-4'>
            <label class='text-sm font-medium text-gray-700 w-32 pt-2'>
              Facilities
            </label>
            <div class='flex flex-wrap gap-2 flex-1'>
              {facilities.map((facility) => (
                <RemovableChip
                  key={facility}
                  name={`facility_${facility}`}
                  display={facility}
                  remove={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Recipients Row */}
          <div class='flex items-start gap-4'>
            <label class='text-sm font-medium text-gray-700 w-32 pt-2'>
              Recipients
            </label>
            <div class='flex flex-wrap gap-2 flex-1 items-center'>
              <div class='flex flex-wrap gap-2'>
                {recipients.map((recipient) => (
                  <RemovableChip
                    key={recipient}
                    name={`recipient_${recipient}`}
                    display={recipient}
                    remove={() => {}}
                  />
                ))}
              </div>
              <span class='ml-auto text-sm text-gray-600 whitespace-nowrap'>
                Total recipient count: 98
              </span>
            </div>
          </div>

          {/* Concerning Row */}
          <div class='flex items-start gap-4'>
            <label class='text-sm font-medium text-gray-700 w-32 pt-2'>
              Concerning
            </label>
            <div class='flex flex-wrap gap-2 flex-1'>
              {concerning.map((item) => (
                <RemovableChip
                  key={item}
                  name={`concerning_${item}`}
                  display={item}
                  remove={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Subject Row */}
          <div class='flex items-start gap-4'>
            <label class='text-sm font-medium text-gray-700 w-32 pt-2'>
              Subject:
            </label>
            <div class='flex-1'>
              <input
                type='text'
                name='subject'
                value={subject}
                class='block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                placeholder='Enter subject...'
              />
            </div>
          </div>

          {/* Message Body with Toolbar */}
          <div class='space-y-2 pt-4'>
            <RichTextEditor
              name='body'
              initial_value={body}
            />
          </div>

          {/* Action Buttons */}
          <div class='flex justify-end gap-3 pt-4'>
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
