import { assert } from 'std/assert/assert.ts'
import { NoneOfTheAboveFindingsResponse } from '../../shared/none_of_the_above_findings_post.ts'
import { FollowUpGroup, RecordedFinding } from '../../types.ts'
import { noneOfTheAboveRequests } from './follow_ups.ts'
import { dispatchFindingEvent } from '../../shared/finding_events.ts'

/*
  Records every follow up of these groups still unanswered as absent, one request per task
  so that each task is marked done. One after another so a finding checked for by two tasks
  is only recorded once. Every list then learns of the negatives through findings:recorded-absent.
  Throws if any request fails, leaving the caller to show the groups again.
*/
export async function postNoneOfTheAbove(
  route: string,
  groups: FollowUpGroup[],
  recorded: RecordedFinding[],
): Promise<void> {
  const records: NoneOfTheAboveFindingsResponse['records'] = []
  for (const request of noneOfTheAboveRequests(groups, recorded)) {
    const response = await fetch(route, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error(`none_of_the_above_findings responded ${response.status}: ${await response.text()}`)
    const json = await response.json() as NoneOfTheAboveFindingsResponse
    assert(json.success)
    records.push(...json.records)
  }
  dispatchFindingEvent('findings:recorded-absent', { records })
}
