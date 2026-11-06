# Page 86 – Itch with no rash: remaining questions

## Decisions made

- **Red box is a pointer only** ("Check if the patient needs urgent attention ⮌ 82"). No priority
  evaluation is written on this page; the element is accounted for as `cross_reference_only`.
- **Trigger** is `(clinical_finding Itching)`, cited from the page title. Itching is not a recorded
  common symptom or warning sign, so the check task fires only when itching is recorded as a finding.
- **No-rash exclusions in every diagnosis rule.** The page says to confirm there is no rash, scabies,
  lice or insect bites before its flowchart applies, so each probable rule requires `(no …)` of
  Eruption, scabies infestation, Pediculus infestation and Insect bite - wound. Routing to pages
  84, 85 and 61 is not encoded.
- **Branches follow the drawn flowchart.** Medication side-effect requires *no* very dry skin; jaundice
  requires no very dry skin **and** no new medication, plus yellow skin or scleral icterus.
- **"Very dry"** = `Severe dry skin` (disorder), a child of `Xeroderma`. The diagnosis is `Xeroderma`
  (the page's "Dry skin (xeroderma/ichthyosis)"); ichthyosis is not diagnosed separately.
- **"Medication side-effect"** = `Adverse reaction caused by drug` (disorder), already in VHA vocabulary.
- **"Yellow eyes"** = `Scleral icterus` (finding).
- No `measure` tasks: the page asks for no non-routine measurement. "Test for anaemia, HIV and
  diabetes" and "refer" are management steps.

## Could not model

- **"In the weeks before the itch started"**: the language cannot compare one finding's onset with
  another's. Any recorded new medication counts, so the medication rule fires **more often** than the
  page intends.
- **"If itch persists > 2 weeks"** leads only to tests and same-day referral (management), so no rule
  uses it. It could be expressed as `(>= (onset Itching) (time_ago 2 weeks))` if a later pass models
  referral.
- Antihistamines (severe / long-term itch), skin-care advice, palliative care and "discuss/refer" are
  management and are not encoded.

## SNOMED gaps

- `Dry skin` (finding): not found; used `Severe dry skin` (disorder) / `Xeroderma` (disorder).
- `Scabies` (disorder): not found; used `Infestation caused by Sarcoptes scabiei var hominis` (disorder).
- `Pediculosis` (disorder/finding): not found; used `Infestation caused by Pediculus` (disorder).
- `Yellow sclera` (finding): not found; used `Scleral icterus` (finding).

## Checker issues left in place

- None.

## Questions for a clinician

- Should jaundice be diagnosed from yellow skin/eyes even when the skin is very dry or a new medication
  was started? The page draws it only on the No/No branch, and the rule follows the drawing.
- Is "very dry" skin well captured by "Severe dry skin", or should any dry skin (Xeroderma) count?
- For the medication side-effect, is a generic "Adverse reaction caused by drug" preferred, or the
  more specific "Pruritus caused by drug"?
