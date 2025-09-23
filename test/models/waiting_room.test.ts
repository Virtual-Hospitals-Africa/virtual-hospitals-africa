import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import db from '../../db/db.ts'

describe(
  'db/models/waiting_room.ts',
  () => {
    afterAll(() => db.destroy())
    describe('timeAgoDisplay', () => {
      it('returns "Just now" for a patient who arrived less than 1 minute ago', () => {
        assertEquals(
          timeAgoDisplay({
            hours: 0,
            minutes: 0,
            seconds: 2,
            milliseconds: 0,
          }),
          'Just now',
        )
      }),
        it('returns "5 minutes ago" for a patient who arrived 5 minutes ago', () => {
          assertEquals(
            timeAgoDisplay({
              hours: 0,
              minutes: 5,
              seconds: 2,
              milliseconds: 0,
            }),
            '5 minutes ago',
          )
        }),
        it('returns "2 hours ago" for a patient who arrived 2 hours ago', () => {
          assertEquals(
            timeAgoDisplay({
              hours: 2,
              minutes: 5,
              seconds: 2,
              milliseconds: 0,
            }),
            '2 hours ago',
          )
        }),
        it('returns "1 day ago" for a patient who arrived 1 day ago', () => {
          assertEquals(
            timeAgoDisplay({
              days: 1,
              hours: 2,
              minutes: 5,
              seconds: 2,
              milliseconds: 0,
            }),
            '1 day ago',
          )
        }),
        it('returns "2 days ago" for a patient who arrived 2 days ago', () => {
          assertEquals(
            timeAgoDisplay({
              days: 2,
              hours: 2,
              minutes: 5,
              seconds: 2,
              milliseconds: 0,
            }),
            '2 days ago',
          )
        })
    })
  },
)
