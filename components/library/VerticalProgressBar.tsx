import { CheckIcon } from '../library/icons/heroicons/solid.tsx'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function VerticalProgressBar(
  { steps }: {
    steps: { name: string; href: string; status: string; description: string }[]
  },
) {
  return (
    <nav aria-label='Progress'>
      <ol role='list' className='overflow-hidden'>
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? 'pb-4' : '',
              'relative',
            )}
          >
            {step.status === 'complete'
              ? (
                <>
                  {stepIdx !== steps.length - 1
                    ? (
                      <div
                        aria-hidden='true'
                        className='absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-indigo-600'
                      />
                    )
                    : null}
                  <a
                    href={step.href}
                    className='group relative flex items-start'
                  >
                    <span className='flex h-9 items-center'>
                      <span className='relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white'>
                        <CheckIcon
                          aria-hidden='true'
                          className='size-5 text-indigo-600'
                        />
                      </span>
                    </span>
                    <span className='ml-4 flex min-w-0 flex-col'>
                      <span className='text-sm font-medium'>{step.name}</span>
                      <span className='flex flex-start items-center gap-1 text-sm text-gray-500'>
                        <div className='m-0 p-0'>
                          {step.description}
                        </div>
                        <svg
                          width='9'
                          height='10'
                          viewBox='0 0 9 10'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                          className='relative m-0 p-0'
                        >
                          <path
                            d='M4 2C4.13261 2 4.25979 2.05268 4.35355 2.14645C4.44732 2.24021 4.5 2.36739 4.5 2.5C4.5 2.63261 4.44732 2.75979 4.35355 2.85355C4.25979 2.94732 4.13261 3 4 3H1V8.5H6.5V5.5C6.5 5.36739 6.55268 5.24021 6.64645 5.14645C6.74021 5.05268 6.86739 5 7 5C7.13261 5 7.25979 5.05268 7.35355 5.14645C7.44732 5.24021 7.5 5.36739 7.5 5.5V8.5C7.5 8.76522 7.39464 9.01957 7.20711 9.20711C7.01957 9.39464 6.76522 9.5 6.5 9.5H1C0.734784 9.5 0.48043 9.39464 0.292893 9.20711C0.105357 9.01957 0 8.76522 0 8.5V3C0 2.73478 0.105357 2.48043 0.292893 2.29289C0.48043 2.10536 0.734784 2 1 2H4ZM8.5 0.5C8.63261 0.5 8.75979 0.552678 8.85355 0.646447C8.94732 0.740215 9 0.867392 9 1V3.5C9 3.63261 8.94732 3.75979 8.85355 3.85355C8.75979 3.94732 8.63261 4 8.5 4C8.36739 4 8.24021 3.94732 8.14645 3.85355C8.05268 3.75979 8 3.63261 8 3.5V2.207L3.8535 6.3535C3.7592 6.44458 3.6329 6.49498 3.5018 6.49384C3.3707 6.4927 3.24529 6.44011 3.15259 6.34741C3.05989 6.25471 3.0073 6.1293 3.00616 5.9982C3.00502 5.8671 3.05542 5.7408 3.1465 5.6465L7.293 1.5H6C5.86739 1.5 5.74021 1.44732 5.64645 1.35355C5.55268 1.25979 5.5 1.13261 5.5 1C5.5 0.867392 5.55268 0.740215 5.64645 0.646447C5.74021 0.552678 5.86739 0.5 6 0.5H8.5Z'
                            fill='#087EFF'
                          />
                        </svg>
                      </span>
                    </span>
                  </a>
                </>
              )
              : step.status === 'current'
              ? (
                <>
                  {stepIdx !== steps.length - 1
                    ? (
                      <div
                        aria-hidden='true'
                        className='absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300'
                      />
                    )
                    : null}
                  <a
                    href={step.href}
                    aria-current='step'
                    className='group relative flex items-start'
                  >
                    <span aria-hidden='true' className='flex h-9 items-center'>
                      <span className='relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white'>
                        <span className='size-2.5 rounded-full bg-indigo-600' />
                      </span>
                    </span>
                    <span className='ml-4 flex min-w-0 flex-col'>
                      <span className='text-sm font-medium text-indigo-600'>
                        {step.name}
                      </span>
                      <span className='text-sm text-gray-500'>
                        {step.description}
                      </span>
                    </span>
                  </a>
                </>
              )
              : (
                <>
                  {stepIdx !== steps.length - 1
                    ? (
                      <div
                        aria-hidden='true'
                        className='absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300'
                      />
                    )
                    : null}
                  <a
                    href={step.href}
                    className='group relative flex items-start'
                  >
                    <span aria-hidden='true' className='flex h-9 items-center'>
                      <span className='relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400'>
                        <span className='size-2.5 rounded-full bg-transparent group-hover:bg-gray-300' />
                      </span>
                    </span>
                    <span className='ml-4 flex min-w-0 flex-col'>
                      <span className='text-sm font-medium text-gray-500'>
                        {step.name}
                      </span>
                      <span className='text-sm text-gray-500'>
                        {step.description}
                      </span>
                    </span>
                  </a>
                </>
              )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
