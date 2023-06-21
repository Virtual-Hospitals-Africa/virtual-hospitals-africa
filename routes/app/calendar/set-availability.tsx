import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/Layout.tsx'
import {
  AvailabilityJSON,
  LoggedInHealthWorkerHandler,
} from '../../../types.ts'
import SetAvailabilityForm from '../../../islands/set-availability-form.tsx'
import { HealthWorkerGoogleClient } from '../../../external-clients/google.ts'
import { assertAllHarare, convertToTime } from '../../../util/date.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'

const shortToLong = {
  SU: 'Sunday' as const,
  MO: 'Monday' as const,
  TU: 'Tuesday' as const,
  WE: 'Wednesday' as const,
  TH: 'Thursday' as const,
  FR: 'Friday' as const,
  SA: 'Saturday' as const,
}

export const handler: LoggedInHealthWorkerHandler<
  { availability: AvailabilityJSON }
> = {
  async GET(_, ctx) {
    const googleClient = new HealthWorkerGoogleClient(ctx)
    const events = await googleClient.getEvents(
      ctx.state.session.data.gcal_availability_calendar_id,
    )

    const availability: AvailabilityJSON = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    }

    events.items.forEach((item) => {
      assertAllHarare([item.start.dateTime, item.end.dateTime])
      assert(Array.isArray(item.recurrence))
      assertEquals(item.recurrence.length, 1)
      assert(item.recurrence[0].startsWith('RRULE:FREQ=WEEKLY;BYDAY='))
      const dayStr = item.recurrence[0].replace('RRULE:FREQ=WEEKLY;BYDAY=', '')
      assert(dayStr in shortToLong)

      const weekday = shortToLong[dayStr as keyof typeof shortToLong]

      availability[weekday].push({
        start: convertToTime(item.start.dateTime),
        end: convertToTime(item.end.dateTime),
      })
    })

    return ctx.render({ availability })
  },
}

export default function SetAvailability(
  props: PageProps<{ availability: AvailabilityJSON }>,
) {
  return (
    <Layout title='Set Availability' route={props.route}>
      <h3 className='container p-1 text-secondary-600 uppercase'>
        Working Hours for HealthWorkers
      </h3>
      <SetAvailabilityForm availability={props.data.availability} />
    </Layout>
  )
}
