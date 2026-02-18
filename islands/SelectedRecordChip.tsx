import type { Maybe, Priority } from '../types.ts'
import { NoFindings } from '../components/drawer-v4/NoFindings.tsx'
import { recordChipClassName } from '../components/drawer-v4/recordChipClassName.ts'
import { XMarkIcon } from '../components/library/icons/heroicons/mini.tsx'

type Selected = {
  id?: string
  name?: Maybe<string>
  display_name?: Maybe<string>
  description?: Maybe<string>
  priority?: Maybe<Priority>
}

export function SelectedChip<Item extends Selected>({ item, onUncheck }: {
  item: Item
  onUncheck: (item: Item) => void
}) {
  return (
    <button
      type='button'
      className={recordChipClassName(item)}
      onClick={() => onUncheck(item)}
    >
      {item.display_name || item.name}
      <XMarkIcon className='-ml-1.5 -mr-2.5 p-0.5' />
    </button>
  )
}

export function SelectedChips<Item extends Selected>({
  id,
  items,
  onUncheck,
}: {
  id: string
  items: Item[]
  onUncheck: (item: Item) => void
}) {
  return (
    <div id={id} className='box-border content-center flex flex-wrap gap-1 items-center justify-start px-px py-0 shrink-0 w-full'>
      {items.length
        ? items.map((item) => <SelectedChip key={item.id || `${item.name}-${item.description}`} item={item} onUncheck={onUncheck} />)
        : <NoFindings explanation='No findings selected' with_padding_x={false} />}
    </div>
  )
}
