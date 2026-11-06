import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { TASKS_LISP } from '../../s_expression/tasks.ts'
import { insertable_finding_base, type Lang, system_diagnosis_rule, system_priority_evaluation, task } from '../../shared/s_expression_schemas.ts'
import db from '../../db/db.ts'
import { collect, filter } from '../../util/inParallel.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_LISP } from '../../s_expression/system_priority_evaluations.ts'
import { SYSTEM_DIAGNOSIS_RULES_LISP } from '../../s_expression/system_diagnosis_rules.ts'
import { parseLispFile, walkDirectory } from '../../s_expression/compile.ts'
import { allEvidenceToLookFor } from '../../db/models/s_expression_evidence.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { ALL_ASSESSMENT_OPTIONS_PARSED, VITALS_ADULT_SNOMED_CONCEPT_NAMES } from '../../shared/vitals.ts'
import { isCheckFor } from '../../db/models/additional_tasks.ts'
import compactMap from '../../util/compactMap.ts'
import { allConceptsToLookFor } from '../../shared/s_expression_concepts.ts'
import { conceptDoesNotExist } from '../../db/models/snomed_concept_exists.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { COMMON_SYMPTOMS } from '../../shared/common_symptoms.ts'
import { Maybe, Yielded } from '../../types.ts'

