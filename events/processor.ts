import db, { opts } from '../db/db.ts'
import { EVENTS, isEventType } from './handlers.ts'
import { events } from '../db/models/events.ts'
import { NO_EXTERNAL_CONNECT } from '../util/env.ts'
import { assert } from 'std/assert/assert.ts'
import { Client } from 'pg'
import { once } from '../util/once.ts'
import { isUUID } from '../util/uuid.ts'

export type EventProcessor = {
  start(): void
  exit(opts: { graceful: boolean }): Promise<void>
}

async function onEventListener(event_listener_id: string) {
  const event_listener = await events.selectUnprocessedListener(
    db,
    event_listener_id,
  )
  if (!event_listener) {
    return console.log(
      'Another process got to this one first',
      event_listener_id,
    )
  }
  console.log('got listener', event_listener)

  if (!isEventType(event_listener.type)) {
    return events.markUnrecoverableError(
      db,
      event_listener.event_id,
      new Error(`No event with type: ${event_listener.type}`),
    )
  }

  const handler = EVENTS[event_listener.type]

  const listener = handler.listeners[event_listener.listener_name]

  if (!listener) {
    return events.markErroredListener(
      db,
      {
        event_listener_id: event_listener.id,
        error_message: 'No such listener found by name',
      },
    )
  }

  const parse_result = handler.schema.safeParse(event_listener.data)

  if (!parse_result.success) {
    return events.markErroredListener(
      db,
      {
        event_listener_id: event_listener.id,
        error_message: parse_result.error.message,
      },
    )
  }

  try {
    console.log('starting trx', event_listener)
    const success_message = await db.transaction().setIsolationLevel('read committed').execute(
      (trx) =>
        listener(trx, {
          id: event_listener.event_id,
          // deno-lint-ignore no-explicit-any
          data: parse_result.data as any,
        }),
    )
    console.log('events.processedListener', event_listener)
    await events.processedListener(db, {
      event_listener_id: event_listener.id,
      success_message,
    })
  } catch (error) {
    console.error(error)
    await events.markErroredListener(db, {
      event_listener_id: event_listener.id,
      // deno-lint-ignore no-explicit-any
      error_message: (error as any).message,
      // error_count: event_listener.error_count + 1,
    })
  }
}

const initializeEventListener = once(
  async function initializeEventListener() {
    const client = new Client(opts || {})

    await client.connect()
    await client.query(`LISTEN event_listener_to_be_processed`)

    client.on('notification', function (event) {
      const { payload: event_listener_id } = event
      assert(isUUID(event_listener_id))
      console.log('event_listener_to_be_processed', event_listener_id)
      onEventListener(event_listener_id)
    })

    return client
  },
)

export function createEventProcessor(): EventProcessor {
  let client: Client
  return {
    start() {
      if (NO_EXTERNAL_CONNECT) {
        console.log(
          'Not starting the event processor due to NO_EXTERNAL_CONNECT',
        )
        return
      }
      console.log('Starting event processor')
      initializeEventListener().then((c) => {
        client = c
      })
    },
    exit(opts: { graceful: boolean }) {
      assert(
        !opts.graceful,
        'TODO support graceful shutdown which might let listeners currently being processed finish while not listening for new ones',
      )
      console.log('Stopping event processor')
      return client?.end() || Promise.resolve()
    },
  }
}
