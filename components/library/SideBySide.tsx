import { ComponentChildren } from 'preact'

export default function SideBySide(
  { image, children }: { image: string; children: ComponentChildren },
) {
  return (
    <div class='overflow-hidden bg-white py-32'>
      <div class='mx-auto max-w-7xl px-6 lg:flex lg:px-8'>
        <div class='mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8'>
          <div class='lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8'>
            {children}
          </div>
          <div class='flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents'>
            <div class='w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end'>
              <img
                src={image}
                alt=''
                className='aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
