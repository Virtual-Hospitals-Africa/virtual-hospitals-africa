# Page 20 – Anaphylaxis: remaining questions

## Decisions made

- **Q4 branch narrowed to match the page.** The hand-written rule's last `and` branch (exposure
  unknown/none, sudden-onset skin sign AND a second symptom) previously accepted abdominal pain or
  vomiting as the second symptom. The page's Q4 text lists only difficulty breathing, BP < 90/60 or
  dizziness/collapse. The rule now follows the page. Abdominal pain and vomiting remain part of the
  `any2` in the Q3 (exposed) branch, where the page does list them.
- **Drug and insect triggers added to the Q1 branch.** The page's first question covers
  "medication, food or insect bite/sting which has caused anaphylaxis before". The probable rule
  now pairs `Exposure to … Drug or medicament` with `(allergy Drug or medicament)`, and insect
  bite/sting with `(allergy Insect venom)`. Previously only the five foods were paired, which also
  left the drug allergy/exposure findings in the `check_for` unused.
- **Drug and insect exposure added to the Q2 branch** ("exposed to any medication, food or insect
  bite/sting") alongside the five foods.
- Duplicate peanut allergy/exposure lines in the `check_for` were replaced by the insect venom allergy.

## Could not model

- "In the few hours before symptoms started": exposures recorded in the current encounter are
  treated as recent. A time comparison could be added once exposure findings record an onset.
- "Repeat every 5 minutes if needed", nebuliser doses and "assess and further manage airway ↻ 14"
  are management detail beyond the rule language.

## SNOMED gaps

- None. `Insect venom` (substance) verified via the SNOMED MCP.

## Checker issues left in place

- None.

## Questions for a clinician

- Should a recorded allergy to a *specific* medication (e.g. penicillin) match the drug pair? The
  `allergy` form matches descendants of `Drug or medicament` for the causative agent only if the
  patient's allergy record uses a descendant substance; worth confirming that the allergy intake
  form records substances under that hierarchy.
