import { JSX } from 'preact'
import { LabelledListboxMulti } from '../form/Listbox.tsx'
import { Examinations } from '../../db.d.ts'

export function AddExaminationsForm({
  selected_examinations,
  all_examinations,
}: {
  selected_examinations: string[]
  all_examinations: Examinations[]
}): JSX.Element {
  return (
    <div className='flex flex-col gap-2'>
      <LabelledListboxMulti
        label='Select Examinations to Perform'
        name='examinations'
        selected={selected_examinations}
        options={all_examinations.map((ex) => ({
          id: ex.identifier,
          name: ex.display_name,
        }))}
      />
    </div>
  )
}
