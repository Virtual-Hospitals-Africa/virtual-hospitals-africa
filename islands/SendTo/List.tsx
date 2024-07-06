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
      className='divide-y divide-gray-200 overflow-y-auto'
    >
      {show_sendables.map((sendable) => (
        <SendableListItem
          key={sendable.key}
          sendable={sendable}
          selected={selected.value === sendable}
          onSelect={() => selected.value = sendable}
        />
      ))}
    </ul>
  )
}
