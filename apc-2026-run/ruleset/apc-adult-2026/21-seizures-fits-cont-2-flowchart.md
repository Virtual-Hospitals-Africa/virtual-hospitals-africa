# Page 21 – Seizures/fits (cont. 2): flowchart

Source: APC 2026 e-book, page 21.

```mermaid
flowchart TD
    Q0["Approach to the patient who is not fitting now<br/>Confirm that patient indeed had a seizure/fit: jerking movements of part of or the whole body,<br/>usually lasting &lt; 3 minutes. May have had tongue biting, incontinence, post-fit drowsiness and confusion."]
    Q0 -- Yes --> RB["<b>Refer patient same day if any of:</b><br/>Temperature ≥ 38°C, headache, neck stiffness or purple/red rash, meningitis likely<br/>(malaria area in past 3 months + malaria test positive: also give artesunate)<br/>New/different headache or headache getting worse/more frequent<br/>Patient with HIV and no known epilepsy<br/>Decreased consciousness &gt; 1 hour after fit → 18<br/>Glucose &lt; 3 (&lt; 4 if diabetes) or unable to measure → 19<br/>Glucose ≥ 11.1 → 19<br/>New sudden asymmetric weakness or numbness, difficulty speaking or visual disturbance<br/>BP ≥ 180/130 more than 1 hour after fit has stopped<br/>Alcohol/drug use: overdose or withdrawal<br/>Recent head injury<br/>Pregnant or up to 1 week postpartum (≥ 20 weeks pregnant and just had fit → 177)"]
    Q0 -- No --> N1["New sudden asymmetric weakness or numbness of face, arm or leg;<br/>difficulty speaking or visual disturbance"]
    Q0 -- No --> N2["Collapse with twitching lasting &lt; 15 seconds following flushing,<br/>dizziness, nausea, sweating and with rapid recovery"]
    N1 --> STROKE["Stroke or TIA likely → 152"]
    N2 --> FAINT["Common faint likely → 45"]
    STROKE --> UNC["If diagnosis uncertain, refer."]
    FAINT --> UNC
    RB -- "none of the above" --> Q1["Approach to the patient who had a fit but does not need same day referral<br/>Is the patient known with epilepsy?"]
    Q1 -- Yes --> EPI["Give routine epilepsy care → 167"]
    Q1 -- No --> WORKUP["Doctor to check FBC, creatinine (eGFR), urea, sodium, calcium.<br/>Focal seizures or new seizures after meningitis, stroke or head injury: discuss with specialist.<br/>≥ 2 definite seizures with no identifiable cause: doctor to consider epilepsy, routine care → 167"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Q0 (seizure confirmed?) | The recorded warning sign `Seizure` is the trigger for the whole page | `Check for same-day referral after a seizure/fit` (due_to) |
| RB, meningitis bullet | Seizure **and** any of temperature ≥ 38 °C, headache, stiff neck, purpuric rash | `Diagnose probable meningitis after a seizure/fit` |
| RB (all bullets) | Seizure **and** any red-box criterion (meningitis via `active_condition`) | `Urgent: same-day referral after a seizure/fit` |
| N1 → Stroke or TIA likely | Any focal sign (sudden asymmetric weakness/numbness, difficulty talking, visual disturbance) | `Diagnose probable stroke from focal signs (seizure/fit page)`, `Diagnose probable TIA from focal signs (seizure/fit page)` |
| N2 → Common faint likely | Collapse **and** muscle twitch **and** any of flushing, dizziness, nausea, sweating | `Diagnose probable common faint (seizure/fit page)` |
| If diagnosis uncertain, refer | Referral step | Not modelled (management) |
| Q1 / routine epilepsy care / doctor work-up | Management and lab work-up | Not modelled (management; "≥ 2 definite seizures" cannot be counted in the language) |

## Notes

- The "No" branch (not a seizure) cannot be expressed as a negation of the trigger, because the
  trigger is the recorded seizure itself. The stroke/TIA and faint rules therefore rest on their
  own evidence and do not require `(no Seizure)`.
- "> 1 hour after fit" is modelled as `(>= (onset Seizure) (time_ago 1 hours))`.
- "Up to 1 week postpartum" is modelled as `(<= (onset Postpartum state) (time_ago 1 weeks))`.
- BP ≥ 180/130 is read as systolic ≥ 180 **or** diastolic ≥ 130.
