# Page 21 – Seizures/fits (cont. 2): flowchart

Source: APC 2026 e-book, page 21 (`inputs/2026/p21.png`, red box `p21-box1.png`).

```mermaid
flowchart TD
    START["Approach to the patient who is not fitting now<br/>Confirm that patient indeed had a seizure/fit: jerking movements of part of or the whole body,<br/>usually lasting &lt; 3 minutes. May have had tongue biting, incontinence, post-fit drowsiness and confusion."]
    START -- Yes --> RB["<b>Refer patient same day if any of:</b><br/>• Temperature ≥ 38°C, headache, neck stiffness or purple/red rash, <b>meningitis</b> likely (give ceftriaxone, analgesia; artesunate if malaria test positive)<br/>• New/different headache or headache getting worse/more frequent<br/>• Patient with HIV and no known epilepsy<br/>• Decreased consciousness &gt; 1 hour after fit → 18<br/>• Glucose &lt; 3 (&lt; 4 if diabetes) or unable to measure → 19<br/>• Glucose ≥ 11.1 → 19<br/>• New sudden asymmetric weakness or numbness, difficulty speaking or visual disturbance<br/>• BP ≥ 180/130 more than 1 hour after fit has stopped<br/>• Alcohol/drug use: overdose or withdrawal<br/>• Recent head injury<br/>• Pregnant or up to 1 week postpartum (≥ 20 weeks pregnant and just had fit → 177)"]
    START -- No --> NO1["New sudden asymmetric weakness or numbness of face, arm or leg;<br/>difficulty speaking or visual disturbance"]
    START -- No --> NO2["Collapse with twitching lasting &lt; 15 seconds following flushing,<br/>dizziness, nausea, sweating and with rapid recovery"]
    NO1 --> STROKE["<b>Stroke</b> or <b>TIA</b> likely → 152"]
    NO2 --> FAINT["<b>Common faint</b> likely → 45"]
    STROKE --> UNSURE["If diagnosis uncertain, refer."]
    FAINT --> UNSURE
    RB -- "none of the above" --> NOREF["Approach to the patient who had a fit but does not need same day referral:<br/>Is the patient known with epilepsy?"]
    NOREF -- Yes --> ROUTINE["Give routine epilepsy care → 167"]
    NOREF -- No --> WORKUP["• Doctor to check FBC, creatinine (eGFR), urea, sodium, calcium<br/>• If focal seizures or new seizures after meningitis, stroke or head injury, discuss with specialist<br/>• If ≥ 2 definite seizures with no identifiable cause, doctor to consider epilepsy, routine care → 167"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Entry: patient had (or is reported to have had) a fit | `(or Seizure Post-ictal state)`, both adult warning signs | trigger of `Check for seizure/fit same-day referral conditions` |
| Confirm seizure: Yes / No | Not modelled as a separate decision. The confirmation features (jerking, duration < 3 min, tongue biting, incontinence, post-fit drowsiness/confusion) are routing guidance, and "No" cannot be recorded without contradicting the trigger. All findings for both branches are in the one `check_for` | `Check for seizure/fit same-day referral conditions` |
| Red box, meningitis bullet | Seizure/post-ictal **and** any of temperature ≥ 38 °C, headache, stiff neck, purpuric rash | `Diagnose probable meningitis after a seizure/fit`; referenced as `(active_condition Meningitis)` |
| Red box, every other bullet | Seizure/post-ictal **and** `or` of the bullets | `Urgent: seizure/fit needing same-day referral` |
| No → focal deficit | Any of sudden-onset unilateral weakness/numbness of face or limb, difficulty talking, visual disturbance | `Diagnose probable stroke after a reported fit` (Cerebrovascular accident; TIA has no joint concept) |
| No → collapse with twitching after prodrome | Collapse **and** muscle twitch **and** any of flushing, dizziness, nausea, sweating. Duration < 15 s and rapid recovery not representable | `Diagnose probable common faint after a reported fit` |
| If diagnosis uncertain, refer | Management | not encoded |
| Does not need same-day referral → known epilepsy? | Management / routine care pointers | not encoded |
| ≥ 2 definite seizures, no identifiable cause → consider epilepsy | No SNOMED concept or count for "≥ 2 seizures"; "no identifiable cause" not representable | not encoded (see remaining questions) |

## Notes

- "Refer patient same day" is encoded as `Urgent`. The Seizure warning sign itself already carries
  Emergency and Post-ictal state Very urgent; this page does not escalate beyond same-day referral.
- "> 1 hour after fit" is `(>= (onset (clinical_finding Seizure)) (time_ago 1 hours))`
  (`>` changed to `>=` because the database rejects strict time comparisons).
