import { sql } from 'kysely'
import { isPriority, Priority } from '../../shared/priorities.ts'
import { Maybe, PostgresInterval, RenderedNotification, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { orderByArrayPosition } from '../helpers.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { assert } from 'std/assert/assert.ts'

type Terms = {
  health_worker_id?: Maybe<string>
  originator_health_worker_id?: Maybe<string>
  patient_encounter_id?: Maybe<string>
  notification_type?: Maybe<string>
  past_ts?: number | Date
  only_unread?: boolean
  recent_first?: boolean
}

export const referrals = base({
  top_level_table: 'health_worker_web_notifications',
  baseQuery(trx, terms: Terms) {
    assertOr400(terms.health_worker_id || terms.originator_health_worker_id)
    return trx
      .selectFrom('health_worker_web_notifications')
      .selectAll('health_worker_web_notifications')
      .select(
        sql<
          PostgresInterval
        >`(current_timestamp - health_worker_web_notifications.created_at)::interval`
          .as('wait_time'),
      )
      .$if(!!terms.health_worker_id, qb => qb.where('health_worker_id', '=', terms.health_worker_id!))
      .$if(!!terms.originator_health_worker_id, qb => qb.where('originator_health_worker_id', '=', terms.originator_health_worker_id!))
      .$if(!!terms.patient_encounter_id, qb => qb.where('patient_encounter_id', '=', terms.patient_encounter_id!))
      .$if(!!terms.notification_type, qb => qb.where('notification_type', '=', terms.notification_type!))
      .orderBy(
        'health_worker_web_notifications.created_at',
        terms?.recent_first ? 'desc' : 'asc',
      )
      .$if(
        !!terms?.past_ts,
        (qb) =>
          qb.where(
            'health_worker_web_notifications.created_at',
            '>',
            new Date(terms?.past_ts!),
          ),
      )
      .$if(
        !!terms?.only_unread,
        (qb) =>
          qb.where(
            'health_worker_web_notifications.seen_at',
            'is',
            null,
          ),
      )
  },
  formatResult({ id, wait_time, action_title, action_href, ...n }): RenderedNotification {
    return (
      {
        ...n,
        notification_id: id,
        time_display: timeAgoDisplay(wait_time),
        action: {
          title: action_title,
          href: action_href,
        },
      }
    )
  },
})
