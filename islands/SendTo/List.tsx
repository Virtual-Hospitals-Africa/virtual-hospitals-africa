import { Signal } from '@preact/signals'
import { Sendable } from '../../types.ts'
import { SendableListItem } from './ListItem.tsx'

export function SendableList(
  { sendables, selected }: {
    sendables: Sendable[]
    selected: Signal<Sendable | null>
  },
) {
  const scrollableSendables = sendables.slice(0, -3)
  const fixedSendables = sendables.slice(-3)
  const show_sendables = selected.value == null
    ? scrollableSendables
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
            {fixedSendables.map((sendable) => {
              const is_selected = selected.value === sendable
              return (
                <SendableListItem
                  key={sendable.key}
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
