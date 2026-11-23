# Page 31 – Burns: remaining questions

No flowchart file: the page has a red box and an "approach" list, with no Yes/No branches or multi-step algorithm.

## Decisions made

- **Trigger.** `(clinical_finding Burn)` (the "Burn Other" warning-sign form). Recorded burn warning signs (facial, chemical, circumferential) are descendants, so they trigger the check too.
- **Priority level.** `Urgent`, because the page says "Give urgent attention". Several of the same burns carry Emergency or Very urgent as warning signs (facial, inhalation, chemical, circumferential). Those still apply through `warning_signs.ts`; this page does not escalate them.
- **Shock.** Encoded as the page writes it: `(or (clinical_finding Shock) (< SBP 80))` (the decision for all pages). Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely") is not built into a probable-shock rule. It is a general shock definition, and it does not say whether one sign or all of them are needed.
- **Inhalation injury likely.** This is a `probable` rule for "Injury to respiratory system due to inhaled substance" (the parent of smoke and hot-gas inhalation injury): Burn AND any of face burn, neck burn, difficulty breathing, hoarse, stridor or black sputum. The priority rule uses `(active_condition …)` for it.
- **Circumferential burn of chest/limbs.** Encoded as Burn of chest wall, Burn of upper limb or Burn of lower limb, each with the `Circumferential` qualifier. This follows the page's site restriction. The broader warning-sign form `Burn + Circumferential` (no site) does not match these.
- **Drowsy or confused.** Drowsy (finding) or Clouded consciousness (finding), VHA's usual form for confusion.
- **Burn to joint.** `Burn` with `finding_site Joint structure`, because there is no precoordinated "Burn of joint".
- **Consider abuse / self-harm.** These are two `possible` rules, Victim of abuse and Self-injurious behavior, triggered by Cigarette burn, the only cue with a concept.

- **Other injury.** `Traumatic injury` excluding `Burn` (taken from build A at reconciliation). `Burn` is_a `Traumatic injury`, so the plain concept would make every burn urgent; `excluding` removes burn records, so a separately recorded non-burn injury matches.
- **Drowsy or confused, AVPU.** `Clouded consciousness` subsumes `Acute confusion` (the Confusion warning sign), so both the warning-sign and AVPU "Confused" forms match.

## Could not model

- **"> 10% TBSA".** The language has no % TBSA observable ("Body surface area" is in m²), so there is no `measure` task for "Calculate the % TBSA". Instead, the rule requires Partial thickness burn AND one of SNOMED's "Burn any degree involving N percent of body surface" bands from 10-19 % upward (or "Over 70 percent body burnt"). The 10-19 band includes exactly 10 %, so the rule fires at 10 %, where the page says > 10 %, which is slightly **more often** than the page intends. The bands also count burns of any degree. The page's figure excludes simple redness, so that is close to partial-plus-full thickness.
- **Abuse cues** "burn with specific shape (iron, grid, …)" and "repeated/unexplained burns/other unexplained injuries" have no concepts. The abuse and self-harm rules fire **less often** than the page intends.
- Everything under "Manage and refer urgently", the % TBSA figure, and the non-urgent approach list (including the signs of infection used for review and referral) are management or figure content.

## SNOMED gaps

- "Other injury" (an injury other than the burn): no concept. Substitute: `Traumatic injury` excluding `Burn`.
- "Black sputum": no concept. Substitute: `Finding of color of sputum` + qualifier `Black color`.
- "Burn of joint": no concept. Substitute: `Burn` + `finding_site Joint structure`.
- "% TBSA burnt" observable: none. Substitute: the SNOMED percentage-band disorders (see above).
- Burn with a specific shape, repeated or unexplained burns: no concept. Not encoded.

## Checker issues left in place

- None.

## Questions for a clinician

- Should the inhalation-injury signs require the patient to have a burn (as encoded), given the page is about patients with burns?

- Is the band approach for "> 10 % TBSA" acceptable? It counts exactly 10 % and burns of any depth. Would you prefer a % TBSA observable to be added to the language?
- "Other injury" is encoded as Traumatic injury excluding Burn. Should it also exclude inhalation injury (Injury to respiratory system due to inhaled substance), which is a separate criterion on this page? Is a separate trauma finding (page 30) the intended record?
- Should the warning-sign `Burn + Circumferential` (no site) count here as well? It is broader than "chest/limbs".
- Should a directly recorded "Inhalation burn due to hot gas" warning sign also count as "inhalation injury likely"? This page lists only the clinical signs.
- Should footnote 1's signs (pulse ≥ 100, RR > 30, confusion/restlessness, weakness) define shock on this page, and with "any" or "all" logic?
