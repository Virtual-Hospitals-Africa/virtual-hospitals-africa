import { useState } from 'preact/hooks'
import { MajorSurgery } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow } from '../AddRemove.tsx'
import Surgery, { SurgeryState } from './Surgery.tsx'

type pastSurgeriesFormState = Map<
  string | number,
  SurgeryState | { removed: true }
>

const initialState = (
  majorSurgeries: MajorSurgery[] = [],
): pastSurgeriesFormState => {
  const state = new Map()
  for (const MajorSurgery of majorSurgeries) {
    state.set(MajorSurgery.id, {
      removed: false,
    })
  }
  return state
}

export default function majorSurgeriesForm({
  majorSurgeries,
}: {
  majorSurgeries: MajorSurgery[]
}): JSX.Element {
  const [patientSurgeries, setPatientSurgeries] = useState<
    pastSurgeriesFormState
  >(
    initialState(majorSurgeries),
  )

  const addSurgery = () => {
    const id = generateUUID()
    const nextMajorSurgery = new Map(patientSurgeries)
    nextMajorSurgery.set(id, {
      removed: false,
    })
    setPatientSurgeries(new Map(nextMajorSurgery))
  }

  return (
    <div>
      {Array.from(patientSurgeries.entries()).map((
        [surgery_id, surgery_state],
        i: number,
      ) =>
        !surgery_state.removed && (
          <Surgery
            surgery_id={surgery_id}
            surgery_index={i}
            surgery_state={surgery_state}
            majorSurgeries={majorSurgeries}
            removeSurgery={() => {
              const nextMajorSurgery = new Map(patientSurgeries)
              nextMajorSurgery.set(surgery_id, {
                removed: true,
              })
              setPatientSurgeries(new Map(nextMajorSurgery))
            }}
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
