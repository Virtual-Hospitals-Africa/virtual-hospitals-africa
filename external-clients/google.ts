import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  DeepPartial,
  GCalCalendarList,
  GCalCalendarListEntry,
  GCalEvent,
  GCalEventsResponse,
  GCalFreeBusy,
  GoogleProfile,
  GoogleTokenInfo,
  GoogleTokens,
  LoggedInHealthWorkerContext,
  TrxOrDb,
} from '../types.ts'
import { google_tokens } from '../db/models/google_tokens.ts'
import { formatJohannesburg } from '../util/date.ts'
import isObjectLike from '../util/isObjectLike.ts'
import memoize from '../util/memoize.ts'
import selfUrl from '../util/selfUrl.ts'
import { assertOr401 } from '../util/assertOr.ts'
import { health_worker_google_tokens } from '../db/models/health_worker_google_tokens.ts'
import { humanReadableJson } from '../util/humanReadableJson.ts'

const google_apis_url = 'https://www.googleapis.com'

type RequestOpts = {
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch'
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
    | { result: 'success'; data: T }
    | { result: 'insufficient_permission' }
  > {
    // Disallow the test server from making real requests to Google
    if (Deno.env.get('IS_TEST')) {
      return testServerMock(path, opts)
    }
    const url = `${google_apis_url}${path}`
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
        assert(error instanceof Error)
        return { result: 'other_error', error }
      }
      console.log(`${method} ${url}`, JSON.stringify(data))
      if (data.error) {
        if (data.error.code === 401) {
          return { result: 'unauthorized_error' }
        }
        if (data.error.code === 403) {
          return { result: 'insufficient_permission' }
        }
        const error_message = data.error?.errors?.[0]?.message || data.error
        console.error(data.error)
        throw new Error(error_message)
      }
      return { result: 'success', data }
    } else {
      try {
        const text = await response.text()
        console.log(`${method} ${url}`, text)
        return { result: 'success', data: text as T }
      } catch (error) {
        console.error(`${method} ${url}`, error)
        assert(error instanceof Error)
        return { result: 'other_error', error }
      }
    }
  }

  async makeRequest<T>(path: string, opts?: RequestOpts): Promise<T> {
    const response = await this.doMakeRequest(path, opts)
    if (response.result === 'unauthorized_error') {
      throw new Error('Unauthorized')
    }
    if (response.result === 'insufficient_permission') {
      throw new Error('Insufficient Permission')
    }
    if (response.result === 'other_error') {
      if ('email' in this.tokens) {
        console.error(this.tokens.email)
      }
      throw response.error
    }
    return response.data as T
  }

  private makeCalendarRequest<T>(path: string, opts?: RequestOpts): Promise<T> {
    return this.makeRequest(`/calendar/v3${path}`, opts)
  }

  getCalendarList(): Promise<GCalCalendarList> {
    return this.makeCalendarRequest('/users/me/calendarList')
  }

  getTokenInfo(): Promise<GoogleTokenInfo> {
    return this.makeRequest(
      `/oauth2/v1/tokeninfo?access_token=${this.tokens.access_token}`,
    )
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
      time_min?: string
      time_max?: string
    } = {},
  ): Promise<GCalEventsResponse> {
    const params = new URLSearchParams(opts)
    params.set('timeZone', 'Africa/Johannesburg')
    return this.makeCalendarRequest(
      `/calendars/${calendarId}/events?${params}`,
    )
  }

  getEvent(
    calendarId = 'primary',
    eventId: string,
  ): Promise<GCalEvent> {
    const params = new URLSearchParams()
    params.set('timeZone', 'Africa/Johannesburg')
    return this.makeCalendarRequest(
      `/calendars/${calendarId}/events/${eventId}?${params}`,
    )
  }

  async getActiveEvents(
    calendarId = 'primary',
    opts: {
      time_min?: string
      time_max?: string
    } = {},
  ): Promise<GCalEventsResponse> {
    const events: GCalEventsResponse = await this.getEvents(calendarId, opts)
    const items = events.items.filter((event) => event.status !== 'cancelled')
    return { ...events, items }
  }

  async insertEvent(
    calendarId: string,
    eventDetails: DeepPartial<GCalEvent>,
  ): Promise<GCalEvent> {
    const inserted: GCalEvent = await this.makeCalendarRequest(
      `/calendars/${calendarId}/events`,
      {
        method: 'post',
        data: eventDetails,
      },
    )

    // TODO: get this on
    // Hopefully this magically works once we move from having a test account
    // await this.makeCalendarRequest(
    //   `/calendars/${calendarId}/events/${inserted.id}?conferenceDataVersion=1&sendUpdates=all`,
    //   {
    //     method: 'patch',
    //     data: {
    //       id: inserted.id,
    //       ...eventDetails,
    //       conferenceData: {
    //         createRequest: {
    //           requestId: generateUUID(),
    //           conferenceSolution: {
    //             key: {
    //               type: 'hangoutsMeet',
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // )

    return inserted
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

  async ensureCalendarExists(
    items: GCalCalendarListEntry[],
    name: string,
  ) {
    const calendar = items.find((calendar) => calendar.summary === name)
    if (calendar) return calendar

    const inserted = await this.insertCalendar({
      summary: name,
      description: name,
      timeZone: 'Africa/Johannesburg',
    })

    await this.insertCalendarIntoList(
      inserted.id,
    )

    return inserted
  }

  async ensureHasAppointmentsAndAvailabilityCalendars(
    organizations: { id: string; name: string }[],
  ): Promise<{
    gcal_appointments_calendar_id: string
    gcal_availability_calendar_id: string
  }[]> {
    const { items } = await this.getCalendarList()

    const calendars: {
      gcal_appointments_calendar_id: string
      gcal_availability_calendar_id: string
    }[] = []
    for (const organization of organizations) {
      const appointments_calendar_name = `${organization.name} Appointments`
      const availability_calendar_name = `${organization.name} Availability`
      const appointments_calendar = await this.ensureCalendarExists(
        items,
        appointments_calendar_name,
      )
      const availability_calendar = await this.ensureCalendarExists(
        items,
        availability_calendar_name,
      )
      calendars.push({
        gcal_appointments_calendar_id: appointments_calendar.id,
        gcal_availability_calendar_id: availability_calendar.id,
      })
    }
    return calendars
  }

  async getFreeBusy({
    time_min,
    time_max,
    calendarIds,
  }: {
    time_min: Date
    time_max: Date
    calendarIds: string[]
  }): Promise<GCalFreeBusy> {
    const free_busy: GCalFreeBusy = await this.makeCalendarRequest(
      '/free_busy',
      {
        method: 'post',
        data: {
          time_min: formatJohannesburg(time_min),
          time_max: formatJohannesburg(time_max),
          timeZone: 'Africa/Johannesburg',
          items: calendarIds.map((id) => ({ id })),
        },
      },
    )

    for (const calendar of Object.values(free_busy.calendars)) {
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

    return free_busy
  }

  getProfile(): Promise<GoogleProfile> {
    return this.makeRequest('/oauth2/v3/userinfo')
  }
}

const requests_to_google: [string, RequestOpts | undefined][] = []

export function getRequestsToGoogle() {
  return requests_to_google
}

function testServerMock(
  path: string,
  opts?: RequestOpts,
  // deno-lint-ignore no-explicit-any
): { result: 'success'; data: any } {
  requests_to_google.push([path, opts])
  if (path === '/calendar/v3/free_busy' && opts?.method === 'post') {
    assert(isObjectLike(opts.data))
    assert(opts.data.time_min)
    assert(opts.data.time_max)
    assert(Array.isArray(opts.data.items))
    const calendars: GCalFreeBusy['calendars'] = {}
    for (const { id } of opts.data.items) {
      calendars[id] = {
        busy: [],
      }
    }
    return {
      result: 'success' as const,
      data: {
        kind: 'calendar#free_busy',
        time_min: opts.data.time_min,
        time_max: opts.data.time_max,
        calendars,
      },
    }
  }
  if (opts?.method === 'delete') {
    return {
      result: 'success' as const,
      data: {},
    }
  }
  throw new Error(`No mock for ${opts?.method || 'get'} ${path}`)
}

export class HealthWorkerGoogleClient extends GoogleClient {
  constructor(
    public trx: TrxOrDb,
    public health_worker: {
      id: string
      access_token: string
      refresh_token: string
      expires_at: Date | string
    },
  ) {
    super(health_worker)
    assert(
      health_worker_google_tokens.isHealthWorkerWithGoogleTokens(
        this.health_worker,
      ),
      'You must have google tokens to use this client',
    )
  }

  static async fromHealthWorkerContext<T>(
    ctx: LoggedInHealthWorkerContext<T>,
  ) {
    const { id } = ctx.state.health_worker
    const tokens = await google_tokens.getByEntityId(
      ctx.state.trx,
      'health_worker',
      id,
    )
    assertOr401(tokens, `No google tokens found for health worker ${id}`)
    return new HealthWorkerGoogleClient(
      ctx.state.trx,
      { id, ...tokens },
    )
  }

  override async makeRequest<T>(path: string, opts?: RequestOpts): Promise<T> {
    try {
      return await super.makeRequest(path, opts)
    } catch (err) {
      if (isObjectLike(err) && err.message === 'Unauthorized') {
        assert(this.health_worker.refresh_token, 'No refresh token')
        const refreshed = await refreshTokens(
          this.trx,
          this.health_worker,
        )
        if (refreshed.result !== 'success') {
          console.error(refreshed)
          throw new Error('Failed to refresh tokens')
        }
        this.health_worker.access_token = refreshed.access_token
        return await super.makeRequest(path, opts)
      } else {
        throw err
      }
    }
  }
}

export const redirectUri = memoize(() => `${selfUrl()}/logged-in`)

export async function getInitialTokensFromAuthCode(
  google_auth_code: string,
): Promise<GoogleTokens> {
  const form_data = new URLSearchParams({
    redirect_uri: redirectUri(),
    code: google_auth_code,
    client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
    client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
    scope: '',
    grant_type: 'authorization_code',
  })

  const result = await fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form_data.toString(),
  })

  const tokens = await result.json()

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
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      refresh_token,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      grant_type: 'refresh_token',
    }),
  })

  const json = await result.json()

  assert(json)
  assertEquals(
    typeof json.access_token,
    'string',
    'No access token in: \n' + humanReadableJson(json),
  )

  return json.access_token
}

export async function refreshTokens(
  trx: TrxOrDb,
  health_worker: {
    id: string
    access_token: string
    refresh_token: string
  },
): Promise<{ result: 'success'; access_token: string } | { result: 'expiry' }> {
  try {
    const access_token = await getNewAccessTokenFromRefreshToken(
      health_worker.refresh_token,
    )
    await google_tokens.updateAccessToken(
      trx,
      'health_worker',
      health_worker.id,
      access_token,
    )
    return { result: 'success', access_token }
  } catch (err) {
    console.error(err)
    google_tokens.removeExpiredAccessToken(
      trx,
      'health_worker',
      health_worker.id,
    )
    return { result: 'expiry' }
  }
}

export function insertEvent(
  tokens: GoogleTokens,
  calendar_id: string,
  event: DeepPartial<GCalEvent>,
): Promise<GCalEvent> {
  return new GoogleClient(tokens).insertEvent(calendar_id, event)
}
