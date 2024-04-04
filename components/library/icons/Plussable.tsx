import { JSX } from 'preact'
import { FilledPlusIcon } from './FilledPlus.tsx'

export function Plussable(
  { Icon }: { Icon(props: JSX.SVGAttributes<SVGSVGElement>): JSX.Element },
) {
  return (
    <div className='relative'>
      <Icon className='h-12 w-12 text-gray-400' />
      <FilledPlusIcon className='absolute h-5 w-5 bottom-0 right-0' />
    </div>
  )
}
