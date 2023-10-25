import { PageProps } from '$fresh/server.ts'
import capitalize from '../../util/capitalize.ts'
import cls from '../../util/cls.ts'
import { CheckIcon } from './CheckIcon.tsx'

type Step<S> = {
  name: S
  status: 'complete' | 'current' | 'upcoming'
}

export type StepsProps<S extends string> = {
  url: URL
  steps: Step<S>[]
}

function Step(
  { index, step, steps, baseUrl }: {
    index: number
    step: Step<string>
    steps: Step<string>[]
    baseUrl: URL
  },
) {
  const url = new URL(baseUrl)
  url.searchParams.set('step', step.name)
  return (
    <li key={index} className='relative overflow-hidden lg:flex-1'>
      <div
        className={cls(
          index === 0 ? 'rounded-t-md border-b-0' : '',
          index === steps.length - 1 ? 'rounded-b-md border-t-0' : '',
          'overflow-hidden border border-gray-200 lg:border-0',
        )}
      >
        {step.status === 'complete'
          ? (
            <a
              href={url.href}
              className='group'
            >
              <span
                className='absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full'
                aria-hidden='true'
              />
              <span
                className={cls(
                  index !== 0 ? 'lg:pl-9' : '',
                  'flex items-start px-6 py-5 text-sm font-medium',
                )}
              >
                <span className='flex-shrink-0'>
                  <span className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600'>
                    <CheckIcon
                      className='h-6 w-6 text-white'
                      aria-hidden='true'
                    />
                  </span>
                </span>
                <span className='ml-4 mt-0.5 flex min-w-0 flex-col'>
                  <span className='text-sm font-medium capitalize'>
                    {capitalize(step.name)}
                  </span>
                </span>
              </span>
            </a>
          )
          : step.status === 'current'
          ? (
            <a
              href={url.href}
              aria-current='step'
            >
              <span
                className='absolute left-0 top-0 h-full w-1 bg-indigo-600 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full'
                aria-hidden='true'
              />
              <span
                className={cls(
                  index !== 0 ? 'lg:pl-9' : '',
                  'flex items-start px-6 py-5 text-sm font-medium',
                )}
              >
                <span className='flex-shrink-0'>
                  <span className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-600'>
                    <span className='text-indigo-600'>
                      {index + 1}
                    </span>
                  </span>
                </span>
                <span className='ml-4 mt-0.5 flex min-w-0 flex-col'>
                  <span className='text-sm font-medium text-indigo-600 capitalize'>
                    {capitalize(step.name)}
                  </span>
                </span>
              </span>
            </a>
          )
          : (
            <a
              href={url.href}
              className='group'
            >
              <span
                className='absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full'
                aria-hidden='true'
              />
              <span
                className={cls(
                  index !== 0 ? 'lg:pl-9' : '',
                  'flex items-start px-6 py-5 text-sm font-medium',
                )}
              >
                <span className='flex-shrink-0'>
                  <span className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300'>
                    <span className='text-gray-500'>
                      {index + 1}
                    </span>
                  </span>
                </span>
                <span className='ml-4 mt-0.5 flex min-w-0 flex-col'>
                  <span className='text-sm font-medium text-gray-500 capitalize'>
                    {capitalize(step.name)}
                  </span>
                </span>
              </span>
            </a>
          )}

        {index !== 0
          ? (
            <>
              {/* Separator */}
              <div
                className='absolute inset-0 left-0 top-0 hidden w-3 lg:block'
                aria-hidden='true'
              >
                <svg
                  className='h-full w-full text-gray-300'
                  viewBox='0 0 12 82'
                  fill='none'
                  preserveAspectRatio='none'
                >
                  <path
                    d='M0.5 0V31L10.5 41L0.5 51V82'
                    stroke='currentcolor'
                    vectorEffect='non-scaling-stroke'
                  />
                </svg>
              </div>
            </>
          )
          : null}
      </div>
    </li>
  )
}

export function Steps<S extends string>(
  { url, steps }: StepsProps<S>,
) {
  return (
    <div className='lg:border-b lg:border-t lg:border-gray-200'>
      <nav
        className='mx-auto max-w-7xl'
        aria-label='Progress'
      >
        <ol
          role='list'
          className='overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200'
        >
          {steps.map((step, index) => (
            <Step step={step} index={index} baseUrl={url} steps={steps} />
          ))}
        </ol>
      </nav>
    </div>
  )
}

export function useSteps<Step extends string>(
  stepNames: Step[],
) {
  const isStep = (step: string | null): step is Step => {
    return !!step && stepNames.includes(step as Step)
  }

  return function (props: PageProps) {
    const stepQuery = props.url.searchParams.get('step')
    const currentStep = isStep(stepQuery) ? stepQuery : stepNames[0]

    let completed = false

    const steps = stepNames.map((name) => {
      if (name === currentStep) {
        completed = true
        return { name, status: 'current' as const }
      }
      if (completed) {
        return { name, status: 'upcoming' as const }
      }
      return { name, status: 'complete' as const }
    })

    return {
      currentStep,
      stepsTopBar: <Steps url={props.url} steps={steps} />,
      steps,
    }
  }
}
