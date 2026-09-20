import { RecordedFinding, WarningSignWithMaybeRecord } from '../../types.ts'
import compactMap from '../../util/compactMap.ts'
import uniq from '../../util/uniq.ts'
import { TriageWarningSignsPostBody } from '../../shared/warning_signs_post.ts'
import { findRecorded } from './shared.ts'

/*
  The page vouches for every positive record made from it, whether already saved or about
  to be at the id its save is in flight under. A finding whose save failed stays entered so
  it is not recorded as absent, but has no record to vouch for.
*/
export function savedRecordId(recorded: RecordedFinding): string | undefined {
  if (recorded.failed) return
  return recorded.record_id
}

/*
  The signs listed on the page (warning signs and common symptoms, never search results)
  that the health worker did not check are what they are saying the patient does not have.
  A record may stand behind two signs (a warning sign and the common symptom it specialises), so ids are listed once.
*/
export function warningSignsFormValues({ warning_signs, recorded }: {
  warning_signs: WarningSignWithMaybeRecord[]
  recorded: RecordedFinding[]
}): TriageWarningSignsPostBody {
  const unchecked = warning_signs.filter((sign) => !findRecorded(recorded, sign))
  return {
    saved_record_ids: uniq(compactMap(recorded, savedRecordId)),
    none_of_these: {
      s_expressions: `(${unchecked.map((sign) => sign.clinical_finding_s_expression).join(' ')})`,
    },
  }
}
