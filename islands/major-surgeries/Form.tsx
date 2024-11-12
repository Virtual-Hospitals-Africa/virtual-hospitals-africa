import { JSX } from 'preact'
import { effect, useSignal } from '@preact/signals'
import { MajorSurgery } from '../../types.ts'
import { AddRow } from '../AddRemove.tsx'
import Surgery from './Surgery.tsx'

export default function majorSurgeriesForm(props: {
  major_surgeries: MajorSurgery[]
}): JSX.Element {
  const major_surgeries = useSignal<
    (Partial<MajorSurgery> & { removed?: boolean })[]
  >(
    props.major_surgeries,
  )

  const addSurgery = () =>
    major_surgeries.value = [
      ...major_surgeries.value,
      {},
    ]

  const first_not_removed = major_surgeries.value.find(
    (surgery) => !surgery.removed,
  )

  effect(() => {
  })

  return (
    <div className='flex flex-col space-y-2'>
      {major_surgeries.value.map((
        state,
        index,
      ) =>
        !state.removed && (
          <Surgery
            key={index}
            index={index}
            labelled={first_not_removed === state}
            value={state.id
              ? props.major_surgeries.find(
                (surgery) =>
                  surgery.id === state.id &&
                  surgery.start_date === state.start_date,
              )
              : undefined}
            remove={() =>
              major_surgeries.value = major_surgeries.value.map((surgery, j) =>
                j === index ? { removed: true } : surgery
              )}
          />
        )
      )}
      <AddRow
        text='Add Surgery'
        onClick={addSurgery}
      />
    </div>
  )
}
