import { LoggedInRegulatorContext, RenderedPharmacy, Supervisor } from '../../types.ts'
import { Person } from '../library/Person.tsx'
import * as pharmacists from '../../db/models/pharmacists.ts'
import FormRow from '../../islands/form/Row.tsx'
import { Button } from '../library/Button.tsx'
import { useSignal } from '@preact/signals'
import { AddRegulatorSearch } from '../../islands/regulator/AddRegulatorSearvch.tsx'

type PharmacyDetailedCardProps = {
  pharmacy: RenderedPharmacy
  ctx:LoggedInRegulatorContext
}



export default function PharmacyDetailedCard(
  { pharmacy,ctx }: PharmacyDetailedCardProps,
) {
  const searchQuery = useSignal('');

  const addSupervisor = async (name: string)=>{
    console.log("start to add")
    const pharmacist = await pharmacists.getByName(ctx.state.trx,name)
    if (pharmacist) {
      const supervisor: Supervisor = {
        id: pharmacist.id,
        href: "",
        name: `${pharmacist.given_name} ${pharmacist.family_name}`,
        family_name: pharmacist.family_name,
        given_name: pharmacist.given_name,
        prefix: pharmacist.prefix,
      };
      pharmacy.supervisors = ([...pharmacy.supervisors,supervisor])
    } 
  }
  const handleQueryChange = (query:string) => {
    searchQuery.value = query;
  }

  const handleButtonClick = () => {
    console.log('Search Query:', searchQuery.value);
    addSupervisor(searchQuery.value)
    alert("Button clicked!");
  }
   
  return (
    <>
      <div>
        <div class='mt-6'>
          <dl class='grid grid-cols-1 sm:grid-cols-4'>
            <div class='px-0 py-6 sm:col-span-1'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Licence Number
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacy.licence_number}
              </dd>
            </div>
            <div class='px-0 py-6 sm:col-span-1'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Licensee
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacy.licensee}
              </dd>
            </div>
            <div class='px-0 py-6 sm:col-span-1'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Expiry Date
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacy.expiry_date}
              </dd>
            </div>
            <div class='px-0 py-6 sm:col-span-1'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Pharmacy Types
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacy.pharmacies_types}
              </dd>
            </div>
            <div class='py-6 sm:col-span-4 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Address
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacy.address
                  ? pharmacy.address + ', ' + pharmacy.town
                  : 'N/A'}
              </dd>
            </div>
            <div class='border-t border-gray-100 py-6 sm:col-span-4 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Supervisors
              </dt>
              {pharmacy.supervisors.map((supervisor) => (
                <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                  <Person person={supervisor} />
                </dd>
              ))}
      
                <div className="mt-4">
                  <FormRow className='mb-4'>
                    <AddRegulatorSearch onQuery={handleQueryChange}/>
                        <Button
                            type='button'
                            onClick={handleButtonClick}
                            className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
                          >
                            Add
                      </Button>
                  </FormRow>
                </div>
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}
