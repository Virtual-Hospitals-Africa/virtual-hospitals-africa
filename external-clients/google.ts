// deno-lint-ignore-file no-explicit-any
import 'dotenv'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import moment from 'https://deno.land/x/momentjs@2.29.1-deno/mod.ts'
// const formatRFC3339 = require("date-fns/formatRFC3339");
import {
  DeepPartial,
  GCalCalendarList,
  GCalCalendarListEntry,
  GCalEvent,
  GCalEventsResponse,
  GCalFreeBusy,
  GoogleProfile,
  GoogleTokens,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorker,
  TrxOrDb,
  Location
} from '../types.ts'
import { HandlerContext } from '$fresh/src/server/mod.ts'
import {
  isHealthWorkerWithGoogleTokens,
  removeExpiredAccessToken,
  updateAccessToken,
} from '../db/models/health_workers.ts'

const googleApisUrl = 'https://www.googleapis.com'

type RequestOpts = {
  method?: 'get' | 'post' | 'put' | 'delete'
  data?: unknown
}

export function isGoogleTokens(
  maybeTokens: unknown,
): maybeTokens is GoogleTokens {
  return (
    !!maybeTokens &&
    typeof maybeTokens === 'object' &&
    'access_token' in maybeTokens &&
    typeof maybeTokens.access_token === 'string' &&
    'refresh_token' in maybeTokens &&
    typeof maybeTokens.refresh_token === 'string'
  )
}

export class GoogleClient {
  constructor(public tokens: GoogleTokens) {
    if (!isGoogleTokens(tokens)) {
      throw new Error('Invalid tokens object')
    }
  }

