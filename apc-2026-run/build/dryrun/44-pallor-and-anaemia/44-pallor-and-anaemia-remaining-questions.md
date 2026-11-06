# Page 44 – Pallor and anaemia: remaining questions

## Decisions made

- **Red box only.** One `check_for` task and one `Urgent` priority evaluation encode the red box.
  The rest of the page (the "anaemia likely" Hb thresholds above the box, and the "not needing
  urgent attention" approach with malaria and the MCV algorithm) is outside the red box, has no
  element keys in `p44.json`, and is not encoded. See **Could not model**.
- **Presenting complaint "pallor/anaemia"** is `Pale conjunctiva`, `Pale discoloration of entire
  skin of body` (its synonym is "Pallor") or `Anemia` (disorder) recorded as a `clinical_finding`.
  The page defines pallor as "pale conjunctiva or palms". No pale-palm concept exists, so the
  whole-skin pallor concept stands in for palms. `Pallor of skin of face` (VHA vocabulary) was not
  used, because the page does not mention the face. Anaemia is written as `clinical_finding`, not
  `active_condition`, so that the priority rule's evidence counts as checked for (no rule in this
  file diagnoses anaemia at `probable`).
- **Shock/SBP < 80** is encoded as written on this page: `(or Shock, SBP < 80)` inside the red-box
  `or`. Footnote 1 (the shock definition) is not imported. This follows the decision for all pages.
- **Pulse ≥ 100, respiratory rate ≥ 30, SBP < 80** use the routine vitals, so no `measure` task is
  needed.
- **Dizzy/faint** → `Dizziness` or `Feeling faint`.
- **Black or bloody stools** → `Melena` (disorder) or `Hematochezia` (finding).
- **Widespread/easy bruising** → `Easy bruising`.
- **Purple/red rash that does not disappear with pressure** → `Non-blanching rash` or
  `Purpuric rash`. Purpuric rash is added because it is a recorded warning sign and the term VHA
  already uses. It is not an is-a parent of Non-blanching rash.
- **Swollen legs** → `Leg swelling symptom` (VHA vocabulary).
- Priority level is `Urgent`, because the page says "give urgent attention". Nothing on the page
  escalates it further.

## Could not model

- **Hb < 6** (red box). The language has no unit for haemoglobin concentration (g/dL), and SNOMED
  has no confirmed Hb observable entity ("Hemoglobin" exists only as a substance). Not
  approximated. The urgent rule therefore misses a patient whose only danger sign is Hb < 6.
- **Anaemia likely** (above the box): non-pregnant woman Hb < 12, pregnant woman Hb < 11, man
  Hb < 13. This cannot be encoded for the same reason (no Hb unit), and it is outside the red box.
- **Approach section** (outside the red box): malaria likely (fever now or in the past 3 days and in
  a malaria area in the past 3 months); MCV low → iron deficiency anaemia likely; MCV normal →
  systemic disease or long-term condition likely; MCV high → macrocytic anaemia likely; postpartum
  or alcohol misuse → folate deficiency likely. These are "likely" diagnoses that Will's briefing
  would encode, but they have no element keys, so the provenance cannot cite them. The MCV results
  ("low/normal/high compared to reference range") would also need lab-result findings.
- Footnote 2 (black stools from iron tablets: refer only if black stools started before iron) is
  not modelled. A patient on iron with black stools still triggers Urgent.

## SNOMED gaps

- `Pallor` (finding): not found. Used `Pale discoloration of entire skin of body` and
  `Pale conjunctiva`.
- Pale palms: no concept found.
- `Blood in feces` / `Blood in stool` (finding): not found. Used `Hematochezia`.
- `Black stools`: not found. Used `Melena` (`Dark stools` is the alternative).
- Widespread bruising: no concept. Used `Easy bruising`; `Multiple bruising` was considered.
- Haemoglobin as an observable entity (for Hb < 6): not found, and there is no g/dL unit anyway.

## Checker issues left in place

- None.

## Questions for a clinician

1. Does "faint" in "Dizzy/faint" mean feeling faint, or also an actual faint (syncope)? Should
   `Syncope` (finding) be added?
2. Is `Pale discoloration of entire skin of body` an acceptable recorded form for "pale palms", or
   should VHA record pallor with `Pallor of skin of face` as its existing rules do?
3. Should "widespread bruising" without easy bruising (e.g. `Multiple bruising`) also trigger
   Urgent?
4. Should the urgent rule fire for black stools in a patient already taking iron (footnote 2)?
5. Can VHA record haemoglobin (g/dL), so that Hb < 6 and the "anaemia likely" thresholds can be
   encoded?
