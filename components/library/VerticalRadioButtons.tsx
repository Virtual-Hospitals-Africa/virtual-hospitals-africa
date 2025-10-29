type Option = {
  id: string
  name: string
  description: string
}

export function VerticalRadioButtons({ options }: {
  options: Option[]
}) {
  return (
    <fieldset aria-label='Plan'>
      <div className='space-y-5'>
        {options.map((option) => (
          <div key={option.id} className='relative flex items-start'>
            <div className='flex items-center h-6'>
              <input
                defaultChecked={option.id === 'small'}
                id={option.id}
                name='option'
                type='radio'
                aria-describedby={`${option.id}-description`}
                className='relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden'
              />
            </div>
            <div className='ml-3 text-sm/6'>
              <label
                htmlFor={option.id}
                className='font-medium text-gray-900 dark:text-white'
              >
                {option.name}
              </label>
              <p
                id={`${option.id}-description`}
                className='text-gray-500 dark:text-gray-400'
              >
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
