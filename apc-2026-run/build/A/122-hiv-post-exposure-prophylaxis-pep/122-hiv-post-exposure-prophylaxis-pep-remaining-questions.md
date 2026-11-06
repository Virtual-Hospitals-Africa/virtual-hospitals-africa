# Page 122 – HIV: post-exposure prophylaxis (PEP): remaining questions

## Decisions made

- **Scope.** The page's triage logic is the red-box header ("Give urgent attention to the patient
  exposed to infectious fluid") and its two "either of" items. Everything after that (sexual
  contact / sharps / splash question, HIV status, rapid test result, the ≤ 72 hours limit, steps
  1–6) decides which PEP to give and which bloods to take, so it is management and not encoded.
- **Urgent priority** = (exposure to body fluid **or** human bite wound) **and** (exposure to any
  of the ten listed fluids **or** human bite wound with bleeding). The second question and the
  72-hour window do not gate urgency.
- **Trigger.** `Exposure to (contextual qualifier)` + `Body fluid` (substance), which subsumes all
  ten listed fluids, or `Human bite - wound`. "Exposed to infectious fluid" is not a recorded
  common symptom or warning sign; the exposure finding must be recorded for the rule to fire.
- **Human bite severe enough to cause bleeding** = `Human bite - wound` and `Bleeding`.
- **No diagnosis rules or measure tasks**: the page has no "X likely"/"consider X", and its
  measurements are laboratory tests.
- Shock / BP < 90/60 conventions: not applicable on this page.

## Could not model

- "Blood-stained fluid/tissue": no SNOMED substance; only exposure to Blood is checked. The rule
  fires **less often** than the page intends if only a blood-stained non-blood fluid is recorded.
- "≤ 72 hours since exposure", HIV status, rapid-test results, HBsAb titre ≥ 10 / < 10, source
  test results: lab values and PEP timing are management; not encoded.
- "Signs of acute HIV infection (fever, sore throat, headache)" after a negative source test:
  depends on the source's result, which the language cannot express.

## SNOMED gaps

- `Semen` (substance) does not exist → `Seminal fluid` (substance) used.
- No concept for blood-stained fluid or blood-stained tissue (substance) → not encoded separately.
- No concept for "infectious fluid" → `Body fluid` (substance) used for the trigger.

## Checker issues left in place

- None.

## Questions for a clinician

- Should urgency apply to every listed exposure, or only when there was also sexual contact,
  sharps injury or a splash (the page's second question)? This encoding marks all as Urgent.
- Should a bleeding human bite be Urgent even though the page says no HIV PEP is needed (hepatitis B
  prevention only)?
- Should the 72-hour window (and the 7/14-day hepatitis B windows) affect triage priority?
