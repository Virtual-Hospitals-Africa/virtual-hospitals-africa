import { RenderedPharmacist } from '../../types.ts'


type PharmacistProps={
  pharmacist: RenderedPharmacist;
}
  export default function PharmacistDetailedCard({
    pharmacist}:PharmacistProps
  ) 
  {
    console.log(pharmacist)
    return (
      <div className='py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300'>
        <div className='px-4 sm:px-0'>
          <h3 className='text-base font-semibold leading-7 text-gray-900'>
            Given Name
          </h3>
          <p className='mt-1 max-w-2xl text-sm leading-6 text-gray-500'>
          {pharmacist?.given_name}
          </p>
        </div>
        <div className='mt-6'>
          <dl className='grid grid-cols-1 sm:grid-cols-2'>
            <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt className='text-sm font-medium leading-6 text-gray-900'>
                Family Name
              </dt>
              <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {pharmacist?.family_name}
              </dd>
            </div>
            <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt className='text-sm font-medium leading-6 text-gray-900'>
                Town
              </dt>
              <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {pharmacist?.town}
              </dd>
            </div>
            <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt className='text-sm font-medium leading-6 text-gray-900'>
                Pharmacist Type
              </dt>
              <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {pharmacist?.pharmacist_type}
              </dd>
            </div>
            <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt className='text-sm font-medium leading-6 text-gray-900'>
                Prefix
              </dt>
              <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {pharmacist?.prefix}
              </dd>
            </div>
            <div className='border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0'>
              <dt className='text-sm font-medium leading-6 text-gray-900'>
                License Number
              </dt>
              <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {pharmacist?.licence_number}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    )
  }