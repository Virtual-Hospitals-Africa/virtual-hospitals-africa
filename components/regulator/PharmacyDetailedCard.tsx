import AddRegulatorForm from '../../islands/regulator/AddRegulatorForm.tsx'
import { RenderedPharmacy, Supervisor } from '../../types.ts'
import { Person } from '../library/Person.tsx'

type PharmacyDetailedCardProps = {
  pharmacy: RenderedPharmacy
  pre_existing_supervisors: Supervisor[]
}

export default function PharmacyDetailedCard(
  { pharmacy,pre_existing_supervisors }:PharmacyDetailedCardProps
) {
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
              <AddRegulatorForm pre_existing_supervisors={pre_existing_supervisors} pharmacy={pharmacy}/>
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}
