# Page 130 – HIV: Routine care (cont. 5): flowchart

Source: `inputs/2026/p130.png` (STEP 4. Check if there is a reason to delay ART). APC 2026.

```mermaid
flowchart TD
    RB["Red box: If any of the following danger signs, delay starting ART and refer same day:<br/>RR ≥ 30 · Breathlessness at rest or while talking · Unable to walk unaided · Drowsy/confused · Seizures<br/>Pulse rate ≥ 120 · Coughs up ≥ 1 tablespoon of fresh blood · Aggressive or agitated · Neck stiffness<br/>New sudden weakness/numbness or visual disturbance"]
    RB --> Q1["Is patient known with TB¹?"]
    Q1 -- No --> Q2["Does patient have cough, weight loss, night sweats, fever,<br/>chest pain or blood-stained sputum?"]
    Q1 -- Yes --> Q3["Known with TB meningitis or brain tuberculoma?"]
    Q2 -- Yes --> EXTB["Exclude TB (p102). Plan to start ART within 1 week once TB excluded."]
    Q2 -- No --> Q4["Is patient known with cryptococcal meningitis¹?"]
    Q4 -- Yes --> CM["Start ART after 4-6 weeks of meningitis treatment."]
    Q4 -- No --> Q5["Is CD4 result available?"]
    Q5 -- No --> Q6
    Q5 -- Yes --> Q7["If CD4 < 200, check cryptococcal antigen (CrAg) result."]
    Q7 -- "CrAg not done (CD4 ≥ 200)" --> Q6
    Q7 -- "CrAg negative" --> Q6
    Q7 -- "CrAg positive" --> LP["Delay ART and refer for LP. If symptomatic (headache, confusion,<br/>blurred/double vision, neck stiffness) or pregnant, refer urgently.<br/>If no cryptococcal meningitis on LP and no symptoms, start ART same day."]
    Q6["Does patient have jaundice, signs of meningitis (severe headache with neck<br/>stiffness/vomiting), or signs of other acute illness (pneumonia or PJP)?"]
    Q6 -- No --> SAME["Start ART same day. Follow-up blood results when available."]
    Q6 -- Yes --> DELAY["Jaundice: check ALT/bilirubin (p127). Signs of meningitis: refer urgently.<br/>Other severe acute illness: treat 1-2 weeks before ART. If unsure, discuss (p200)."]
    Q3 -- Yes --> TBM["Start ART after 4-8 weeks of TB treatment."]
    Q3 -- No --> Q8["Does patient have any of: CD4 < 50 · RR-TB · Pregnant/breastfeeding?"]
    Q8 -- No --> TB8["Start ART after 8 weeks of TB treatment."]
    Q8 -- Yes --> TB2["DS-TB and CD4 < 50 / RR-TB / pregnant or breastfeeding: start ART within / after 2 weeks of TB treatment."]
    SAME --> S5["STEP 5. Dose ART correctly according to chart (p131)"]
```

¹ If patient has TB and cryptococcal meningitis, discuss with experienced ART clinician or HIV hotline about when to start ART.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box (danger signs) | Known HIV infection **and** any of RR ≥ 30, pulse ≥ 120, dyspnoea at rest / unable to complete a sentence, unable to walk / dependent for walking, drowsy, acute confusion / clouded consciousness, seizure, haemoptysis, aggressive behaviour, feeling agitated, stiff neck, sudden-onset muscle weakness / numbness / visual disturbance | `Check for HIV: danger signs before starting ART`; `Urgent: HIV danger signs before starting ART` |
| Q1 = No → Q2 = Yes → "Exclude TB" | Known HIV **and** not known with TB **and** any of cough, weight decreased, night sweats, fever, chest pain, bloodstained sputum → `possible` Tuberculosis | `Check for HIV: TB symptoms and signs of meningitis before starting ART`; `Diagnose possible TB in HIV patient before starting ART` |
| Q6: signs of meningitis → "refer urgently" | Known HIV **and** severe headache **and** (stiff neck or vomiting) → Urgent | `Urgent: HIV with signs of meningitis before starting ART` |
| Q1 = Yes, Q3, Q8 (ART timing in known TB) | ART timing only (management) | not encoded |
| Q4 (known cryptococcal meningitis) | ART timing only (management) | not encoded |
| Q5, Q7 (CD4, CrAg) | Lab results have no observable/unit in the language | not encoded (Could not model) |
| CrAg positive and symptomatic → refer urgently | Depends on CrAg result (lab) | not encoded (Could not model) |
| Q6: jaundice, pneumonia/PJP | Lead only to management (ALT/bilirubin, treat illness, delay ART) | not encoded |

## Notes

- The red box and the meningitis rule are not gated on the patient not yet being on ART: the
  language has no "about to start ART" state. See remaining-questions.
- The meningitis priority is not gated on the earlier flowchart branches (no known TB, no TB
  symptoms, CrAg not positive); see remaining-questions.
