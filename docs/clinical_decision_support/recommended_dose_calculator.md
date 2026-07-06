# Recommended Dose Calculator — SNOMED → ICD-10 decision support

## Purpose

The Recommended Dose Calculator is **clinical decision support**, not prescribing software.

- SNOMED concepts recorded during an encounter (positive findings and diagnoses) are translated to **suggested ICD-10 candidate codes**.
- EML-based dose rules produce **suggested medications and doses** for clinician review.
- **Nothing is auto-prescribed.** The treating clinician remains the final decision-maker for every diagnosis link and every dose.

This framing is intentional: it keeps the tool safe, auditable, and defensible in a clinical setting.

## Where it appears

Recommended medicines surface on the triage **route patient** page as part of the
**Recommended Care Plan**. Each care-plan card is headed by the positive records it
is "Due to"; medicines join the card whose records triggered them, alongside any
management tasks due to the same records. Each medicine shows its options
(form/route and weight-adjusted dose schedules) and who at the facility can
prescribe it, matched from the EML's prescriber field onto staff roles. When
nobody at the facility holds a qualifying role, an icon for the permitted role
(doctor, nurse, dentist, specialist) is shown in place of employee avatars.

## Data flow

1. Positive findings and diagnoses from this visit supply SNOMED concept IDs; the patient supplies demographics (DOB, sex, height, weight).
2. Each SNOMED concept is mapped via the International ICD-10 complex map reference set (`447562003`).
3. **Primary ICD-10 codes** (map group 1) from successful mappings are used for EML dose lookup, per record — so each matched medicine knows which records it is due to.
4. **Supplementary map groups** (manifestation, external cause, etc.) **do not broaden** dose suggestions.
5. Matching EML entries are grouped by medicine name and shown as **suggested medications** with weight-adjusted doses — for review only.

## SNOMED → ICD-10 mapping behaviour

### Context-dependent (IFA) rules

The map includes sex-dependent rules (`IFA 248152002` Female, `IFA 248153007` Male). When patient **sex** is known, these rules are resolved instead of falling back to an empty `OTHERWISE` row.

Age-at-onset IFA rules (`IFA 445518008 …`) require **age when the finding began**, not current age from DOB. Those are not resolved until onset age is captured — a planned enhancement.

### Multiple ICD-10 codes per SNOMED concept

A single SNOMED concept may map to several ICD-10 codes across map groups (primary + supplementary). **Policy for dose lookup:** use **primary (map group 1) only** for EML matching. Confirm with clinical mentors whether this policy should change for specific disorder types.

## Related code

- `shared/snomed_to_icd10.ts` — types, constants, lookup policy
- `db/models/snomed_to_icd10.ts` — map resolution
- `db/models/recommended_dose_calculator.ts` — per-record lookup, grouping by medicine name
- `db/models/recommended_doses.ts` — EML matching, age/weight application, due_to attribution
- `shared/permissions.ts` — prescriber → role matching (`applyPrescriberPermissions`)
- `shared/care_plan.ts` — merging medicines into care-plan cards by due_to
- `components/library/RecommendedCarePlan.tsx` — care plan UI

## Tests

```bash
deno task test test/models/snomed_to_icd10.test.ts
deno task test test/models/recommended_doses.test.ts
deno task test test/web/patients/open_encounter/triage/recommended_doses.test.ts
```
