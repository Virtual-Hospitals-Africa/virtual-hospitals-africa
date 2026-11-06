# Where the 2026 rules' findings sit on VHA's body regions

**Date:** 2026-11-05 · **Inputs:** the 83-page APC 2026 rule set (`../RUN-REPORT.md`), VHA's 23 region lists at main `211b16110`, SNOMED CT INT 2025-12-01 · **Made by:** `tools/body_map_gaps.py` (deterministic: the same inputs give the same report)

This compares the findings our 2026 rules use with VHA's 23 body-region lists. It answers "where don't the two databases meet?" with real data. That is the question the homunculus demo's coverage view asks of invented data.

## What the region lists are

Each of VHA's 23 files in `s_expression/finding_site_findings/` gives a region:

- a SNOMED body structure;
- the structures it leaves to other regions (Head leaves out Eye, Ear, Nose, …);
- a list of findings.

The app uses them to filter the triage warning-signs page by body site. Each file is named after an APC 2023 symptom page (`30.lisp` is the headache page), so a list is the warning signs of that page. That is why "Proteinuria" appears under Face and Leg (the swelling pages), not only under Urinary.

Nurses can also search all of SNOMED by name. So a finding missing from a region list can still be recorded; it just has no place on a body map or in the body-site filter.

## Headline

The 2026 rules use **820 different findings**. Each finding was placed by the first of these tests that succeeded:

| How it was placed | Findings | Meaning |
|---|---|---|
| On a region list | 189 (23%) | The same SNOMED concept is on a list. Qualifiers are ignored; an entry with its own site only matches a finding at that site |
| By the rule's own site | 32 (4%) | The rule says where (e.g. "Pain" at glans penis → Genital) |
| A more specific kind of a listed finding | 124 (15%) | e.g. "Dry cough" is a kind of the listed "Cough" |
| By SNOMED's body site | 142 (17%) | SNOMED records where the finding is (e.g. "Easy bruising" → skin → Skin) |
| Body site spans regions | 55 (7%) | SNOMED gives a site that is a whole system, not one region (e.g. "Diabetes mellitus" → endocrine system) |
| No body site | 278 (34%) | Systemic, mental-health, history or context findings (e.g. "Shock", "Pregnancy", "Fatigue", "Planning suicide"). 13 of them are on VHA's triage warning-sign or common-symptom lists |

**So 345 findings (42%) have a place on today's region lists**, as the same concept or a more specific kind of a listed one. Another 174 (21%) belong to a region (some to several, 191 placements in all) but aren't on its list: these are the gaps. The remaining 333 (41%) have no single body region and would need a "General" area, as in the homunculus demo.

These aren't findings and weren't placed:

- 328 measurement conditions on 60 pages (temperature, BP, glucose and so on), which belong on the vitals screen;
- 140 references to diagnoses or conditions;
- 14 allergy conditions (one page).

**In the other direction**, 130 of the 498 distinct region-list items are read by no 2026 rule. This is partly scope: no red-box page in the run covers ears, hair or nails. Ear (10 of 16 unused), Hair & scalp (14 of 14) and Nail (13 of 13) account for 37 of the 130. Apart from those, Genital has the most unused items (20 of 37).

## By region

"List items" counts distinct findings (at their site, if the entry names one); the same finding listed again with other qualifiers counts once. "Missing from list" counts the 2026 findings placed in this region by a rule's own site or by SNOMED's site that aren't on its list. A finding the rules use at several sites (e.g. "Papule of skin" on the face, arms, hands, feet and genitals) counts in each region. Examples are ordered by how many pages use them; the number in brackets is pages.

