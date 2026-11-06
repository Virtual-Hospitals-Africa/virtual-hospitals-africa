# Page 55 – Breast symptoms: flowchart

```mermaid
flowchart TD
  A[Breast symptoms] --> RB{"Temperature ≥ 38°C or body pain<br/>AND painful lump in breast/s<br/>(may be fluctuant)?"}
  RB -- Yes --> ABS["Breast abscess likely<br/>URGENT: paracetamol, tramadol, refer for I&D"]
  RB -- No --> WS{"Warning signs?<br/>skin changes; breast lump with risk feature;<br/>axillary lump with feature; nipple discharge/retraction with feature"}
  WS -- Yes --> REF[Refer to breast clinic same week]
  WS -- No --> BF{Is the patient breastfeeding?}
  BF -- "Painful/cracked nipples" --> NIP["Usually poor latching<br/>(management advice)"]
  BF -- "Painful breast/s ± lump/s" --> T{"Temperature ≥ 38°C or body pain?"}
  T -- Yes --> MAS[Mastitis likely]
  T -- No --> ENG[Engorgement/blocked duct likely]
  NIP --> HIV[HIV-specific feeding advice; refer to lactation support]
  MAS --> HIV
  BF -- No --> NR[Symptoms not related to breastfeeding]
  NR --> AX[Axillary lump/s: ask other symptoms, review 2-4 weeks]
  NR --> EN[Breast enlargement: one-sided → refer; review medication]
  NR --> LU["Breast lump/s: re-examine day 7 of cycle;<br/>persists → refer by age (< 25: 60 days, > 25: 21 days)"]
  NR --> PB["Painful breast/s: check pregnancy;<br/>breast exam normal → mastalgia likely"]
  NR --> ND[Nipple discharge: pregnancy, medication review, refer if uncertain]
```

## Decision nodes

| Node | Page wording | Rule |
|---|---|---|
| RB | "breast symptoms and temperature ≥ 38°C or body pain with painful lump in breast/s which may be fluctuant: breast abscess likely" | `Diagnose probable breast abscess`; `Urgent: breast symptoms with likely breast abscess`; task `Check for breast symptom conditions` |
| WS | Warning signs → refer same week | Not encoded (referral criteria, no named diagnosis); see remaining questions |
| BF | "Is the patient breastfeeding?" | `Mother currently breastfeeding` in the check_for task |
| T = Yes | "Yes. Mastitis likely" | `Diagnose probable mastitis in a breastfeeding patient` |
| T = No | "No. Engorgement/blocked duct likely" | `Diagnose probable breast engorgement in a breastfeeding patient`; `Diagnose probable blocked milk duct in a breastfeeding patient` |
| NIP | "Usually due to poor latching" | Not encoded (no "likely" diagnosis; management) |
| PB | "If breast exam normal, mastalgia likely" | Not encoded (see Could not model) |
| AX, EN, LU, ND | Management and referral | Not encoded (management) |
