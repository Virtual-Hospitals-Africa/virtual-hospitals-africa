import { RenderedPharmacist } from '../../types.ts'

export default function PharmacistDetailedCard({
  pharmacist,
}: {
  pharmacist: RenderedPharmacist
}) {
  return (
    <>
      <div>
        <div class='mt-6'>
          <dl class='grid grid-cols-1 sm:grid-cols-4'>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Given Name
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.given_name}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Family Name
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.family_name ||
                  'N/A'}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Town
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.town}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Pharmacist Type
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.pharmacist_type}
              </dd>
            </div>
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
                Licence Number
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {pharmacist?.licence_number}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}
