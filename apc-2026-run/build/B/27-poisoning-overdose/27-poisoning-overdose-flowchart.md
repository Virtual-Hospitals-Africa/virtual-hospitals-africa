# Page 27 – Poisoning/Overdose: flowchart

The page has a red box (urgent criteria plus urgent management) and, below it, a four-way
algorithm for the patient not needing urgent attention, which depends on the toxic dose as
determined with the Poisons Information Helpline (PIH) or AfriTox.

```mermaid
flowchart TD
  A[Suspected poisoning/overdose] --> B{Any red-box sign?<br/>self-harm/suicide, decreased LOC, seizure,<br/>pupils dilated/pinpoint, confused/agitated/hallucinating,<br/>weakness/twitching, drooling/sweating, persistent vomiting,<br/>difficulty breathing/tight chest/slow-shallow breathing,<br/>RR < 12, shock/SBP < 80, pulse < 60 or > 100}
  B -- Yes --> U[Urgent: manage and refer urgently]
  U --> OP{Pinpoint pupils, drooling/sweating, secretions,<br/>vomiting/diarrhoea, pulse < 60, BP < 90/60?}
  OP -- Yes --> OPL[Organophosphate poisoning likely]
  U --> OD{Shallow breathing/RR < 12 and opioid overdose suspected?}
  OD -- Yes --> NX[Bag-valve-mask, naloxone]
  B -- No --> C[Ask amount/type/time; contact PIH/AfriTox for toxic dose]
  C --> T1[Toxic dose] --> R1[Refer urgently; discuss charcoal with PIH]
  C --> T2[Unknown poison or dose] --> R2[Discuss further management with PIH]
  C --> T3[Non-toxic dose and has symptoms] --> R2
  C --> T4[Non-toxic dose and no symptoms] --> R4[If self-harm → p34; advise to return if worse]
```

| Node | Content | Rule |
|---|---|---|
| A | Presenting complaint | trigger of task "Check for urgent poisoning/overdose signs" |
| B | Red-box criteria | task "Check for urgent poisoning/overdose signs"; priority "Urgent: suspected poisoning/overdose with danger signs" |
| OP / OPL | Organophosphate features | "Diagnose probable organophosphate poisoning" |
| OD / NX | Opioid overdose suspected | not encoded (management; no evidence given for the suspicion) |
| C, T1–T4 | Toxic-dose routing | not encoded: toxic dose is not recordable, and the outcomes are management/referral |
