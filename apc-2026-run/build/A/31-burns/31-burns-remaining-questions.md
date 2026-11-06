# Page 31 – Burns: remaining questions

The page has no flowchart or Yes/No branches (one red box plus a % TBSA figure), so there is no
flowchart file.

## Decisions made

- **Presenting complaint** is `(clinical_finding (snomed_concept "Burn" "disorder"))`, the "Burn
  Other" warning-sign anchor. All site/type burns are descendants of it.
- **Priority is `Urgent`** as the red box says, although several of these findings are existing
  warning signs at a higher level (Burn of face: Emergency; Chemical burn, circumferential burn:
  Very urgent). The warning signs keep their own levels; this rule does not escalate.
- **Shock/systolic BP < 80** is encoded as the page writes it: `(or Shock (SBP < 80))`. The
  footnote ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness,
  shock likely") is not built into a separate shock rule, per the run-wide decision; it is also
  unclear whether it means any one or all of these.
- **Drowsy or confused** → `Drowsy` or `Acute confusion` (the confusion warning-sign anchor).
- **Circumferential burn of chest/limbs** → `Burn of chest wall`, `Burn of upper limb`, `Burn of
  lower limb`, each with the `Circumferential` qualifier. The warning-sign form (Burn +
  Circumferential, no site) is broader than the page and would **not** match these rules.
- **Burn to joint**: no precoordinated concept; `Burn` with `finding_site Joint structure`.
- **Inhalation injury likely** → a `probable` rule for `Injury to respiratory system due to inhaled
  substance` (Burn AND any of burn of face, burn of neck, difficulty breathing, hoarse, stridor),
  referenced from the priority rule as `active_condition`. Its SNOMED children include `Inhalation
  burn due to hot gas` and `Smoke inhalation injury`, so a directly recorded inhalation burn also
  counts.
- **Other injury** → `Traumatic injury` excluding `Burn`. `Burn` is_a `Traumatic injury`, so the
  plain concept would make every burn urgent.
- **Partial thickness burn > 10% TBSA** → `Partial thickness burn` AND any of the SNOMED
  any-degree extent bands from 10–19% up to ≥ 90%. See Could not model.
- **"Consider abuse 33 and self-harm 34"** (outside the box) → two `possible` rules, triggered only
  by `Cigarette burn`.

## Could not model

- **% TBSA as a number.** There is no observable for "% TBSA burnt" with a `%` unit (`Body surface
  area` is in m²), so neither "> 10% TBSA" nor the figure can be measured, and no `measure` task
  was written. The closest approximation, the SNOMED extent bands, starts at 10–19%: a burn of
  exactly 10% would fire although the page says > 10% (**slightly more often**). The bands are
  "any degree", so a patient with a small partial-thickness area inside a larger mixed burn ≥ 10%
  would also fire (**more often**); if the health worker records extent without a band concept the
  criterion does not fire (**less often**).
- **Abuse/self-harm cues**: "burn with specific shape (iron, grid, knife/fork, car cigarette
  lighter, light bulb)", "repeated/unexplained burns" and "other unexplained injuries" have no
  concept or language form; only cigarette burns trigger the possible rules (**less often**).
- Management (cooling, fluids by Parkland-style formula, IV lines, catheter, analgesia, dressings,
  tetanus, monitoring, review and referral of infected burns) is out of scope.

## SNOMED gaps

- `Black sputum` (finding): not found (sputum colours exist for gray, brown, rusty, green etc.).
  Not encoded; the inhalation-injury rule misses a patient whose only sign is black sputum.
- `Burn of joint` (disorder): not found; used `Burn` + `finding_site Joint structure`.
- `Inhalation injury` (disorder): not found; used `Injury to respiratory system due to inhaled substance`.
- No observable for % TBSA burnt (see above).

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Partial thickness burn` + extent band an acceptable stand-in for "partial thickness > 10%
  TBSA", or should VHA add a % TBSA observable so the figure can be recorded and compared?
- Should "Other injury" exclude only burns (as encoded), or also the inhalation injury?
- Should the inhalation-injury signs require the patient to have a burn (as encoded), given the
  page is about patients with burns?
- Should "Drowsy or confused" also accept the AVPU "Confused"/"Reacts to voice" vitals forms?
