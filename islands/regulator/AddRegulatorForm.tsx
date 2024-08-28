import { JSX } from 'preact'
import { AddRow } from '../AddRemove.tsx'
import { useSignal } from '@preact/signals'
import PreSupervisor, { SupervisorState } from './Supervisor.tsx'
import { PreExistingSupervisors, RenderedPharmacy, Supervisor } from '../../types.ts'


type PreExistingSupervisosFormState = Array<
  SupervisorState | { removed: true }
>

export default function PreExistingSupervisorsForm({
  pre_existing_supervisors,
  pharmacy,
}: {
  pre_existing_supervisors: PreExistingSupervisors[],
  pharmacy:RenderedPharmacy
}): JSX.Element {
  const supervisors = useSignal<PreExistingSupervisosFormState>(
    pre_existing_supervisors,
  )

  const addSupervisor = () => supervisors.value = [
    ...supervisors.value,
    {},
  ]
   

  return (
    <div>
      {supervisors.value.map((
        state,
        index,
      ) =>
        !state.removed && (
          <PreSupervisor
            pharmacy={pharmacy}
            index={index}
            state={state}
            value={state.id
              ?  pre_existing_supervisors.find(
                (supervisor) => supervisor.id === state.id,
              )
              : undefined}
            remove={() =>
              supervisors.value = supervisors.value.map((supervisor, j) =>
                j === index ? { removed: true } : supervisor
              )}
            update={(updatedSupervisor) =>
                supervisors.value = supervisors.value.map((supervisor, j) =>
                j === index ? updatedSupervisor : supervisor
              )}
          />
        )
      )}
      <AddRow
        text='Add Supervisor'
        onClick={addSupervisor}
      />
    </div>
  )
}
