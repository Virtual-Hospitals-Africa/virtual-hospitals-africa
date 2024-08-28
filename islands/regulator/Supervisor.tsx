import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../form/Inputs.tsx'
import { PreExistingSupervisors, RenderedPharmacy, Supervisor } from '../../types.ts'
import { JSX } from 'preact'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../islands/form/Row.tsx'

import SupervisorSearch from '../SupervisorSearch.tsx'
import { Button } from '../../components/library/Button.tsx'
import Form from '../../components/library/Form.tsx'


export type SupervisorState = {
  id?: string
  removed?: false
}


export default function PreSupervisor(
  {
    pharmacy,
    index,
    remove,
    state,
    value,
    update,
  }: {
    pharmacy: RenderedPharmacy
    index: number
    state: SupervisorState
    value: PreExistingSupervisors | undefined
    remove(): void
    update(supervisor: SupervisorState): void
  },
): JSX.Element {
  const supervisorId = value?.id || '';
  const pharmacyId = pharmacy.id
  return (
    <RemoveRow onClick={remove} key={index} labelled>
      <div className='flex flex-col w-full gap-2'>
      <Form method='POST' action={`/regulator/pharmacies/supervisors?supervisor=${supervisorId}&pharmacy=${pharmacyId}`}>
        <FormRow>
          <SupervisorSearch
           label='Supervisor'
           value={value}/>
          <Button
            type='submit'
            className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Add
          </Button>
        </FormRow>
        </Form>
      </div>
    </RemoveRow>
  )
}