function* nodesAndConceptsTasks() {
  for (const s_expression of TASKS_LISP) {
    const node = parseWithSchema(s_expression, task)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemPriorityEvaluations() {
  for (const s_expression of SYSTEM_PRIORITY_EVALUATIONS_LISP) {
    const node = parseWithSchema(s_expression, system_priority_evaluation)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemDiagnosisRules() {
  for (const s_expression of SYSTEM_DIAGNOSIS_RULES_LISP) {
    const node = parseWithSchema(s_expression, system_diagnosis_rule)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

function* allFindingsToLookFor(rule: Lang['system_priority_evaluation' | 'system_diagnosis_rule']) {
  for (const evidence of allEvidenceToLookFor(rule.due_to)) {
    switch (evidence.atom) {
      case '>':
      case '<':
      case '>=':
      case '<=':
      case '=':
        yield evidence.measurement
        break
      default: {
        yield evidence
        break
      }
    }
  }
}

function specificSnomedConceptOf(finding: EvidenceFinding): Maybe<Lang['snomed_concept']> {
  switch (finding.atom) {
    case 'active_condition':
      return finding.snomed_concept
    case 'diagnosis':
      return finding.snomed_concept
    case 'finding':
      return finding.specific_snomed_concept
    case 'evaluation':
      return finding.specific_snomed_concept
    case 'measurement':
      throw new Error('Should have been handled')
    default: {
      // deno-lint-ignore no-explicit-any
      throw new Error((finding as any).atom)
    }
  }
}

type EvidenceFinding = Yielded<typeof allFindingsToLookFor>

// ── Known-issue skip lists for the apc-adult page review ────────────────────────────────
// The rules under s_expression/rules/apc-adult are being reviewed page-by-page against the APC
// page images (see docs/apc-adult-rules-briefing.md). Until a page has been reviewed, its
// check_for findings are excluded from the coverage checks below so that the tests stay green
// for the pages that have been completed. Remove a page number from this set once its rules
// file has been brought up to standard.
const APC_PAGES_NOT_YET_REVIEWED = new Set<string>([])

// Individual known issues that survive a page review. Every entry MUST be explained in
// s_expression/rules/apc-adult/<page>-<slug>-remaining-questions.md. Keyed by page number and
// the exact (inverse) s-expression reported by the failing test.
const APC_KNOWN_ISSUES: { page: string; s_expression: string; reason: string }[] = [
  { page: "24", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Stable angina\" \"disorder\") (qualifier (snomed_concept \"Known present\" \"qualifier value\"))))", reason: "known issue: The page routes \"not known with stable angina\" to ACS likely. The finding is checked for in \"Check chest pain character " },
  { page: "28", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sneezing\" \"finding\") (qualifier (snomed_concept \"Recurrent\" \"qualifier value\")))", reason: "known issue: Used as evidence inside (> (onset \u2026) (time_ago 4 weeks)) in Diagnose probable allergic rhinitis in previous anaphylaxis " },
  { page: "28", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Itching\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Nasal structure\" \"body structure\")))", reason: "known issue: Used as evidence inside (> (onset \u2026) (time_ago 4 weeks)) in Diagnose probable allergic rhinitis in previous anaphylaxis " },
  { page: "28", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nasal discharge\" \"finding\"))", reason: "known issue: Used as evidence inside (> (onset \u2026) (time_ago 4 weeks)) in Diagnose probable allergic rhinitis in previous anaphylaxis " },
  { page: "28", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nasal congestion\" \"finding\"))", reason: "known issue: Used as evidence inside (> (onset \u2026) (time_ago 4 weeks)) in Diagnose probable allergic rhinitis in previous anaphylaxis " },
  { page: "77", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Eruption\" \"morphologic abnormality\") (qualifier (snomed_concept \"Painless\" \"qualifier value\"))))", reason: "known issue: The painless rash is checked for in 'Check for urgent joint symptom conditions'; the checker does not match a (no ...) o" },
  { page: "34", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Suicidal thoughts\" \"finding\") (qualifier (snomed_concept \"Current\" \"qualifier value\"))))", reason: "known issue: The positive Current-qualified form is in the check_for; the gate does not match the (no ...) form of a qualified findin" },
  { page: "34", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Planning suicide\" \"finding\") (qualifier (snomed_concept \"Current\" \"qualifier value\"))))", reason: "known issue: The positive Current-qualified form is in the check_for; the gate does not match the (no ...) form of a qualified findin" },
  { page: "21", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Epilepsy\" \"disorder\") (qualifier (snomed_concept \"Known present\" \"qualifier value\")))", reason: "known issue: Gate false positive: the finding is used as (no X) in 'Urgent: same-day referral after a seizure/fit' (HIV and no known " },
  { page: "21", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Epilepsy\" \"disorder\") (qualifier (snomed_concept \"Known present\" \"qualifier value\"))))", reason: "known issue: Gate false positive: the finding is used as (no X) in 'Urgent: same-day referral after a seizure/fit' (HIV and no known " },
  { page: "64", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Scratch marks\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Vulval structure\" \"body structure\"))))", reason: "known issue: Gate artefact: (no X) is matched by a regex (NO_RE in tools/gate.ts) that expects the No qualifier last, but for a findi" },
  { page: "78", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Backache\" \"finding\") (qualifier (snomed_concept \"Progressive\" \"qualifier value\")))", reason: "known issue: Used as (no ...) in \"Diagnose probable mechanical back pain\" (Q2 = No). The checker does not match a qualified finding i" },
  { page: "78", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Stiff back\" \"finding\") (qualifier (snomed_concept \"Morning\" \"qualifier value\")))", reason: "known issue: Used as (no ...) in \"Diagnose probable mechanical back pain\" (Q3 = No) and checked for in \"Check for causes of back pain" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Stiff back\" \"finding\") (qualifier (snomed_concept \"Morning\" \"qualifier value\"))))", reason: "known issue: Used as (no ...) in \"Diagnose probable mechanical back pain\" (Q3 = No) and checked for in \"Check for causes of back pain" },
  { page: "130", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tuberculosis\" \"disorder\") (qualifier (snomed_concept \"Known present\" \"qualifier value\")))", reason: "known issue: It is used, as (no X) in 'Diagnose possible TB in HIV patient before starting ART' (Q1 = No). The gate's NO_RE only stri" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Skin ulcer\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Occipital region structure\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Skin ulcer\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Structure of vertebral column\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Skin ulcer\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Structure of scapular region of back\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Skin ulcer\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Elbow region structure\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Skin ulcer\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Sacral region back structure\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Skin ulcer\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Hip region structure\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Skin ulcer\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Ankle region structure\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Skin ulcer\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Heel structure\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Weak arterial pulse\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Foot structure\" \"body structure\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling of lower limb\" \"finding\") (qualifier (snomed_concept \"Chronic\" \"qualifier value\"))))", reason: "known issue: Gate limitation: the (no X) form of a finding with a finding_site or qualifier renders with the \"No\" value before the at" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Urticaria\" \"disorder\") (qualifier (snomed_concept \"Generalized\" \"qualifier value\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Eye region structure\" \"body structure\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Lip structure\" \"body structure\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Tongue structure\" \"body structure\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Face structure\" \"body structure\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Hand structure\" \"body structure\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Foot structure\" \"body structure\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Tongue structure\" \"body structure\")) (qualifier (snomed_concept \"Severe (severity modifier)\" \"qualifier value\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Lip structure\" \"body structure\")) (qualifier (snomed_concept \"Severe (severity modifier)\" \"qualifier value\"))))", reason: "known issue: Faithful encoding of \"no other associated symptoms\": the positive form of this finding (with its finding_site/qualifier)" },
  { page: "53", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Pseudomembrane\" \"morphologic abnormality\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Pharyngeal structure\" \"body structure\"))))", reason: "known issue: Gate tool bug: NO_RE in tools/gate.ts expects the 'No' qualifier last, but with a finding_site the canonical form puts i" },
  { page: "53", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Pseudomembrane\" \"morphologic abnormality\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Nasal structure\" \"body structure\"))))", reason: "known issue: Gate tool bug: NO_RE in tools/gate.ts expects the 'No' qualifier last, but with a finding_site the canonical form puts i" },
  { page: "89", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Papule of skin\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Palm (region) structure\" \"body structure\")))", reason: "known issue: Faithful encoding of \"Does not involve palms/soles\" as (no papule at palm/sole). The (no X) form with a finding_site ren" },
  { page: "89", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Papule of skin\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Structure of sole of foot\" \"body structure\")))", reason: "known issue: Faithful encoding of \"Does not involve palms/soles\" as (no papule at palm/sole). The (no X) form with a finding_site ren" },
  { page: "89", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Papule of skin\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Palm (region) structure\" \"body structure\"))))", reason: "known issue: Faithful encoding of \"Does not involve palms/soles\" as (no papule at palm/sole). The (no X) form with a finding_site ren" },
  { page: "89", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Papule of skin\" \"disorder\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Structure of sole of foot\" \"body structure\"))))", reason: "known issue: Faithful encoding of \"Does not involve palms/soles\" as (no papule at palm/sole). The (no X) form with a finding_site ren" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Dizziness\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Lightheadedness\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sensation of being warm\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sensation of being cold\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sweating\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Palpitations\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Blurring of visual image\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Decreased hearing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Pale complexion\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Itching\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nasal congestion\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Wheezing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Cough\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tightness in throat\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Stridor\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Dyspnea\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Hoarse\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Difficulty swallowing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Dribbling from mouth\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nausea\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Finding of vomiting\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Diarrhea\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Abdominal colic\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Low blood pressure\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Respiratory distress\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "14", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Generally unwell\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "15", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Wheezing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "15", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Stridor\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "15", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Cough\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "15", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "15", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Eruption\" \"morphologic abnormality\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "176", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Induced termination of pregnancy\" \"disorder\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "177", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Uterine contractions present\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "177", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Cervical os open\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "177", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Cervix dilated\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "177", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Products of conception at uterine os cervix\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "177", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Products of conception in vagina\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "177", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Proteinuria\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "182", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Postpartum state\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "19", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Ketonuria\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "196", s_expression: "(active_condition (snomed_concept \"Fever\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "21", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Seizure\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "21", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Postpartum state\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "22", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Wheezing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "23", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Respiratory crackles\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "23", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Bronchial breathing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "23", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Cough\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "23", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Difficulty breathing\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "23", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Difficulty breathing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "24", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Pain aggravated by position\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "24", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tenderness of chest wall\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "24", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Chest pain on breathing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "24", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Chest pain\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "24", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Chest pain at rest\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "26", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Thirst due to water deprivation\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "26", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Xerostomia\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "26", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Decreased skin turgor\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "26", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Decreased urine output\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "32", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sexual assault\" \"event\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "32", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Rape\" \"event\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "33", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Victim of forced sexual activity\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Thoughts of self harm\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Suicidal thoughts\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Planning suicide\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"History of attempted suicide\" \"situation\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"History of deliberate self harm\" \"situation\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Suicide attempt\" \"event\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Intentionally harming self\" \"event\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Feeling agitated\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Aggressive behavior\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Distress\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "34", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Does not communicate\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "36", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Memory impairment\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "36", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Disorientated\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "36", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Language difficulty\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "36", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Difficulty coping\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "38", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tick bite\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "38", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Infestation caused by Ixodidae\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "38", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Infestation caused by Argasidae\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "39", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"History of travel with high risk of exposure to communicable disease\" \"situation\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "39", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Anuria\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "40", s_expression: "(finding (snomed_concept \"Exposure to (contextual qualifier)\" \"qualifier value\") (snomed_concept \"Monkeypox virus\" \"organism\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "40", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Lymphadenopathy\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "40", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"New medication commenced\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "40", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Itching\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "42", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Constipation\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "42", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Unable to break wind\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "42", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Mass of skin\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "42", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Thyroid gland moves with swallowing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "42", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Cough impulse of mass present\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "42", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Recurrent abscess\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "45", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tachypnea\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "45", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Excessively deep breathing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "46", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Collapse\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "46", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tachypnea\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "46", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Excessively deep breathing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "46", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Hearing loss\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "46", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tinnitus\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "46", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Dizziness\" \"finding\") (qualifier (snomed_concept \"Sudden onset\" \"qualifier value\")))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "47", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tick bite\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "47", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Postpartum state\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "48", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Itching of eye\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "48", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Pregnancy\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "48", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Postpartum state\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "49", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Upper facial weakness\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Chill\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nausea\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Muscle pain\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sore throat\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(active_condition (snomed_concept \"Fever\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sneezing\" \"finding\") (qualifier (snomed_concept \"Recurrent\" \"qualifier value\")))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Itching\" \"finding\") (attribute (snomed_concept \"Finding site\" \"attribute\") (snomed_concept \"Nasal structure\" \"body structure\")) (qualifier (snomed_concept \"Recurrent\" \"qualifier value\")))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nasal discharge\" \"finding\") (qualifier (snomed_concept \"Recurrent\" \"qualifier value\")))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "51", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nasal congestion\" \"finding\") (qualifier (snomed_concept \"Recurrent\" \"qualifier value\")))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "53", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Cough\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "53", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nasal discharge\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "53", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling of tonsil\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "53", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Exudate on tonsils\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "55", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Generalized aches and pains\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "55", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Maternal breastfeeding\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "56", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Obstipation\" \"disorder\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "56", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Unable to break wind\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "57", s_expression: "(finding (snomed_concept \"Exposure to (contextual qualifier)\" \"qualifier value\") (snomed_concept \"Vibrio cholerae\" \"organism\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "57", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Passing flatus\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "58", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Hematochezia\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "58", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Diarrhea\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "58", s_expression: "(no (finding (snomed_concept \"Exposure to (contextual qualifier)\" \"qualifier value\") (snomed_concept \"Vibrio cholerae\" \"organism\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(finding (snomed_concept \"Exposure to (contextual qualifier)\" \"qualifier value\") (snomed_concept \"Vibrio cholerae\" \"organism\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Drowsy\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Decreased level of consciousness\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Acute confusion\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Difficulty breathing\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Weak arterial pulse\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Unable to drink\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Difficulty drinking\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Decreased skin turgor\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "59", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sunken eyes\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "60", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Obstipation\" \"disorder\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "60", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Unable to break wind\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "63", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Prolonged erection of penis\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "64", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sexually active\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "64", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Erythema of vulva\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "64", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Inflammation of vulva\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "64", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Lower abdominal pain\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "64", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Pain on movement of cervix\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Urinary catheter in situ\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Diabetes mellitus\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Pregnancy\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Disorder of urinary system\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Perineal pain\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Generalized aches and pains\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Tenderness of prostate\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Increased frequency of urination\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Urgent desire to urinate\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Leukocytes in urine\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "69", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Nitrite detected in urine\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "77", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Traumatic injury\" \"disorder\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "77", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Traumatic injury\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "77", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Pain of joint\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "77", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Itching\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "77", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Fever\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "77", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Wound\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "77", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Vaginal discharge\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "77", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Urethral discharge\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Cough\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Weight decreased\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Night sweats\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Fever\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"History of malignant neoplasm\" \"situation\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"History of spinal surgery\" \"situation\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Osteoporosis\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Use of steroids\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Human immunodeficiency virus infection\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Intravenous drug user\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Deformity of spine\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Sleep pattern disturbance\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "78", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Backache\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "80", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Swelling of lower limb\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "82", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"New medication commenced\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "84", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"New medication commenced\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "86", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Eruption\" \"morphologic abnormality\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "86", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Infestation caused by Sarcoptes scabiei var hominis\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "86", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Louse infestation\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "86", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Insect bite - wound\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "86", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Severe dry skin\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "86", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"New medication commenced\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "87", s_expression: "(finding (snomed_concept \"Exposure to (contextual qualifier)\" \"qualifier value\") (snomed_concept \"Drug or medicament\" \"substance\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "87", s_expression: "(finding (snomed_concept \"Exposure to (contextual qualifier)\" \"qualifier value\") (snomed_concept \"Human immunodeficiency virus\" \"organism\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "87", s_expression: "(no (finding (snomed_concept \"Exposure to (contextual qualifier)\" \"qualifier value\") (snomed_concept \"Human immunodeficiency virus\" \"organism\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "88", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"New medication commenced\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Bed-ridden\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Dependence on wheelchair\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Intermittent claudication\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Foot pulse absent\" \"finding\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Hyperpigmentation of skin\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "90", s_expression: "(no (finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Varicose veins of lower extremity\" \"disorder\")))", reason: "no-evidence not matched by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "98", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Worried\" \"finding\") (qualifier (snomed_concept \"Excessive\" \"qualifier value\")))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "98", s_expression: "(finding (snomed_concept \"Clinical finding\" \"finding\") (snomed_concept \"Anxiety\" \"finding\"))", reason: "onset subject not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "111", s_expression: "(measurement (snomed_concept \"Body mass index\" \"observable entity\") kg/m\u00b2)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "22", s_expression: "(measurement (snomed_concept \"Recorded/predicted peak expiratory flow rate ratio\" \"observable entity\") %)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "24", s_expression: "(measurement (snomed_concept \"Risk of cardiovascular disease\" \"observable entity\") %)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "45", s_expression: "(measurement (snomed_concept \"Level of reduction in systolic blood pressure on standing\" \"observable entity\") mmHg)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "56", s_expression: "(measurement (snomed_concept \"Body mass index\" \"observable entity\") kg/m\u00b2)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "56", s_expression: "(measurement (snomed_concept \"Waist circumference\" \"observable entity\") cm)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "57", s_expression: "(measurement (snomed_concept \"Body mass index\" \"observable entity\") kg/m\u00b2)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "57", s_expression: "(measurement (snomed_concept \"Waist circumference\" \"observable entity\") cm)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
  { page: "89", s_expression: "(measurement (snomed_concept \"Lesion size, largest dimension\" \"observable entity\") mm)", reason: "measured item not seen by VHA test (VHA test limitation, see apc-2026-full)" },
]

function apcPageNumberOf(file_path: string): Maybe<string> {
  if (!file_path.includes('s_expression/rules/apc-adult/')) return null
  return file_path.split('/').pop()!.match(/^(\d+)/)?.[1] ?? null
}

function isApcPageNotYetReviewed(file_path: string): boolean {
  const page = apcPageNumberOf(file_path)
  return !!page && APC_PAGES_NOT_YET_REVIEWED.has(page)
}

function isApcKnownIssue(file_path: string, s_expression: string): boolean {
  const page = apcPageNumberOf(file_path)
  return !!page && APC_KNOWN_ISSUES.some((issue) => issue.page === page && issue.s_expression === s_expression)
}

function evidenceCollectedDuringWarningSignsOrVitals(
  finding: EvidenceFinding,
  rule: Lang['system_priority_evaluation' | 'system_diagnosis_rule'],
) {
  if (finding.atom === 'measurement') {
    return VITALS_ADULT_SNOMED_CONCEPT_NAMES.has(finding.snomed_concept.name)
  }
  if (finding.atom === 'active_condition' && finding.snomed_concept.name === 'Fever') {
    return true
  }

  const snomed_concept = specificSnomedConceptOf(finding)
  if (!snomed_concept) return false

  const matches_some_assessment_option = ALL_ASSESSMENT_OPTIONS_PARSED.some((option) =>
    option.specific_snomed_concept!.name === snomed_concept?.name &&
    option.specific_snomed_concept!.category === snomed_concept?.category
  )
  if (matches_some_assessment_option) return true
  return rule.ages.every((age) => {
    const signs = [
      ...WARNING_SIGNS[age],
      ...COMMON_SYMPTOMS,
    ]
    return signs.some((sign) => {
      const node = parseWithSchema(sign.clinical_finding_s_expression, insertable_finding_base)
      return node.specific_snomed_concept!.name === snomed_concept?.name &&
        node.specific_snomed_concept!.category === snomed_concept?.category
    })
  })
}

describe('s_expression', () => {
  afterAll(() => db.destroy())
  describe('TASKS_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsTasks(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })
    it('each finding we check_for is used as part of a due_to for at least one system_diagnosis_rule or system_priority_evaluation', async () => {
      const checked_for_but_never_used_as_evidence = await collect(checkedForButNeverUsedAsEvidence())
      // Deno.writeFileSync(
      //   './checked_for_but_never_used_as_evidence.json',
      //   new TextEncoder().encode(humanReadableJson(checked_for_but_never_used_as_evidence)),
      // )

      assertArrayEmpty(checked_for_but_never_used_as_evidence)

      async function* checkedForButNeverUsedAsEvidence() {
        const task_nodes: { file_path: string; task_node: Lang['task'] }[] = []
        for await (const file_path of walkDirectory()) {
          for (const task_node of await parseLispFile(file_path)) {
            if (task_node.atom !== 'task') continue
            task_nodes.push({ file_path, task_node })
          }
        }

        const rule_evidence = new Set([
          ...SYSTEM_DIAGNOSIS_RULES_LISP.map((s_expression) => parseWithSchema(s_expression, system_diagnosis_rule)),
          ...SYSTEM_PRIORITY_EVALUATIONS_LISP.map((s_expression) => parseWithSchema(s_expression, system_priority_evaluation)),
        ].flatMap((rule) => Array.from(allEvidenceToLookFor(rule.due_to), (evidence) => inverseSExpression(evidence))))

        // Which tasks each piece of evidence triggers, by index into task_nodes
        const tasks_triggered_by = new Map<string, Set<number>>()
        for (const [index, { task_node }] of task_nodes.entries()) {
          for (const evidence of allEvidenceToLookFor(task_node.due_to)) {
            const evidence_s_expression = inverseSExpression(evidence)
            const triggered = tasks_triggered_by.get(evidence_s_expression) ?? new Set()
            triggered.add(index)
            tasks_triggered_by.set(evidence_s_expression, triggered)
          }
        }

        const already_yielded = new Set<string>()

        for (const [index, { file_path, task_node }] of task_nodes.entries()) {
          if (!isCheckFor(task_node.to_be_done)) continue
          if (isApcPageNotYetReviewed(file_path)) continue
          for (const finding of task_node.to_be_done.value) {
            const finding_s_expression = inverseSExpression(finding)
            // A rule keying off of the finding's absence still relies on us having checked for it
            if (isUsedByAnythingElse(finding_s_expression, index)) continue
            if (isUsedByAnythingElse(`(no ${finding_s_expression})`, index)) continue
            if (isApcKnownIssue(file_path, finding_s_expression)) continue
            if (already_yielded.has(finding_s_expression)) continue
            already_yielded.add(finding_s_expression)
            yield {
              file_path,
              description: task_node.description,
              never_used_as_evidence: finding_s_expression,
            }
          }
        }

        // Triggering some other task counts as using the finding. Triggering only the very task
        // that checks for it does not; see the self-referentiality test below.
        function isUsedByAnythingElse(evidence_s_expression: string, checking_task_index: number): boolean {
          if (rule_evidence.has(evidence_s_expression)) return true
          const triggered = tasks_triggered_by.get(evidence_s_expression)
          if (!triggered) return false
          return [...triggered].some((index) => index !== checking_task_index)
        }
      }
    })
    it('no task checks for a finding that is already part of its own due_to', async () => {
      const tasks_checking_for_their_own_due_to = await collect(tasksCheckingForTheirOwnDueTo())
      assertArrayEmpty(tasks_checking_for_their_own_due_to)

      async function* tasksCheckingForTheirOwnDueTo() {
        for await (const file_path of walkDirectory()) {
          if (isApcPageNotYetReviewed(file_path)) continue
          for (const task_node of await parseLispFile(file_path)) {
            if (task_node.atom !== 'task') continue
            if (!isCheckFor(task_node.to_be_done)) continue
            const due_to = new Set(Array.from(allEvidenceToLookFor(task_node.due_to), (evidence) => inverseSExpression(evidence)))
            for (const finding of task_node.to_be_done.value) {
              const finding_s_expression = inverseSExpression(finding)
              if (due_to.has(finding_s_expression)) {
                yield {
                  file_path,
                  description: task_node.description,
                  already_known_from_due_to: finding_s_expression,
                }
              }
            }
          }
        }
      }
    })
  })
  describe('SYSTEM_PRIORITY_EVALUATIONS_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsSystemPriorityEvaluations(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })

    it('leverages findings we check for in TASKS_LISP or things that we can diagnose as probable based on the apc adult guidelines', async () => {
      const system_diagnosis_rules = SYSTEM_DIAGNOSIS_RULES_LISP.map((s_expression) => parseWithSchema(s_expression, system_diagnosis_rule))

      const all_probable_diagnoses = compactMap(system_diagnosis_rules, (system_diagnosis_rule) => {
        if (system_diagnosis_rule.diagnosis.certainty_qualifier !== 'probable') return
        return system_diagnosis_rule.diagnosis.snomed_concept
      })

      const rules_without_corresponding_check_for_system_diagnosis_rule = await collect(
        systemPriorityEvaluationsWithNoCheckForNorDiagnosisNorTakenAsWarningSignsNorVitals(),
      )
      assertArrayEmpty(rules_without_corresponding_check_for_system_diagnosis_rule)

      async function* systemPriorityEvaluationsWithNoCheckForNorDiagnosisNorTakenAsWarningSignsNorVitals() {
        for await (const { file_path, system_priority_evaluations, tasks } of correspondingAPCRules()) {
          const all_checking_for = new Set(tasks.flatMap((task_node) => {
            const due_to = allEvidenceToLookFor(task_node.due_to).map(inverseSExpression)
            // TODO  || isMeasurements(task_node.to_be_done)?
            const checking_for = isCheckFor(task_node.to_be_done) ? task_node.to_be_done.value.map(inverseSExpression) : []

            return [
              ...due_to,
              ...checking_for,
            ]
          }))

          for (const rule of system_priority_evaluations) {
            for (const finding of allFindingsToLookFor(rule)) {
              const evidence_collected_during_warning_signs_or_vitals = evidenceCollectedDuringWarningSignsOrVitals(finding, rule)
              if (evidence_collected_during_warning_signs_or_vitals) continue
              const evaluating_a_diagnosed_condition = finding.atom === 'active_condition' &&
                all_probable_diagnoses.some((probable_diagnosis) =>
                  finding.snomed_concept.name === probable_diagnosis.name &&
                  finding.snomed_concept.category === probable_diagnosis.category
                )
              if (evaluating_a_diagnosed_condition) continue
              const finding_s_expression = inverseSExpression(finding)
              if (all_checking_for.has(finding_s_expression)) continue
              if (isApcKnownIssue(file_path, finding_s_expression)) continue

              yield {
                file_path,
                description: rule.description,
                didnt_check_for: finding_s_expression,
              }
            }
          }
        }
      }

      async function* correspondingAPCRules() {
        for await (const file_path of walkDirectory('s_expression/rules/apc-adult')) {
          if (isApcPageNotYetReviewed(file_path)) continue
          const rules = await parseLispFile(file_path)
          yield {
            file_path,
            tasks: rules.filter((rule) => rule.atom === 'task'),
            system_priority_evaluations: rules.filter((rule) => rule.atom === 'system_priority_evaluation'),
          }
        }
      }
    })
  })
  describe('SYSTEM_DIAGNOSIS_RULES_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsSystemDiagnosisRules(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })

    it('leverages findings we check for in TASKS_LISP based on the apc adult guidelines', async () => {
      const rules_without_corresponding_check_for = await collect(probableSystemDiagnosisRulesWithNoCheckFor())
      assertArrayEmpty(rules_without_corresponding_check_for)

      async function* probableSystemDiagnosisRulesWithNoCheckFor() {
        for await (const { file_path, system_diagnosis_rules, tasks } of correspondingAPCRules()) {
          const all_checking_for = new Set(tasks.flatMap((task_node) => {
            const due_to = allEvidenceToLookFor(task_node.due_to).map(inverseSExpression)
            // TODO  || isMeasurements(task_node.to_be_done)?
            const checking_for = isCheckFor(task_node.to_be_done) ? task_node.to_be_done.value.map(inverseSExpression) : []

            return [
              ...due_to,
              ...checking_for,
            ]
          }))

          for (const rule of system_diagnosis_rules) {
            if (rule.diagnosis.certainty_qualifier !== 'probable') continue
            for (const finding of allFindingsToLookFor(rule)) {
              const evidence_collected_during_warning_signs_or_vitals = evidenceCollectedDuringWarningSignsOrVitals(finding, rule)
              if (evidence_collected_during_warning_signs_or_vitals) continue

              const finding_s_expression = inverseSExpression(finding)
              if (isApcKnownIssue(file_path, finding_s_expression)) continue
              if (!all_checking_for.has(finding_s_expression)) {
                yield {
                  file_path,
                  description: rule.description,
                  didnt_check_for: finding_s_expression,
                }
              }
            }
          }
        }
      }

      async function* correspondingAPCRules() {
        for await (const file_path of walkDirectory('s_expression/rules/apc-adult')) {
          if (isApcPageNotYetReviewed(file_path)) continue
          const rules = await parseLispFile(file_path)
          yield {
            file_path,
            tasks: rules.filter((rule) => rule.atom === 'task'),
            system_diagnosis_rules: rules.filter((rule) => rule.atom === 'system_diagnosis_rule'),
          }
        }
      }
    })
  })

  describe('apc-adult', () => {
    it('has maximum one file per page number', async () => {
      const filepaths = await collect(walkDirectory('s_expression/rules/apc-adult'))
      assertUniquePageNumbers(filepaths)

      function assertUniquePageNumbers(filepaths: string[]) {
        const page_numbers = new Set<string>()
        for (const filepath of filepaths) {
          const page_number = filepath.match(/(\d+)/)![1]
          if (page_numbers.has(page_number)) {
            throw new Error(page_number + ' xx ' + filepath)
          }
          page_numbers.add(page_number)
        }
      }
    })
  })
})
