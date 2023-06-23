import { PageProps } from '$fresh/server.ts'
import NewLayout from '../../components/NewLayout.tsx'

const TEMP_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

export default function HomePage(
  props: PageProps,
) {
  return (
    <NewLayout title='Good morning, Nurse!' route={props.route} imageUrl={TEMP_AVATAR}>
      <h3 className='container p-1 text-secondary-600 uppercase'>
        Working Hours for HealthWorkers
      </h3>
    </NewLayout>
  )
}