  async doMakeRequest<T>(
    path: string,
    opts?: RequestOpts,
  ): Promise<
    | { result: 'unauthorized_error' }
    | { result: 'other_error'; error: Error }
    | { result: 'success'; data: any }
  > {
    const url = `${googleApisUrl}${path}`
    const method = opts?.method || 'get'
    console.log(
      `${method} ${url}`,
      ...(opts?.data ? [JSON.stringify(opts?.data)] : []),
    )
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.tokens.access_token}`,
      },
      body: opts?.data ? JSON.stringify(opts.data) : undefined,
    })
    if (method !== 'delete') {
      let data
      try {
        data = await response.json()
      } catch (error) {
        console.error(`${method} ${url}`, error)
        return { result: 'other_error', error }
      }
      console.log(`${method} ${url}`, JSON.stringify(data))
      if (data.error) {
        if (data.error.code === 401) {
          return { result: 'unauthorized_error' }
        }
        const errorMessage = data.error?.errors?.[0]?.message || data.error
        throw new Error(errorMessage)
      }
      return { result: 'success', data }
    } else {
      try {
        const text = await response.text()
        console.log(`${method} ${url}`, text)
        return { result: 'success', data: text }
      } catch (error) {
        console.error(`${method} ${url}`, error)
        return { result: 'other_error', error }
      }
    }
  }

  async makeRequest<T>(path: string, opts?: RequestOpts): Promise<T> {
    const response = await this.doMakeRequest(path, opts)
    if (response.result === 'unauthorized_error') {
      throw new Error('Unauthorized')
    }
    if (response.result === 'other_error') {
      throw response.error
    }
    return response.data
  }

  private makeCalendarRequest(path: string, opts?: RequestOpts): Promise<any> {
    return this.makeRequest(`/calendar/v3${path}`, opts)
  }

  getCalendarList(): Promise<GCalCalendarList> {
    return this.makeCalendarRequest('/users/me/calendarList')
  }

  insertCalendar(
    calendarDetails: DeepPartial<GCalCalendarListEntry>,
  ): Promise<GCalCalendarListEntry> {
    return this.makeCalendarRequest('/calendars', {
      method: 'post',
      data: calendarDetails,
    })
  }

  insertCalendarIntoList(calendarId: string): Promise<GCalCalendarListEntry> {
    return this.makeCalendarRequest('/users/me/calendarList', {
      method: 'post',
      data: { id: calendarId },
    })
  }

  getEvents(
    calendarId = 'primary',
    opts: {
      timeMin?: string
      timeMax?: string
    } = {},
  ): Promise<GCalEventsResponse> {
    const params = new URLSearchParams(opts)
    params.set('timeZone', 'Africa/Johannesburg')
    return this.makeCalendarRequest(
      `/calendars/${calendarId}/events?${params}`,
    )
  }

  insertEvent(
    calendarId: string,
    eventDetails: DeepPartial<GCalEvent>,
  ): Promise<GCalEvent> {
    return this.makeCalendarRequest(`/calendars/${calendarId}/events`, {
      method: 'post',
      data: eventDetails,
    })
  }

  updateEvent(
    { calendarId, eventId, details }: {
      calendarId: string
      eventId: string
      details: DeepPartial<GCalEvent>
    },
  ): Promise<GCalEvent> {
    return this.makeCalendarRequest(
      `/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'put',
        data: details,
      },
    )
  }

  deleteEvent(calendarId: string, eventId: string) {
    return this.makeCalendarRequest(
      `/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'delete',
      },
    )
  }

  async ensureHasAppointmentsAndAvailabilityCalendars(): Promise<{
    vhaAppointmentsCalendar: GCalCalendarListEntry
    vhaAvailabilityCalendar: GCalCalendarListEntry
  }> {
    const list = await this.getCalendarList()

    let vhaAppointmentsCalendar = list.items.find(
      (calendar) => calendar.summary === 'VHA Appointments',
    )

    if (!vhaAppointmentsCalendar) {
      vhaAppointmentsCalendar = await this.insertCalendar({
        summary: 'VHA Appointments',
        description: 'Appointments for VHA',
        timeZone: 'Africa/Johannesburg',
      })

      vhaAppointmentsCalendar = await this.insertCalendarIntoList(
        vhaAppointmentsCalendar.id,
      )
      console.log('Created Cppointments Calendar')
    }

    let vhaAvailabilityCalendar = list.items.find(
      (calendar) => calendar.summary === 'VHA Availability',
    )

    if (!vhaAvailabilityCalendar) {
      vhaAvailabilityCalendar = await this.insertCalendar({
        summary: 'VHA Availability',
        description: 'Availability for VHA',
        timeZone: 'Africa/Johannesburg',
      })

      vhaAvailabilityCalendar = await this.insertCalendarIntoList(
        vhaAvailabilityCalendar.id,
      )
      console.log('Created Availability Calendar')
    }

    return { vhaAppointmentsCalendar, vhaAvailabilityCalendar }
  }

  async getFreeBusy({
    timeMin,
    timeMax,
    calendarIds,
  }: {
    timeMin: Date
    timeMax: Date
    calendarIds: string[]
  }): Promise<GCalFreeBusy> {
    const freeBusy: GCalFreeBusy = await this.makeCalendarRequest('/freeBusy', {
      method: 'post',
      data: {
        timeMin: moment(timeMin).format(),
        timeMax: moment(timeMax).format(),
        timeZone: 'Africa/Johannesburg',
        items: calendarIds.map((id) => ({ id })),
      },
    })

    for (const calendar of Object.values(freeBusy.calendars)) {
      for (const busy of calendar.busy) {
        assert(
          busy.start.endsWith('+02:00'),
          'Expected all dates to be on Zimbabwe time',
        )
        assert(
          busy.start.endsWith('+02:00'),
          'Expected all dates to be on Zimbabwe time',
        )
      }
    }

    return freeBusy
  }

  getProfile(): Promise<GoogleProfile> {
    return this.makeRequest('/oauth2/v3/userinfo')
  }
}

export class HealthWorkerGoogleClient extends GoogleClient {
  public health_worker: HealthWorkerWithGoogleTokens

  constructor(
    public ctx: HandlerContext<any, LoggedInHealthWorker>,
  ) {
    super(ctx.state.session.data)
    this.health_worker = ctx.state.session.data
    if (!isHealthWorkerWithGoogleTokens(this.health_worker)) {
      throw new Error('Ya gotta be a doctah')
    }
  }

  async makeRequest(path: string, opts?: RequestOpts): Promise<any> {
    try {
      return await super.makeRequest(path, opts)
    } catch (err) {
      if (err.message === 'Unauthorized') {
        assert(this.health_worker.refresh_token, 'No refresh token')
        const refreshed = await refreshTokens(
          this.ctx.state.trx,
          this.health_worker,
        )
        if (refreshed.result !== 'success') {
          throw new Error('Failed to refresh tokens')
        }
        this.ctx.state.session.set('access_token', refreshed.access_token)
        this.health_worker = {
          ...this.health_worker,
          access_token: refreshed.access_token,
        }
        return await super.makeRequest(path, opts)
      }
    }
  }
}

const selfUrl = Deno.env.get('SELF_URL') ||
  'https://virtual-hospitals-africa.herokuapp.com'
const redirect_uri = `${selfUrl}/logged-in`

export const oauthParams = new URLSearchParams({
  redirect_uri,
  prompt: 'consent',
  response_type: 'code',
  client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
  scope:
    'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
  access_type: 'offline',
  service: 'lso',
  o2v: '2',
  flowName: 'GeneralOAuthFlow',
})

export async function getInitialTokensFromAuthCode(
  google_auth_code: string,
): Promise<GoogleTokens> {
  const formData = new URLSearchParams({
    redirect_uri,
    code: google_auth_code,
    client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
    client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
    scope: '',
    grant_type: 'authorization_code',
  })

  const result = await fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })

  const tokens = await result.json()

  console.log('tokens', JSON.stringify(tokens))

  assert(tokens)
  assertEquals(typeof tokens.access_token, 'string')
  assertEquals(typeof tokens.refresh_token, 'string')
  assertEquals(typeof tokens.expires_in, 'number')

  tokens.expires_at = new Date()
  tokens.expires_at.setSeconds(
    tokens.expires_at.getSeconds() + tokens.expires_in,
  )

  return tokens
}

export async function getNewAccessTokenFromRefreshToken(
  refresh_token: string,
): Promise<string> {
  const result = await fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      grant_type: 'refresh_token',
    }),
  })

  const json = await result.json()

  assert(json)
  assertEquals(typeof json.access_token, 'string')

  return json.access_token
}

export async function refreshTokens(
  trx: TrxOrDb,
  health_worker: HealthWorkerWithGoogleTokens,
): Promise<{ result: 'success'; access_token: string } | { result: 'expiry' }> {
  try {
    const access_token = await getNewAccessTokenFromRefreshToken(
      health_worker.refresh_token,
    )
    await updateAccessToken(trx, health_worker.id, access_token)
    return { result: 'success', access_token }
  } catch (err) {
    console.error(err)
    removeExpiredAccessToken(trx, { health_worker_id: health_worker.id })
    return { result: 'expiry' }
  }
}

export async function getLocationAddress(locationCoordinates: Location): Promise<string> {
  // make the google api call
  const longitude = -74.0059
  const latitude = 40.7128
  const API_KEY = 'AIzaSyCJWfHNTyRnlw3phU22A87ziRefvlu2Vhg'
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
  
  const result = await fetch(url)
  const JSON = await result.json()

  await Promise.resolve();
  console.log(JSON)
  return "test"
}
