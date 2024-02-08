import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'

export default function BackLink() {
  return (
    <a onClick={() => history.back()} className='h-6 w-6'>
      <XMarkIcon stroke='white' />
    </a>
  )
}
