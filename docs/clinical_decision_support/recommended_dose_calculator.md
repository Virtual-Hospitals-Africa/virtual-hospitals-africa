# Recommended Dose Calculator — SNOMED → ICD-10 decision support

## Purpose

The Recommended Dose Calculator is **clinical decision support**, not prescribing software.

- SNOMED diagnosis concept IDs are translated to **suggested ICD-10 candidate codes**.
- EML-based dose rules produce **suggested medications and doses** for clinician review.
- **Nothing is auto-prescribed.** The treating clinician remains the final decision-maker for every diagnosis link and every dose.

This framing is intentional: it keeps the tool safe, auditable, and defensible in a clinical setting.

## Data flow

1. Clinician enters patient demographics (DOB, sex, height, weight), optional manual ICD-10 conditions, and optional SNOMED concept IDs.
2. Each SNOMED concept is mapped via the International ICD-10 complex map reference set (`447562003`).
3. **Primary ICD-10 codes** (map group 1) from successful mappings are combined with manual ICD-10 codes for EML dose lookup.
4. **Supplementary map groups** (manifestation, external cause, etc.) appear in the audit trail but **do not broaden** dose suggestions.
5. Matching EML entries are shown as **suggested medications** with weight-adjusted doses — for review only.

## SNOMED → ICD-10 mapping behaviour

### Context-dependent (IFA) rules

The map includes sex-dependent rules (`IFA 248152002` Female, `IFA 248153007` Male). When patient **sex** is on the case form, these rules are resolved instead of falling back to an empty `OTHERWISE` row.

Age-at-onset IFA rules (`IFA 445518008 …`) require **age when the finding began**, not current age from DOB. Those are not resolved until onset age is captured — a planned enhancement.

### Mapping confidence and ambiguity (UI)

The results page surfaces:

| Situation | Clinician message |
|-----------|-------------------|
| No ICD-10 target for concept | **Not classifiable — please confirm** |
| Context-dependent but unresolved | **Please verify** (e.g. sex-specific rules without a match) |
| Context-dependent, resolved from sex | Shown in audit with “Resolved from patient sex” |
| Approximate correlation (when present in refset) | Narrower / broader / partial overlap labels |

Silent drops are avoided: every requested SNOMED concept appears in the **mapping audit** with either candidate codes or an explicit prompt to confirm manually.

### Multiple ICD-10 codes per SNOMED concept

A single SNOMED concept may map to several ICD-10 codes across map groups (primary + supplementary). **Policy for dose lookup:** use **primary (map group 1) only** for EML matching. Supplementary codes remain visible in the audit trail for traceability. Confirm with clinical mentors whether this policy should change for specific disorder types.

## Audit trail

For each SNOMED concept the UI records:

- Original SNOMED concept ID
- Each derived ICD-10 code, map group, and whether it was used for lookup
- Map category and correlation metadata when clinically meaningful
- Explicit status when no usable code was produced

Auditors and clinicians can see **why** a medication suggestion appeared.

## Related code

- `shared/snomed_to_icd10.ts` — types, constants, lookup policy
- `db/models/snomed_to_icd10.ts` — map resolution
- `components/SnomedIcd10MappingAudit.tsx` — audit UI
- `routes/clinical_decision_support_tools/recommended_dose_calculator/` — form and results

## Tests

```bash
deno task test test/models/snomed_to_icd10.test.ts
deno task test test/web/recommended_dose_calculator/recommended_medications.test.ts
```
