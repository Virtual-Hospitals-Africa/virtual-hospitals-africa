# Page 20 – Seizures/fits: flowchart

Source: `inputs/2026/p20.png` (one red box covering the whole algorithm).

```mermaid
flowchart TD
    H["Give urgent attention to the patient who is unconscious and fitting"]
    H --> A["If current head injury → 30<br/>Recovery position, nothing in mouth<br/>Oxygen to sats ≥ 95%<br/>Establish IV access<br/>Fingerprick glucose: &lt; 3 (&lt; 4 if diabetes) or unable to measure → 19<br/>≥ 20 weeks pregnant up to 1 week postpartum → 177"]
    A -- "Not pregnant or &lt; 20 weeks pregnant" --> B["If fit has lasted ≥ 5 minutes:<br/>midazolam / diazepam, monitor airway, refer urgently"]
    B --> R1{"Response within 5 minutes?"}
    R1 -- "Still fitting after 5 minutes" --> C["Second dose midazolam / diazepam,<br/>monitor airway, assess intubation, refer urgently"]
    R1 -- "Patient stops fitting" --> S["Recovery position, oxygen ≥ 95%,<br/>restart/start antiseizure medication if known epilepsy and discontinued"]
    C --> R2{"Response within 5 minutes?"}
    R2 -- "Still fitting after 5 minutes" --> D["Crushed levetiracetam via NG tube,<br/>airway support, discuss with referral hospital"]
    R2 -- "Patient stops fitting" --> S
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| H (red box header): unconscious and fitting | `Seizure` (recorded warning sign) triggers a check for `Unconscious`; both together → Urgent | `Check for urgent seizure/fit conditions`, `Urgent: unconscious and fitting` |
| A: head injury → 30, glucose → 19, pregnancy → 177 | Pointers to other pages; not modelled here | none (`cross_reference_only`) |
| B: fit lasted ≥ 5 minutes | Treatment threshold for medication; the language has no seizure-duration observable (onset is not duration) | none (`management_step`) |
| R1 / R2: still fitting after 5 minutes / stops fitting | Treatment-response routing | none (`flowchart_routing`) |
| C, D, S | Medicines, airway support, referral | none (`management_step`) |
