# Page 20 – Seizures/fits: flowchart

Source: APC 2026 e-book page 20 (red box; the whole page is one red box).

```mermaid
flowchart TD
    START["Patient who is unconscious and fitting<br/>(give urgent attention)"]
    START --> PRE["Head injury → 30 · Recovery position · Oxygen (sats ≥ 95%) · IV access<br/>Glucose &lt; 3 (&lt; 4 if diabetes) or unable to measure → 19<br/>≥ 20 weeks pregnant up to 1 week postpartum → 177"]
    PRE -- "Not pregnant or &lt; 20 weeks" --> F5["If fit has lasted ≥ 5 minutes:<br/>midazolam/diazepam, monitor airway, refer urgently"]
    F5 --> W1{"Response within 5 minutes?"}
    W1 -- "Still fitting after 5 minutes" --> D2["Second dose midazolam/diazepam,<br/>monitor airway, assess intubation"]
    W1 -- "Patient stops fitting" --> STOP["Recovery position, oxygen,<br/>restart antiseizure medication if known epilepsy and discontinued"]
    D2 --> W2{"Response within 5 minutes?"}
    W2 -- "Still fitting after 5 minutes" --> LEV["Levetiracetam via NG tube, monitor airway,<br/>discuss with referral hospital if fitting continues"]
    W2 -- "Patient stops fitting" --> STOP
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Unconscious and fitting (red-box header) | `Seizure` (recorded warning sign) triggers a check for `Unconscious`; both together → Emergency | `Check for unconsciousness in the fitting patient`, `Emergency: unconscious and fitting (seizures/fits)` |
| Head injury → 30, low glucose → 19, pregnancy → 177 | Cross-references only; no rule | — |
| Fit lasted ≥ 5 minutes, still fitting after 5 minutes, patient stops fitting | Medication sequence (management); not modelled | — |

## Notes

- No "X likely" or "consider X" appears on the page, so there are no diagnosis rules.
