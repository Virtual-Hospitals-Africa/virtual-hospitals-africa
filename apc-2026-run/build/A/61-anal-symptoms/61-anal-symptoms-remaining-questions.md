# Page 61 – Anal symptoms: remaining questions

## Decisions made

- **Trigger** is `(clinical_finding "Anal finding")`, the general SNOMED finding for anal symptoms
  (Anal pain and Pruritus ani are descendants and match). "Anal symptoms" is not a recorded common
  symptom or warning sign. Note that `Perianal lump` is **not** a descendant of `Anal finding`
  (it sits under Perineal finding), so a patient recorded only with a perianal lump does not trigger
  the check task.
- **Red box → `Urgent`** ("refer same day"): anal finding **and** (perianal lump with severe anal
  pain **or** does not defecate). No escalation beyond Urgent; the page gives none.
- **"Extremely painful lump on anus"** = `Perianal lump` **and** `Anal pain` + `Severe (severity
  modifier)`. "Extremely" is read as severe.
- **"Unable to pass stool because of anal symptoms"** = `Does not defecate` (finding, under
  "Finding related to ability to defecate"). The causal "because of anal symptoms" is expressed
  only by the `and` with the anal-symptom trigger.
- **Sexually transmitted proctitis**: "treat for" encoded as `probable` (as the gold page does for
  "Treat for anaphylaxis"), with `Infective proctitis` as the closest concept. Evidence: anal
  finding and any of painless rectal bleeding, mucus in stool, tenesmus. Not gated on anal sex:
  the page's sentence starts afresh after "If patient has anal sex, … treat partner 62."
- **Pinworm likely** = `Worms in stool` **and** `Pruritus ani` qualified `Night time` → probable
  `Enterobiasis`. The worm's appearance is dropped.
- The examination branches (crack/s, lump/pile, red/raw skin, ulcer/wart) lead only to management
  and referral, so they are not encoded. Cross-references 58, 60, 62, 65, 68 and 44 are pointers.
- Pain management (paracetamol, morphine) and referral criteria are management steps.

## Could not model

- **Tapeworm likely** ("Is worm flat and white with worm segments (blunt ended)? Yes"): no SNOMED
  finding describes the worm's shape or segments, so the probable tapeworm (`Cestode infection`)
  rule is not written. Encoding it from `Worms in stool` alone would fire for every worm.
- **Worm shape in the pinworm rule** ("thin and white", and the No answer to the tapeworm question):
  dropped, so the pinworm rule fires somewhat more often than the page intends (any worm seen plus
  night-time anal itch).
- **"Worse at night"** is approximated as itch qualified `Night time` (occurring at night).
- **Anaemia likely (Hb < 12 woman / < 13 man)**: Hb has no unit or observable in the language. Not
  encoded; anaemia is diagnosed on page 44.
- "Not needing urgent attention" (the approach applies only after the red box is negative) cannot be
  expressed; the proctitis and pinworm rules fire regardless of the urgent screen.

## SNOMED gaps

- No concept for "sexually transmitted proctitis"; used `Infective proctitis` (disorder). The
  gonococcal/chlamydial rectal infection concepts exist but are not descendants of it.
- No finding for a flat/segmented worm or a thin white worm (tapeworm/pinworm discriminators).
- No "anal symptom" concept; used `Anal finding`.
- No "unable to pass stool" / "unable to defecate" concept; used `Does not defecate`.
- No "itching of anus" finding; used `Pruritus ani` (disorder), which carries the synonym "anal itch".

## Checker issues left in place

- None.

## Questions for a clinician

- Should the sexually transmitted proctitis rule require a history of anal sex (`Anal penetration`
  finding), or apply to every patient with painless bleeding, mucus or tenesmus as written?
- Is `Does not defecate` an acceptable recording of "unable to pass stool because of anal symptoms",
  or should a thrombosed/prolapsed haemorrhoid concept be part of the urgent screen?
- Should a perianal lump alone (without another anal finding) trigger the check task? That would need
  `Perianal lump` in the trigger and so could not also be in its `check_for`.
