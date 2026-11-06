# Page 88 – Drug rash: flowchart

Source: `inputs/2026/p88.png` (APC 2026, page 88). Red box 1 (urgent markers of severity), the
"Approach to the patient with a drug rash not needing urgent attention" algorithm, and red box 2.

```mermaid
flowchart TD
    SUSPECT["Suspect a drug rash: generalised rash which appeared<br/>within 3 months of starting a new medication"]
    SUSPECT --> RB1{"Drug rash and any marker of severity?<br/>Face/tongue swelling · difficulty breathing · Shock¹/SBP &lt; 80 ·<br/>temperature ≥ 38°C · abdominal pain · vomiting/diarrhoea ·<br/>involves mouth/eyes/genitals · blisters/peeling/raw areas ·<br/>jaundice · unwell/malaise/fatigue/body pain"}
    RB1 -- Yes --> URG["Give urgent attention. Manage and refer urgently (red box 1)"]
    RB1 -- No --> Q1{"Is patient on ART, TB medication,<br/>co-trimoxazole or TPT?"}
    Q1 -- Yes --> YES["Refer/discuss with MIC hotline (200). If on ART: continue unless abacavir<br/>and AHR likely (131); nevirapine/efavirenz → doctor switches ART (132).<br/>Chlorphenamine if itch. Check ALT and eosinophil count.<br/>Advise to return urgently if rash worsens or markers of severity occur."]
    YES --> REV["Review patient and result within 24 hours"]
    REV --> UNWELL{"Patient unwell or markers of severity²?"}
    UNWELL -- Yes --> RB2["Stop all medication. Give urgent attention as above (red box 2)"]
    UNWELL -- "No (well, no markers)" --> LAB{"ALT or eosinophil count raised<br/>(as reported by the laboratory)?"}
    LAB -- Raised --> MIC["Discuss with MIC hotline/specialist"]
    LAB -- "Both not raised" --> ADV["Advise to return urgently if markers of severity² occur.<br/>Return if rash persists ≥ 2 weeks: discuss/refer."]
    Q1 -- No --> NO["Discuss with doctor whether to stop or change medication.<br/>Chlorphenamine if itchy. If extensive, refer."]
    NO --> FDE{"Dark coloured round flat spots anywhere on body<br/>following ingestion of a medication<br/>(often start as itchy patches with red edges)?"}
    FDE -- Yes --> FDEL["Fixed drug eruption likely: hydrocortisone 1%"]
    NO --> ADV
```

¹ If SBP < 80, pulse ≥ 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely.
² Markers of severity: face/tongue swelling, difficulty breathing, BP < 90/60, temperature ≥ 38°C,
abdominal pain, vomiting/diarrhoea, involves mouth/eyes/genitals, blisters/peeling/raw areas,
jaundice, unwell/malaise/fatigue/body pain.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Suspect a drug rash | Generalised rash **and** exposure to a drug or medicament whose onset is within the last 3 months; or a recorded drug eruption | `Diagnose possible drug rash` → triggers `Check for drug rash markers of severity` |
| Red box 1 (and red box 2 "unwell or markers of severity²") | Drug eruption (recorded, or possible diagnosis) **and** any marker of severity; BP < 90/60 from footnote 2 added | `Urgent: drug rash with markers of severity` |
| Q1 (ART, TB medication, co-trimoxazole, TPT?) | Not modelled: routes management only | — |
| Review within 24 hours; ALT/eosinophil count | Not modelled: lab values have no representation; routes management only | — |
| Fixed drug eruption likely | Hyperpigmentation of skin **and** macule of skin **and** exposure to a drug or medicament | `Diagnose probable fixed drug eruption` |
| Management boxes (stop medication, chlorphenamine, hydrocortisone, sodium chloride, refer) | Not modelled (no `manage` tasks in this pass) | — |

## Notes

- "Within 3 months of starting a new medication" is approximated as the onset of the drug
  exposure finding being within the last 3 months (`<=`), not as the interval between the drug
  start and rash onset.
- The fixed drug eruption statement sits in the "No" branch (not on ART/TB medication/
  co-trimoxazole/TPT). That branch condition is not encoded, so the rule can also fire for patients
  on those medicines.
