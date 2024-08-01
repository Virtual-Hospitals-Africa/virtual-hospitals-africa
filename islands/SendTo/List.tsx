import { Signal } from '@preact/signals'
import { Sendable } from '../../types.ts'
import { SendableListItem } from './ListItem.tsx'

export function SendableList(
  { sendables, selected }: {
    form: 'intake' | 'encounter'
    sendables: Sendable[]
    selected: Signal<Sendable | null>
  },
) {
  const entitySendables = sendables.filter((sendable) =>
    sendable.to.type === 'entity'
  )
  const actionSendables = sendables.filter((sendable) =>
    sendable.to.type === 'action'
  )

  const show_sendables = selected.value == null
    ? entitySendables
    : sendables.filter((sendable) => sendable === selected.value)

  return (
    <div>
      <ul
        role='list'
        className='overflow-y-auto'
      >
        {show_sendables.map((sendable) => {
          const is_selected = selected.value === sendable
          return (
            <SendableListItem
              key={sendable.key}
              form='intake'
              sendable={sendable}
              is_selected={is_selected}
              toggleSelected={() =>
                selected.value = is_selected ? null : sendable}
            />
          )
        })}
      </ul>
      {selected.value == null && (
        <div className='sticky bottom-0 left-0 w-full bg-white'>
          <ul role='list'>
            {actionSendables.map((sendable) => {
              const is_selected = selected.value === sendable
              return (
                <SendableListItem
                  key={sendable.key}
                  form='intake'
                  sendable={sendable}
                  is_selected={is_selected}
                  toggleSelected={() =>
                    selected.value = is_selected ? null : sendable}
                />
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
