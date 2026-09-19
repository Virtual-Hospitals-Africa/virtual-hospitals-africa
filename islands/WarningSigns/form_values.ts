import { WarningSignWithMaybeRecord } from '../../types.ts'
import compactMap from '../../util/compactMap.ts'
import uniq from '../../util/uniq.ts'
import { TriageWarningSignsPostBody } from '../../shared/warning_signs_post.ts'
import { CheckedWarningSign, sameSign } from './shared.ts'

/*
  A checked sign stands for the positive record it has, or the one it is about to have if
  its save is still in flight. A sign whose only record is negative is being overturned,
  so that record is not what the page is vouching for.
*/
export function savedRecordId(sign: CheckedWarningSign): string | undefined {
  if (sign.saving) return sign.saving.as_finding_id
  if (sign.existing_record?.existence === 'Yes') return sign.existing_record.id
}

/*
  The signs listed on the page (warning signs and common symptoms, never search results)
  that the health worker did not check are what they are saying the patient does not have.
  A record may stand behind two signs (a warning sign and the common symptom it specialises), so ids are listed once.
*/
export function warningSignsFormValues({ warning_signs, checked_signs }: {
  warning_signs: WarningSignWithMaybeRecord[]
  checked_signs: CheckedWarningSign[]
}): TriageWarningSignsPostBody {
  const unchecked = warning_signs.filter((sign) => !checked_signs.some((checked) => sameSign(checked, sign)))
  return {
    saved_record_ids: uniq(compactMap(checked_signs, savedRecordId)),
    none_of_these: {
      s_expressions: `(${unchecked.map((sign) => sign.clinical_finding_s_expression).join(' ')})`,
    },
  }
}
