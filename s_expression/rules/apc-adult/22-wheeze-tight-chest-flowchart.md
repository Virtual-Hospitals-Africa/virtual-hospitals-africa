# Page 22 – Wheeze/tight chest: flowchart

Source: `inputs/2026/p22.png` (APC 2026, page 22): two bullets above the red box, and the red box.

## Bullets above the red box

```mermaid
flowchart TD
    C["Wheeze / tight chest"]
    C --> A{"Sudden wheeze/tight chest <b>and</b> any of: generalised itch/rash,<br/>face/tongue swelling, BP &lt; 90/60, dizziness/collapse,<br/>abdominal pain, vomiting, exposure to possible allergen¹?"}
    A -- Yes --> ANA["Check for anaphylaxis ↻ 28"]
    C --> H{"Difficulty breathing worse on lying flat <b>and</b> leg swelling<br/><i>or</i> patient ≥ 50 years with first episode of wheeze/tight chest?"}
    H -- Yes --> HF["Heart failure likely → 151"]
```

¹ Common allergens include medication, food or insect bite/sting within the past few hours.

## Red box: "Give urgent attention to the patient with wheeze/tight chest"

```mermaid
flowchart TD
    S1{"Assess severity of episode. Any of: pulse &lt; 50, unable to talk,<br/>silent chest (tight chest but no wheeze), PEFR² &lt; 33% of predicted,<br/>drowsy or confused?"}
    S1 -- Yes --> LT["Life threatening:<br/>40% (COPD 24-28%) face mask O₂, refer urgently,<br/>nebulise salbutamol + ipratropium, hydrocortisone;<br/>if no longer life threatening, manage as severe"]
    S1 -- No --> S2{"Any of: SpO₂ &lt; 90%, RR &gt; 30, pulse &gt; 120,<br/>unable to talk in full sentences, PEFR² &lt; 60% of predicted, agitated?"}
    S2 -- Yes --> SEV["Severe:<br/>face mask O₂, refer urgently, nebulised/spacer salbutamol,<br/>prednisone or hydrocortisone; assess response"]
    S2 -- No --> MM["Mild or moderate:<br/>salbutamol (spacer or nebuliser), prednisone if known asthma/COPD,<br/>monitor, repeat every 20 min in the first hour"]
    LT --> SEV
    MM --> R1{"Assess after 1 hour of treatment:<br/>check RR and PEFR², can patient talk normally?"}
    R1 -- "Improving or no change:<br/>talks normally and RR &lt; 20 or PEFR² improved &gt; 20%" --> R2{"Wheeze/tight chest resolved?"}
    R1 -- "Worsening despite treatment:<br/>unable to talk normally or RR ≥ 20 or PEFR² not improved" --> SEV
    R2 -- Resolved --> DIS["Discuss before discharge if late afternoon, previous severe attacks,<br/>recent night-time/worsening symptoms; first episode → assess asthma/COPD 138;<br/>known asthma → 140, COPD → 141"]
    R2 -- "Still present" --> R3{"Repeat salbutamol every 2-4 h.<br/>Still present after 3 hours of treatment?"}
    R3 -- No --> DIS
    R3 -- Yes --> REF["Continue salbutamol every 2-4 h and refer"]
```

² PEFR is expressed as a percentage of the predicted normal value for the patient's age and height ↻ 139.

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| Presenting complaint | `Wheezing` or `Tight chest` (neither is a recorded common symptom or warning sign) | `Check for wheeze/tight chest severity and causes` (task trigger) |
| Silent chest needs a wheeze check | A patient presenting with tight chest is examined for wheeze | `Check for wheeze in tight chest` |
| PEFR² | Measure `Recorded/predicted peak expiratory flow rate ratio` in % | `Measure PEFR in wheeze/tight chest` |
| Header: urgent attention to every patient with wheeze/tight chest | `(or Wheezing Tight chest)` → Urgent | `Urgent: wheeze/tight chest` |
| S1 = Yes (life threatening) | complaint **and** any of: pulse < 50, unable to speak, tight chest with no wheeze, PEFR < 33% predicted, drowsy, acute confusion → Emergency | `Emergency: life-threatening wheeze/tight chest` |
| S1 = No → S2 = Yes (severe) | complaint **and** any of: SpO₂ < 90%, RR > 30, pulse > 120, unable to complete a sentence in one breath, PEFR < 60% predicted, agitated → Urgent | `Urgent: severe wheeze/tight chest` |
| S2 = No (mild/moderate) | No separate rule; covered by the base Urgent rule | `Urgent: wheeze/tight chest` |
| R1, R2, R3 (reassessment after 1 h / 3 h of treatment) | Not modelled: they route management after treatment and depend on time since treatment started | — (see remaining questions) |
| Anaphylaxis bullet | Sudden-onset wheeze/tight chest **and** any listed feature → `possible` anaphylaxis | `Diagnose possible anaphylaxis from sudden wheeze/tight chest` |
| Heart failure bullet | complaint **and** orthopnoea **and** leg swelling → `probable` heart failure; the age ≥ 50 + first-episode branch is not modelled (no age in the language) | `Diagnose probable heart failure from wheeze/tight chest` |

## Notes

- All management (oxygen, salbutamol, ipratropium, steroids, referral, discharge advice) is out of
  scope for this pass and is not modelled.
- "Life threatening" is the page's own explicit escalation, so that tier is `Emergency`. The
  severe tier stays `Urgent`, the level the header gives every patient with wheeze/tight chest.
