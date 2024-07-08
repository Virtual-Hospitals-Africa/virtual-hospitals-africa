import { Signal } from '@preact/signals'
import { Sendable } from '../../types.ts'
import { SendableListItem } from './ListItem.tsx'

export function SendableList(
  { sendables, selected }: {
    sendables: Sendable[]
    selected: Signal<Sendable | null>
  },
) {
  const show_sendables = selected.value == null
    ? sendables
    : sendables.filter((sendable) => sendable === selected.value)

  return (
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
  )
}
