import db, { opts } from '../db/db.ts'
import { EVENTS, isEventType } from './handlers.ts'
import { events } from '../db/models/events.ts'
import { NO_EXTERNAL_CONNECT } from '../util/env.ts'
import { assert } from 'std/assert/assert.ts'
import { Client } from 'pg'
import { once } from '../util/once.ts'
import { isUUID } from '../util/uuid.ts'
import { forEach } from '../util/inParallel.ts'

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
  console.log(event_listener.listener_name, event_listener.id, 'got listener')

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
    console.log(event_listener.listener_name, event_listener.id, 'starting trx')
    const success_message = await db.transaction().setIsolationLevel('read committed').execute(
      (trx) =>
        listener(trx, {
          event_id: event_listener.event_id,
          listener_id: event_listener.id,
          listener_name: event_listener.listener_name,
          // deno-lint-ignore no-explicit-any
          data: parse_result.data as any,
        }),
    )
    console.log(event_listener.listener_name, event_listener.id, 'events.processedListener')
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

const STARTUP_CONCURRENCY = 4

function processAllUnprocessedOnStartup() {
  const unprocessed = db
    .selectFrom('event_listeners')
    .select('id')
    .where('started_processing_at', 'is', null)
    .stream()

  forEach(
    unprocessed,
    ({ id }) => onEventListener(id),
    { concurrency: STARTUP_CONCURRENCY },
  ).then(() => {
    console.log('Processed startup backlog')
  }).catch((err) => {
    console.error(err)
    Deno.exit(1)
  })
}

const initializeEventListener = once(
  async function initializeEventListener() {
    const client = new Client(opts || {})

    await client.connect()
    await client.query(`LISTEN event_listener_to_be_processed`)

    processAllUnprocessedOnStartup()

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

if (import.meta.main) {
  createEventProcessor().start()

  globalThis.addEventListener('unhandledrejection', (e) => {
    console.error('Caught unhandled rejection:', e.reason)
    e.preventDefault()
  })
}
