import { RenderedMessageDraft } from '../../types.ts'
import Form from '../library/Form.tsx'
import PrioritySelect from '../../islands/PrioritySelect.tsx'
import RecipientRow from '../../islands/messaging/drafts/RecipientRow.tsx'
import ConcerningRow from '../../islands/messaging/drafts/ConcerningRow.tsx'
import TextEditor from '../../islands/messaging/drafts/TextEditor.tsx'

export type DraftProps = {
  draft?: Partial<RenderedMessageDraft>
}

export default function Draft({ draft = {} }: DraftProps) {
  const priority = draft.priority ?? null
  const concerning = draft.concerning ?? false
  const body = draft.body ?? ''
  const targets = draft.targets ?? []

  return (
    <div class='max-w-4xl mx-auto p-6'>
      <Form method='POST' class='space-y-6'>
        {/* Priority Section */}
        <div class='bg-white shadow rounded-lg p-6'>
          <label class='block text-sm font-medium text-gray-700 mb-2'>
            Priority
          </label>
          <PrioritySelect
            name='priority'
            initial_priority={priority}
          />
        </div>

        {/* Recipients Section */}
        <div class='bg-white shadow rounded-lg p-6'>
          <label class='block text-sm font-medium text-gray-700 mb-3'>
            Recipients
          </label>
          <div class='space-y-2'>
            {targets.map((target, index) => (
              <RecipientRow
                key={target.id || `target-${index}`}
                target={target}
                index={index}
              />
            ))}
            <RecipientRow
              target={null}
              index={targets.length}
            />
          </div>
        </div>

        {/* Concerning Checkbox */}
        <div class='bg-white shadow rounded-lg p-6'>
          <ConcerningRow
            initial_concerning={concerning}
          />
        </div>

        {/* Message Body */}
        <div class='bg-white shadow rounded-lg p-6'>
          <label class='block text-sm font-medium text-gray-700 mb-2'>
            Message
          </label>
          <TextEditor
            name='body'
            initial_value={body}
          />
        </div>

        {/* Action Buttons */}
        <div class='flex justify-end space-x-3'>
          <button
            type='button'
            class='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Save Draft
          </button>
          <button
            type='submit'
            class='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Send Message
          </button>
        </div>
      </Form>
    </div>
  )
}
