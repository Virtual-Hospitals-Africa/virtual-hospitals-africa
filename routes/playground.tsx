import { PageProps } from 'fresh'
import Badge from '../components/library/Badge.tsx'

export default function ThankYouPage(_props: PageProps) {
  return (
    <div className='flex flex-col gap-2'>
      WOAH
      <Badge content='hello' color='blue' />
      <Badge content='hello' color='red' />
      <Badge content='hello' color='yellow' />
      <Badge content='virtualhealthafrica' color='purple' />
    </div>
  )
}
