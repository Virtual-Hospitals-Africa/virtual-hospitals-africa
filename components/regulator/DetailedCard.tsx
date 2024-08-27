import { DetailedPharmacist } from '../../types.ts'

type PharmacistProps = {
  pharmacist: DetailedPharmacist
}
export default function PharmacistDetailedCard({
  pharmacist,
}: PharmacistProps) {
  return (
    <>
      <div>
        <div class='mt-6'>
          <dl class='grid grid-cols-1 sm:grid-cols-4'>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Prefix
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.prefix}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Given Name
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.given_name}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Family Name
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.family_name ||
                  'N/A'}
              </dd>
            </div>
            <div class=' py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Pharmacist Type
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.pharmacist_type}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Licence Number
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.licence_number}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Town
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.town}
              </dd>
            </div>
            <div class='py-6 sm:col-span-2 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Town
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.address}
              </dd>
            </div>
            {pharmacist.pharmacy?.name && (
              <>
                <div class='border-t border-gray-100 py-6 sm:col-span-2 sm:px-0'>
                  <dt class='text-sm font-bold leading-6 text-gray-900'>
                    Pharmacy
                  </dt>
                  <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                    <a
                      className='text-indigo-600 hover:text-indigo-900'
                      href={pharmacist.pharmacy?.href}
                    >
                      {pharmacist.pharmacy?.name}
                    </a>
                  </dd>
                </div>
                <div class='sm:border-t border-gray-100 py-6 sm:col-span-2 sm:px-0'>
                  <dt class='text-sm font-bold leading-6 text-gray-900'>
                    Is supervisor
                  </dt>
                  <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                    {pharmacist.is_supervisor ? 'Yes' : 'No'}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>
    </>
  )
}
