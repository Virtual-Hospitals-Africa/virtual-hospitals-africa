# Page 38 – Fever: remaining questions

## Decisions made

- **Trigger.** Both tasks are anchored to `(active_condition Fever)`, the recorded common symptom.
- **Fever definition.** "A patient with a fever has a temperature ≥ 38°C now or in the past 3 days"
  is encoded as a `probable` Fever rule on body temperature ≥ 38 °C, so a measured temperature
  reaches this page. "In the past 3 days" is not modelled (see Could not model).
- **Shock.** "Shock/systolic BP < 80" is encoded exactly as this page writes it: `Shock` (disorder)
  **or** systolic BP < 80 mmHg. Footnote 1 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is not built into a shared shock definition; its
  combinator (any? all?) is unclear.
- **Seizure.** "Having/just had a seizure" → `Seizure` or `Post-ictal state`.
- **Meningitis likely** → `probable Meningitis` from fever plus any of stiff neck, drowsy, acute
  confusion, purpuric rash; the priority rule uses `(active_condition Meningitis)`.
- **Appendicitis likely** → `probable Appendicitis` from fever plus right lower quadrant tenderness.
- **Severe abdominal or back pain** → `Abdominal pain` / `Backache` with the `Severe` qualifier.
- **Easy bleeding or bruising** → `Finding of tendency to bleed` / `Easy bruising` (vocabulary terms).
- **Mpox** ("consider") → `possible Monkeypox`: fever **and** a rash/lesion at any listed site **and**
  any of the listed symptoms or temperature > 38.5 °C.
- **Diphtheria** ("consider") → `possible Diphtheria caused by Corynebacterium diphtheriae`: fever
  **and** sore throat **and** pseudomembrane in pharynx or nasal cavity.
- **Tick bite fever likely** → `probable Spotted fever group rickettsial disease` from fever and
  tick bite or tick present (see SNOMED gaps).
- **Acute viral infection likely** (tick question = No) → `probable Acute viral disease`: fever,
  no tick bite, no tick, and any of headache, body pain, common cold.
- **Not encoded (management / routing):** the "Manage and refer urgently" list, tick removal and
  antibiotics, urine dipstick (69), TB (102), HIV (124), return advice, abacavir pointer (131).

## Could not model

- "Now or in the past 3 days" for temperature ≥ 38 °C: only the current measurement is used. The
  probable Fever rule fires less often than the page intends (a fever 2 days ago, normal now, is
  missed unless Fever is recorded as a symptom).
- "Unexplained" rash/lesion (mpox): not representable; the possible rule fires more often.
- "Mild" fever (diphtheria): severity of fever not encoded; fires more often.
- "Bleeds easily if touched" (pseudomembrane): descriptive, not required; fires more often.
- "Recent" common cold: no time window on the page; any recorded common cold counts.
- "If none of the above, or previous malaria test/s negative": the tick and viral rules do not
  require the absence of possible mpox/diphtheria, and negative malaria tests are lab results the
  language cannot express. These rules may fire alongside a possible mpox/diphtheria diagnosis.
- Footnote 1 shock criteria (see Decisions made).

## SNOMED gaps

- **Malaria area in past 3 months:** no concept for travel to / residence in a malaria area
  (searched "travel", "malaria", "endemic", "exposure malaria"). "Consider malaria → 39" is not
  encoded; page 39 is expected to cover it.
- **Tick bite fever:** no "Tick bite fever" FSN. Used the parent `Spotted fever group rickettsial
  disease` of `African tick bite fever` and `South African tick-bite fever`.
- **Tick present:** no general "tick infestation" FSN; used `Infestation caused by Ixodidae` (hard ticks).
- **Mpox:** FSN is `Monkeypox`. **Diphtheria:** FSN is `Diphtheria caused by Corynebacterium diphtheriae`.
- **Anal lesion:** no precoordinated concept; `Lesion` (morphologic abnormality) with finding site
  `Anal structure`.
- **Throat:** no "Throat structure"; used `Pharyngeal structure`. Nose → `Nasal cavity structure`.
- **Swollen lymph nodes** → `Lymphadenopathy` (no "Swollen lymph node" FSN).
- **Body pain** → `Generalized aches and pains`.

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Spotted fever group rickettsial disease` acceptable for "tick bite fever", or should one of
  African tick bite fever / South African tick-bite fever be used?
- Should "confused" be `Acute confusion` or `Confusional state`? Should "purple/red rash" also
  include petechiae?
- Should footnote 1 (SBP < 80, pulse ≥ 100, RR > 30, confusion/restlessness, weakness) define
  "shock likely" on this page, and with what combinator?
- Should the acute viral infection rule also require the absence of the mpox/diphtheria features?
