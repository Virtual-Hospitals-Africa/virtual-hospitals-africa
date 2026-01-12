import { ButtonHTMLAttributes, type JSX } from 'preact'
import { Sendable } from '../../types.ts'
import OnlineIndicator from '../../components/library/OnlineIndicator.tsx'
import { CircularImage } from '../../components/library/CircularImage.tsx'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { AdditionalInfo } from '../../components/library/AdditionalInfo.tsx'
import { AdditionalDescription } from '../../components/library/AdditionalDescription.tsx'
import { Description } from '../../components/library/Description.tsx'

function SendableListItemContents({ sendable }: { sendable: Sendable }) {
  const {
    image,
    name,
    description,
    to,
    additional_description,
    additional_info,
  } = sendable
  return (
    <div className='relative flex items-center px-5 py-4 group'>
      <a className='flex-1 block p-1 -m-1'>
        <div
          className='absolute inset-0 group-hover:bg-gray-50'
          aria-hidden='true'
        />
        <div className='relative flex items-center flex-1 min-w-0'>
          <span className='relative flex-shrink-0 inline-block'>
            <CircularImage image={image} />
            <OnlineIndicator
              online={to.type === 'entity' ? to.online : null}
            />
          </span>
          <div className='ml-4'>
            <p
              className='font-sans text-sm font-medium leading-normal text-gray-900'
              style={{ marginBottom: '-0.25rem' }}
            >
              {name}
            </p>
            <Description description={description} />
            <AdditionalDescription
              additional_description={additional_description}
            />
            <AdditionalInfo additional_info={additional_info} />
            {sendable.status && (
              <p className='text-xs text-gray-500 whitespace-pre-line font-ubuntu'>
                {sendable.status}
              </p>
            )}
            {
              /* {!online && reopenTime && (
              <p className='text-xs text-gray-500 font-ubuntu'>
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
  { form, sendable, is_selected, toggleSelected }: {
    form?: 'registration' | 'encounter'
    sendable: Sendable
    is_selected: boolean
    toggleSelected: () => void
  },
): JSX.Element {
  // When clicked, actions submit immediately while entities are selected and add hidden inputs to the form
  const button_props: ButtonHTMLAttributes<HTMLButtonElement> = sendable.to.type === 'action'
    ? {
      form,
      type: 'submit',
      name: 'send_to.action',
      value: sendable.to.action,
    }
    : { type: 'button', onClick: toggleSelected }

  return (
    <li
      className={is_selected ? 'bg-indigo-200 hover:bg-indigo-200' : 'hover:bg-indigo-200'}
    >
      {is_selected && sendable.to.type === 'entity' && (
        <HiddenInput
          form={form}
          name='send_to.entity'
          value={{
            id: sendable.to.entity_id,
            type: sendable.to.entity_type,
          }}
        />
      )}

      <button {...button_props} className='w-full text-left'>
        <SendableListItemContents sendable={sendable} />
      </button>
    </li>
  )
}
