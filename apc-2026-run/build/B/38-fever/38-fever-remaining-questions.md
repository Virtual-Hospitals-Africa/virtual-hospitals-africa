# Page 38 – Fever: remaining questions

## Decisions made

- **Fever term.** Every rule's fever condition is `(or (active_condition Fever) (>= Body temperature
  38 °C))`, following the page's definition ("temperature ≥ 38°C now or in the past 3 days").
  `active_condition Fever` covers the common symptom; the temperature comparison covers a measured
  fever.
- **Shock/SBP < 80** is encoded on this page only, as an `or` of `Shock` (disorder) and systolic BP
  < 80 (decision for all pages). Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is not built into a shock definition. Its and/or
  reading is ambiguous, and SBP < 80 alone already makes the patient urgent.
- **Seizure.** "Having/just had a seizure" is the `Seizure` warning-sign finding. `Post-ictal state`
  was not added.
- **Confused** = `Acute confusion` (a warning sign). SNOMED has no plain `Confusion` finding. The
  alternative was `Clouded consciousness`.
- **Purple/red rash** = `Purpuric rash`.
- **Easy bleeding** = `Finding of tendency to bleed` (the parent of `Bleeds easily`), and **bruising** =
  `Easy bruising`.
- **Severe abdominal or back pain** = `Abdominal pain` and `Backache`, each with the `Severe (severity
  modifier)` qualifier.
- **Meningitis likely / appendicitis likely** are `probable` rules (fever and the red-box items on
  that line). The urgent rule references them through `active_condition`, following Will's pattern.
- **Appendicitis** uses the page's word (`Appendicitis`) rather than the vocabulary's `Acute
  appendicitis`.
- **Tick bite fever** = `South African tick-bite fever`, the SNOMED name closest to the page term.
  "Tick present" = `Infestation caused by Ixodidae` or `Infestation caused by Argasidae`.
- **Acute viral infection likely** (the tick question's No branch) requires the tick bite and both tick
  infestations to be recorded No, plus any of headache, body pain (`Generalized aches and pains`)
  or recent common cold (`Common cold` + `Recent`).
- **Mpox and diphtheria** are `possible` rules ("consider").
- **Two check_for tasks:** one for the red box, one for the "not needing urgent attention" approach,
  both triggered by fever.

## Could not model

- **"Or in the past 3 days"** (fever definition): a measurement cannot be compared with a time
  window. Only the current temperature counts, so the rules may fire less often than intended (a
  fever recorded only as a past measurement is missed unless the Fever finding is recorded).
- **"Not needing urgent attention", "None of the above, or previous malaria test/s negative"**: these
  sequencing preconditions are not modelled. The mpox, diphtheria, tick-bite-fever and viral rules
  can fire alongside the urgent rule (more often than intended).
- **"Unexplained" rash/lesion** (mpox): not modelled, so the rule fires more often.
- **Diphtheria: "mild" fever, "thick grey" layer, "bleeds easily if touched"**: not modelled. The
  rule requires sore throat, fever and a pseudomembrane in the nose or throat, so it fires more often.
- **Abacavir → check for AHR (131)**: a pointer to page 131. It is not encoded here.
- **Glucose < 3 (< 4 if diabetes) or ≥ 11.1 → 19** sits in the management list and is a pointer.
- **"If none of above": urine dipstick (69), TB (102), HIV (124), return/refer advice**: routing and
  management.
- **Tick bite fever box** ("May also have headache, body pain, rash or localised lymphadenopathy",
  treatment, refer/return advice): supporting features and management. Not encoded.

## SNOMED gaps

- **Having been in a malaria area in the past 3 months**: no concept (searched "malaria", "malarial",
  "travel", "endemic", "exposure"). So "consider malaria" is **not encoded**. `Exposure to
  (contextual qualifier)` + `Plasmodium` (organism) was rejected as a proxy, because exposure to the
  organism is not the same as being in an area.
- **Tick bite fever**: no concept with that name. `South African tick-bite fever` was used. The
  alternatives were `African tick bite fever` and `Spotted fever group rickettsial disease` (the
  common parent).
- **Mpox**: the SNOMED name is `Monkeypox`.
- **Diphtheria**: no plain concept. `Diphtheria caused by Corynebacterium diphtheriae` was used.
- **Confusion** (finding): absent. `Acute confusion` was used.
- **Lesion of skin/genitals/anus/rectum/mouth/eyes**: no precoordinated concept for all of them. Each
  is `Lesion` (morphologic abnormality) with a `finding_site`: Skin structure, Genital structure,
  Anal structure, Rectum structure, Oral cavity structure, Structure of eye proper. All were
  confirmed.
- **Throat**: `Pharyngeal structure`.
- **Swollen lymph nodes**: `Lymphadenopathy` (disorder).

## Checker issues left in place

- None.

## Questions for a clinician

- Does "purple/red rash" mean only a purpuric (non-blanching) rash, or any red rash with fever?
- Does "Tick bite fever" in South Africa map better to `South African tick-bite fever` (R. conorii),
  `African tick bite fever` (R. africae), or their parent `Spotted fever group rickettsial disease`?
- Should the acute-viral-infection rule require the tick question to be answered No explicitly, as
  encoded? If not, it would also fire for patients never asked about ticks.
- How should "been in a malaria area in past 3 months" be recorded so that a malaria rule can use it?
- Is footnote 1 (shock likely) meant as "any of" or "all of"?
