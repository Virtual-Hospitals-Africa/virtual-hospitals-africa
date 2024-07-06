import { JSX } from 'preact'
import { Sendable } from '../../types.ts'
import OnlineIndicator from '../../components/OnlineIndicator.tsx'
import { Description } from './Description.tsx'
import { CircularImage } from './CircularImage.tsx'
import { HiddenInputs } from '../../components/library/HiddenInputs.tsx'

function SendableListItemContents({ sendable }: { sendable: Sendable }) {
  const { image, name, description, status, menu_options, to } = sendable
  return (
    <div className='group relative flex items-center px-5 py-6'>
      <a className='-m-1 block flex-1 p-1'>
        <div
          className='absolute inset-0 group-hover:bg-gray-50'
          aria-hidden='true'
        />
        <div className='relative flex min-w-0 flex-1 items-center'>
          <span className='relative inline-block flex-shrink-0'>
            <CircularImage image={image} />
            <OnlineIndicator
              online={to.type === 'entity' ? to.online : null}
            />
          </span>
          <div className='ml-4'>
            <p className='text-sm font-sans font-medium text-gray-900 leading-normal'>
              {name}
            </p>
            <Description description={description} />

            {sendable.status && (
              <p className='text-xs font-ubuntu text-gray-500 whitespace-pre-line'>
                {sendable.status}
              </p>
            )}
            {
              /* {!online && reopenTime && (
              <p className='text-xs font-ubuntu text-gray-500'>
                {reopenTime}
              </p>
            )} */
            }
          </div>
        </div>
      </a>
    </div>
  )
}

export function SendableListItem(
  { sendable, selected, onSelect }: {
    sendable: Sendable
    selected: boolean
    onSelect: () => void
  },
): JSX.Element {
  // When clicked, actions submit immediately while entities are selected and add hidden inputs to the form
  const button_props: JSX.HTMLAttributes<HTMLButtonElement> =
    sendable.to.type === 'action'
      ? {
        type: 'submit',
        name: 'send_to.action',
        value: sendable.to.action,
        form: 'intake',
      }
      : { type: 'button', onClick: onSelect }

  return (
    <li
      className={selected
        ? 'bg-indigo-200 hover:bg-indigo-200'
        : 'hover:bg-indigo-200'}
    >
      {selected && sendable.to.type === 'entity' && (
        <HiddenInputs
          form='intake'
          inputs={{
            'send_to.entity.type': sendable.to.entity_type,
            'send_to.entity.id': sendable.to.entity_id,
          }}
        />
      )}

      <button {...button_props} className='text-left w-full'>
        <SendableListItemContents sendable={sendable} />
      </button>
    </li>
  )
}
