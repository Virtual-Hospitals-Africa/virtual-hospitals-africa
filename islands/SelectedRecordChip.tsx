import type { EnteredFinding, Maybe, Priority } from '../types.ts'
import { NoFindings } from '../components/drawer-v4/NoFindings.tsx'
import { recordChipClassName } from '../components/drawer-v4/recordChipClassName.ts'
import { PencilIcon } from '../components/library/icons/heroicons/mini.tsx'
import { XMarkIcon } from '../components/library/icons/heroicons/mini.tsx'

type Selected = {
  id?: string
  name?: Maybe<string>
  display?: Maybe<string>
  display_name?: Maybe<string>
  description?: Maybe<string>
  priority?: Maybe<Priority>
  entered?: Maybe<EnteredFinding>
}

export function SelectedChip<Item extends Selected>({ item, click_action, onClick }: {
  item: Item
  click_action: 'remove' | 'edit'
  onClick(): void
}) {
  return (
    <button
      type='button'
      className={recordChipClassName({
        priority: item.entered?.priority || item.priority,
      })}
      onClick={onClick}
    >
      {item.entered?.display || item.display_name || item.display || item.name}
      {click_action === 'edit' ? <PencilIcon className='-ml-1.5 -mr-2.5 p-0.5' /> : <XMarkIcon className='-ml-1.5 -mr-2.5 p-0.5' />}
    </button>
  )
}

export function SelectedChips<Item extends Selected>({
  id,
  items,
  onEdit,
}: {
  id: string
  items: Item[]
  onEdit(item: Item): void
}) {
  return (
    <div id={id} className='box-border content-center flex flex-wrap gap-1 items-center justify-start px-px py-0 shrink-0 w-full'>
      {items.length
        ? items.map((item) => <SelectedChip key={item.id || `${item.name}-${item.description}`} item={item} click_action='edit' onClick={() => onEdit(item)} />)
        : <NoFindings explanation='No findings selected' with_padding_x={false} />}
    </div>
  )
}