| Region | List items | Read by 2026 rules | Not read | Missing from list | Examples of missing findings |
|---|---|---|---|---|---|
| Head | 30 | 27 | 3 | 14 | Watery eye [2], Ecchymosis of postauricular region, Excessive salivation, Exophthalmos, Glasgow coma scale, 3 |
| Eye | 32 | 26 | 6 | 11 | Eruption [9], Lesion of eye [5], Lesion [3], Pin point pupils [2], Conjunctivitis |
| Face | 29 | 27 | 2 | 12 | Hyperpigmentation of skin [5], Pain [4], Papule of skin [4], Ecchymosis of periorbital region, Facial swelling |
| Ear | 16 | 6 | 10 | 2 | Bleeding from ear, Hematotympanum |
| Nose | 18 | 16 | 2 | 4 | Pseudomembrane [3], Allergic rhinitis caused by pollen, Nose finding, Repetitive rubbing of body parts |
| Mouth or throat | 24 | 20 | 4 | 14 | Eruption [9], Oral lesion [5], Lesion [3], Pseudomembrane [3], Tightness in throat [2] |
| Teeth & gums | 12 | 8 | 4 | 6 | Cavity, Gingivae finding, Gingival enlargement, Gingival erythema, Staining of tooth |
| Chest | 26 | 23 | 3 | 16 | Palpitations [5], Hyperresonance [4], Tight chest [4], Cardiac arrest [2], Heart failure [2] |
| Breast | 12 | 6 | 6 | 3 | Breast finding, Breast normal, Tenderness of breast |
| Abdomen | 32 | 29 | 3 | 5 | Abdominal colic [4], Abnormal frequency of defecation, Penetrating wound of abdomen, Peritonitis, Tenderness of right lower quadrant of abdomen |
| Anal & rectal | 18 | 10 | 8 | 9 | Lesion of rectum [5], Lesion [3], Anal finding, Bleeding from anus, Discharge from anus |
| Genital | 37 | 17 | 20 | 30 | Eruption [9], Lesion of genitalia [5], Pain [4], Papule of skin [4], Burrows in skin [3] |
| Urinary | 20 | 18 | 2 | 6 | Anuria, Chronic kidney disease stage 5, Disorder of urinary system, Renal impairment, Urinary catheter in situ |
| Joint | 12 | 11 | 1 | 2 | Burn [2], Dislocation of joint |
| Back | 21 | 18 | 3 | 0 |  |
| Neck | 16 | 15 | 1 | 3 | Plain X-ray of cervical spine abnormal, Tenderness, Thyroid gland moves with swallowing |
| Arm | 16 | 11 | 5 | 8 | Papule of skin [4], Burrows in skin [3], Burn of upper limb, Finding of upper limb, Injury of upper extremity |
| Hand | 15 | 9 | 6 | 6 | Papule of skin [4], Burrows in skin [3], Burn of hand, Joint catching, Locking of joint |
| Leg | 28 | 23 | 5 | 10 | Leg swelling symptom [6], Hyperpigmentation of skin [5], Muscle pain [5], Swelling of lower limb [4], Gangrenous disorder [3] |
| Foot | 23 | 18 | 5 | 4 | Papule of skin [4], Fissure in skin [2], Weak arterial pulse [2], Finding of foot region |
| Skin | 34 | 30 | 4 | 26 | Decreased skin turgor [8], Sweating [6], Easy bruising [4], Mass of skin [3], Xeroderma [3] |
| Hair & scalp | 14 | 0 | 14 | 0 | (no red-box page in the run) |
| Nail | 13 | 0 | 13 | 0 | (no red-box page in the run) |

"Read by 2026 rules" counts items a rule uses directly or through a more specific kind.

## No single body region

The 333 findings with no single region are where a body map stops helping. The most used:

| No body site in SNOMED (pages) | Site is a whole system (pages) |
|---|---|
| Shock (19) | Diabetes mellitus: endocrine system (14) |
| Drug or medicament (14) | Insect sting: skin and/or mucous membrane (10) |
| Pregnancy (14) | Muscle weakness: skeletal muscle (7) |
| Fatigue (13) | Lymphadenopathy: lymphatic system (5) |
| Insect bite: wound (11) | Pulse irregular: cardiovascular system (5) |
| Asthenia (10) | Stridor: upper respiratory tract (3) |
| Traumatic injury (9) | Unable to break wind: gastrointestinal tract (3) |
| Feeling agitated, Restlessness (7 each) | Post-ictal state: nervous system (2) |

Many are mental-health, social or history findings ("Planning suicide", "Difficulty coping", "History of anaphylaxis"). They belong to questions the nurse asks, not to a place on the body.

## What this means

1. **For VHA's region lists.** 174 findings the 2026 rules need belong to a region but aren't on its list. The largest gaps are Genital (30), Skin (26), Chest (16), Head (14) and Mouth or throat (14). If the body-site filter should offer everything the rules read, these are the candidates, one region at a time. Each needs a clinician to confirm the placement.
2. **For a body-map exam (the homunculus idea).** A body map can carry about 60% of what the rules read: the 345 already listed plus the 174 placeable gaps. The other 40% needs a General area, organised by topic (mental health, pregnancy and history, systemic signs) rather than by anatomy. The demo's "General strip" idea is right, but in real data it is a third of the content, not six items.
3. **Unused list items.** The 130 items no 2026 rule reads are worth a look. Some reflect the run's scope (ears, hair, nails). Others may be warning signs the 2026 pages dropped or moved, which the edition comparison in the review pages can confirm.

## Limits

- **Automatic placement, not reviewed.** Some placements will be wrong or arguable. SNOMED sites "Smell of alcohol on breath" in the mouth, so it lands under Teeth & gums.
- **Qualifiers are ignored.** "Headache, sudden onset" counts as "Headache".
- **Scope is the 83 red-box pages.** Findings on other 2026 pages aren't counted.
- **"More specific kind" uses is-a only, in one direction.** A finding broader than a listed one (e.g. "Pain" with no site) isn't placed by it.
- **SNOMED's body sites are the international release's inferred ones.** A finding with sites in two regions counts as "spans".

## Files

- `findings.csv`: every one of the 820 findings, with pages, roles, how it was placed, the region, and the evidence ("via").
- `gaps.json`: summary counts and, per region, which list items are read, read through a more specific kind, unread, and missing.
- `../tools/body_map_gaps.py`: the tool. Rerun it with `python -I tools/body_map_gaps.py . <VHA clone>`.
