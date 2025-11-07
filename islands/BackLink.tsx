import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'

export default function BackLink({ href }: { href?: string }) {
  const on_click = href ? undefined : () => history.back()
  return (
    <a href={href} onClick={onClick} className='h-6 w-6'>
      <XMarkIcon stroke='white' />
    </a>
  )
}
