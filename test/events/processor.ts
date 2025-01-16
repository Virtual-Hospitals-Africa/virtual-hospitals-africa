import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import * as events from '../../db/models/events.ts'
import db from '../../db/db.ts'
import * as events_processor from '../../events/processor.ts'
import generateUUID from '../../util/uuid.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe(
  'events/processor.ts',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    describe('addListeners', () => {
      it('adds a row for each event listener that we want to run', async () => {
        const bar = generateUUID()
        const event = await events.insert(db, {
          type: 'TEST_NEVER_WORKS',
          data: { bar },
        })

        const event_before = await events.getById(db, event.id)
        assert(!event_before.listeners_inserted_at)
        assert(!event_before.error_message_no_automated_retry)

        await events_processor.addListeners(db)

        const event_after = await events.getById(db, event.id)
        assert(event_after.listeners_inserted_at)
        assert(!event_after.error_message_no_automated_retry)

        const listeners = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listeners.length, 1)
        assertEquals(listeners[0].listener_name, 'neverWorks')
        assertEquals(listeners[0].error_message, null)
        assertEquals(listeners[0].error_count, 0)
        assertEquals(listeners[0].backoff_until, null)
        assertEquals(listeners[0].processed_at, null)
      })
    })

    describe('processListeners', () => {
      it('marks the listener as having errored, when that is the case', async () => {
        const bar = generateUUID()
        const event = await events.insert(db, {
          type: 'TEST_NEVER_WORKS',
          data: { bar },
        })

        await events_processor.addListeners(db)

        const [listener_before] = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listener_before.listener_name, 'neverWorks')
        assertEquals(listener_before.error_message, null)
        assertEquals(listener_before.error_count, 0)
        assertEquals(listener_before.backoff_until, null)
        assertEquals(listener_before.processed_at, null)

        await events_processor.processListeners(db)

        const [listener_after] = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listener_after.listener_name, 'neverWorks')
        assertEquals(listener_after.error_message, 'Never Works')
        assertEquals(listener_after.error_count, 1)
        assert(listener_after.backoff_until instanceof Date)
        assertEquals(listener_after.processed_at, null)
      })

      it('does not retry immediately, respecting the backoff_until. It will not retry after 3 errors', async () => {
        const bar = generateUUID()
        const event = await events.insert(db, {
          type: 'TEST_NEVER_WORKS',
          data: { bar },
        })

        await events_processor.addListeners(db)
        await events_processor.processListeners(db)
        await events_processor.processListeners(db)

        const [listener_after] = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listener_after.listener_name, 'neverWorks')
        assertEquals(listener_after.error_message, 'Never Works')
        assertEquals(listener_after.error_count, 1)
        assert(listener_after.backoff_until instanceof Date)
        assertEquals(listener_after.processed_at, null)

        await events.clearBackoff(db, { event_listener_id: listener_after.id })

        await events_processor.processListeners(db)

        const [listener_take2] = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listener_take2.listener_name, 'neverWorks')
        assertEquals(listener_take2.error_message, 'Never Works')
        assertEquals(listener_take2.error_count, 2)
        assert(listener_take2.backoff_until instanceof Date)
        assertEquals(listener_take2.processed_at, null)

        await db.updateTable('event_listeners')
          .where('event_id', '=', event.id)
          .set({ backoff_until: null })
          .executeTakeFirstOrThrow()

        await events_processor.processListeners(db)

        const [listener_take3] = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listener_take3.listener_name, 'neverWorks')
        assertEquals(listener_take3.error_message, 'Never Works')
        assertEquals(listener_take3.error_count, 3)
        assert(listener_take3.backoff_until instanceof Date)
        assertEquals(listener_take3.processed_at, null)

        await events.clearBackoff(db, { event_listener_id: listener_after.id })

        await events_processor.processListeners(db)

        const [listener_take4] = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listener_take4.listener_name, 'neverWorks')
        assertEquals(listener_take4.error_message, 'Never Works')
        assertEquals(listener_take4.error_count, 3)
        assertEquals(listener_take4.backoff_until, null)
        assertEquals(listener_take4.processed_at, null)
      })

      it('can move into a successful state for a message that fails on the first try', async () => {
        const event = await events.insert(db, {
          type: 'TEST_WORKS_ON_SECOND_TRY',
          data: { foo: generateUUID() },
        })

        await events_processor.addListeners(db)
        await events_processor.processListeners(db)
        await events_processor.processListeners(db)

        const [listener_after] = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listener_after.listener_name, 'workOnSecondTry')
        assertEquals(listener_after.error_message, 'Fails at first')
        assertEquals(listener_after.error_count, 1)
        assert(listener_after.backoff_until instanceof Date)
        assertEquals(listener_after.processed_at, null)

        await events.clearBackoff(db, { event_listener_id: listener_after.id })

        await events_processor.processListeners(db)

        const [listener_take2] = await events.selectListenersOfEvent(db, {
          event_id: event.id,
        })

        assertEquals(listener_take2.listener_name, 'workOnSecondTry')
        assertEquals(listener_take2.error_message, null)
        assertEquals(listener_take2.error_count, 0)
        assertEquals(listener_take2.backoff_until, null)
        assert(listener_take2.processed_at instanceof Date)
      })
    })
  },
)
