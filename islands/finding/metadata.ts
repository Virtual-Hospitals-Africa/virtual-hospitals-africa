import type { EnteredFinding, Existence, FindingModalMetadata, FindingRelatedModifiers, Maybe, Priority } from '../../types.ts'
import { parseSExpressionAsInsertableFinding } from '../../shared/parseSExpressionAsInsertableFinding.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { findingFullDisplay, insertableFindingFullDisplay } from '../../shared/patient_records.ts'
import { dispatchFindingEvent } from '../../shared/finding_events.ts'

// What the finding modal needs to know about a finding, whichever list it was checked in
export type FindingForModal = FindingRelatedModifiers & {
  clinical_finding_s_expression: string
  priority?: Maybe<Priority>
}

export function asEntered({ priority, clinical_finding_s_expression: s_expression }: FindingForModal): EnteredFinding {
  const display = insertableFindingFullDisplay(s_expression)
  return { s_expression, priority, display }
}

// TODO when working on making a FindingsModal that's actually reusable we may want to make aspects of this logic more portable
export function asFindingModalMetadata({
  priority,
  relevant_qualifiers,
  predefined_attributes,
  clinical_finding_s_expression,
  onset_required,
}: FindingForModal): FindingModalMetadata {
  const sign_node = parseSExpressionAsInsertableFinding(clinical_finding_s_expression)

  // The sign's qualifers are inherent to the sign itself and thus nonremovable
  const inherent_qualifiers = sign_node.qualifiers
  const inherent_qualifiers_s_expressions = new Set(inherent_qualifiers.map(inverseSExpression))

  // The backend sends relevant_qualifiers that are in a sense redundant because they're inherent in the sign
  // We form the optional_relevant_qualifiers, which are those that are not inherent in the sign and thus can be included or not
  // As an example for Circumferential Burn, "Circumferential" is inherent but also sent as a relevant qualifier (because it would be relevant for a Burn)
  // We don't want the user removing "Circumferential" for that sign, so it is not optional
  // TODO Evaluate whether it's worth having the backend do this deduplication
  const optional_relevant_qualifiers = relevant_qualifiers.filter((relevant_qualifier) =>
    !inherent_qualifiers_s_expressions.has(relevant_qualifier.s_expression)
  )

  return {
    priority,
    predefined_attributes,
    inherent_qualifiers,
    optional_relevant_qualifiers,
    onset_required,
    display: findingFullDisplay(sign_node),
  }
}

/*
  Asks the finding recorder (islands/finding/Recorder.tsx) to open the modal for a finding.
  `existing` is the record the finding already has, if any: the one a save supersedes and
  Remove retracts. The list dispatching this knows it from its RecordedFinding for the
  finding, or failing that from the record the server rendered the finding with.
*/
export function openFinding({ key, finding, entered, just_checked, existing }: {
  key: string
  finding: FindingForModal | null
  entered: EnteredFinding
  just_checked: boolean
  existing: null | { record_id: string; existence: Existence }
}) {
  dispatchFindingEvent('finding:open', {
    key,
    metadata: finding && asFindingModalMetadata(finding),
    entered,
    just_checked,
    existing,
  })
}
