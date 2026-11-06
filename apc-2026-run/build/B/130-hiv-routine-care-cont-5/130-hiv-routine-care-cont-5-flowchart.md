# Page 130 – HIV: Routine care (cont. 5): flowchart

Source: APC 2026 e-book, page 130 (STEP 4. Check if there is a reason to delay ART).

```mermaid
flowchart TD
    RB["Red box: any danger sign?<br/>RR ≥ 30 · breathless at rest/while talking · unable to walk unaided ·<br/>drowsy/confused · seizures · pulse ≥ 120 · coughs up ≥ 1 tablespoon fresh blood ·<br/>aggressive/agitated · neck stiffness · new sudden weakness/numbness/visual disturbance"]
    RB -- Yes --> DELAY["Delay starting ART and refer same day"]
    RB -- No --> Q1["Is patient known with TB¹?"]
    Q1 -- No --> Q2["Cough, weight loss, night sweats, fever,<br/>chest pain or blood-stained sputum?"]
    Q2 -- Yes --> EXTB["Exclude TB ↻102.<br/>Plan to start ART within 1 week once TB excluded."]
    Q2 -- No --> Q3["Is patient known with cryptococcal meningitis¹?"]
    Q3 -- Yes --> CM["Start ART after 4-6 weeks of meningitis treatment"]
    Q3 -- No --> Q4["Is CD4 result available?"]
    Q4 -- Yes --> CRAG["If CD4 &lt; 200, check CrAg result"]
    CRAG -- "CrAg not done (CD4 ≥ 200)" --> Q5
    CRAG -- "CrAg negative" --> Q5
    CRAG -- "CrAg positive" --> LP["Delay ART, refer for LP. If symptomatic or pregnant, refer urgently.<br/>If no cryptococcal meningitis on LP and no symptoms, start ART same day."]
    Q4 -- No --> Q5["Jaundice, signs of meningitis (severe headache with neck stiffness/vomiting),<br/>or other acute illness (pneumonia or PJP)?"]
    Q5 -- No --> SAME["Start ART same day. Follow up blood results."]
    Q5 -- Yes --> ACUTE["If jaundice: ALT/bilirubin ↻127. If meningitis: refer urgently.<br/>Other severe acute illness: treat 1-2 weeks first. If unsure, discuss ↻200."]
    Q1 -- Yes --> Q6["Known with TB meningitis or brain tuberculoma?"]
    Q6 -- Yes --> TBM["Start ART after 4-8 weeks of TB treatment"]
    Q6 -- No --> Q7["Any of: CD4 &lt; 50 · RR-TB · pregnant/breastfeeding?"]
    Q7 -- No --> TB8["Start ART after 8 weeks of TB treatment"]
    Q7 -- Yes --> TB2["DS-TB + CD4 &lt; 50: within 2 weeks · RR-TB: after 2 weeks ·<br/>pregnant/breastfeeding: within 2 weeks"]
```

¹ If patient has TB and cryptococcal meningitis, discuss with experienced ART clinician or HIV hotline about when to start ART.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Red box | HIV infection **and** any of the ten danger signs (RR ≥ 30 and pulse ≥ 120 as vitals; the rest as findings) | `Check for danger signs before starting ART`, `Urgent: HIV danger signs before starting ART` |
| Q1 (known with TB?) | `(clinical_finding Tuberculosis (qualifier Known present))`, checked for; Q1 = No is `(no …)` | `Check for TB before starting ART`, `Diagnose possible TB before starting ART` |
| Q1 = No → Q2 = Yes → "Exclude TB" | HIV **and** not known TB **and** any of cough, weight decreased, night sweats, fever, chest pain, bloodstained sputum → `possible` TB | `Diagnose possible TB before starting ART` |
| Q3 (known cryptococcal meningitis) | Only leads to ART timing (management) | not encoded |
| Q4 / CrAg branch | CD4 and CrAg are lab results with no representation in the language | not encoded (Could not model) |
| Q5 (jaundice, meningitis signs, acute illness) | Only reached through the CD4/CrAg path; outcomes are management/referral | not encoded (Questions for a clinician) |
| Q6, Q7 (known TB branch) | ART timing only; CD4 < 50 is a lab value | not encoded |
