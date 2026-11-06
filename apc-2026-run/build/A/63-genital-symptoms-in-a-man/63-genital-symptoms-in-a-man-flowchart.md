# Page 63 – Genital symptoms in a man: flowchart

Source: APC 2026 e-book page 63 (`inputs/2026/p63.png`): the red box, then the three-column
"Approach to the man with genital symptoms not needing urgent attention".

```mermaid
flowchart TD
    START["Man with genital symptoms"] --> RB{"Red box: any of?"}
    RB -- "Scrotal swelling/pain with any of: sudden severe pain,<br/>testicle higher/rotated, preceding trauma/strenuous activity" --> TORS["Torsion of testicle likely<br/>→ refer urgently to surgical unit"]
    RB -- "Foreskin retracted over glans, cannot be reduced,<br/>with swollen and very painful glans" --> PARA["Paraphimosis likely"]
    PARA -- "Glans blue/black" --> PARAREF["Refer urgently"]
    PARA -- "Not" --> PARARED["Doctor to attempt manual reduction<br/>or discuss with referral centre"]
    RB -- "Prolonged erection &gt; 4 hours" --> PRIA["Priapism likely<br/>→ refer urgently to surgical unit"]
    RB -- "None" --> APPROACH["Not urgent: assess and advise ↻62, test for HIV ↻124,<br/>check for urethral discharge (milk the urethra)"]
    APPROACH -- "No urethral discharge and urinary symptoms" --> P69["→ 69"]
    APPROACH --> UD["Urethral discharge (with or without dysuria/burning urine)"]
    UD --> MUS["Treat for male urethritis syndrome (MUS)"]
    MUS --> MUS7["Return in 7 days if symptoms persist:<br/>ceftriaxone treatment failure likely. Refer within 7 days."]
    APPROACH --> SC["Scrotal swelling or pain"]
    SC -- "Pain with/without swelling or discharge" --> SSW["Treat for scrotal swelling (SSW)"]
    SC -- "Painless lump" --> CA["Exclude testicular cancer. Refer."]
    APPROACH --> GL["Painful, itchy or foul-smelling glans,<br/>difficulty retracting foreskin"]
    GL -- "Unable to retract foreskin" --> GLREF["Refer"]
    GL -- "Able to retract: wash, dry, examine" --> GLX{"Findings"}
    GLX -- "Ulcer/s present" --> P65["↻ 65"]
    GLX -- "Glans inflamed" --> BAL["Treat for balanitis/balanoposthitis (BAL)"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Man with genital symptoms | `(clinical_finding "Male genitalia finding")`; descendants (scrotal swelling/pain, retracted foreskin, prolonged erection, testicular/scrotal mass) match automatically | Trigger of `Check for urgent genital conditions in a man` |
| Torsion of testicle likely | (scrotal swelling **or** scrotal pain) **and** (sudden-onset severe scrotal pain **or** injury of scrotum/testis). "Testicle higher/rotated" and "strenuous activity" have no SNOMED concept (see remaining questions) | `Diagnose probable torsion of testis from genital symptoms` |
| Paraphimosis likely | fixed retracted foreskin **and** swollen glans **and** severe glans pain | `Diagnose probable paraphimosis from genital symptoms` |
| Priapism likely | prolonged erection with onset ≥ 4 hours ago (page: "> 4 hours"; `>=` because the database rejects `>` in onset comparisons) | `Diagnose probable priapism from genital symptoms` |
| Red box → urgent | genital symptoms **and** any of the three likely diagnoses | `Urgent: genital symptoms in a man with torsion, paraphimosis or priapism` |
| Glans blue/black; manual reduction | Management of paraphimosis | Not modelled (management) |
| Urethral discharge → Treat for MUS | urethral discharge → probable `Urethritis` | `Diagnose probable male urethritis syndrome from urethral discharge` |
| Ceftriaxone treatment failure likely | Needs "after MUS treatment, symptoms persist at 7 days" | Not modelled (treatment history is not representable) |
| Pain with/without swelling → Treat for SSW | No SNOMED concept for the SSW syndrome | Not modelled (SNOMED gap) |
| Painless lump → Exclude testicular cancer | painless mass of testicle **or** of scrotum → possible malignant neoplasm of testis | `Diagnose possible testicular cancer from painless scrotal lump` |
| Glans inflamed → Treat for BAL | inflammatory morphology at the glans → probable `Balanitis` (Balanoposthitis is a descendant) | `Diagnose probable balanitis/balanoposthitis from inflamed glans` |
| Ulcers → 65; urinary symptoms → 69; unable to retract → refer | Cross-references and routing | Not modelled |
