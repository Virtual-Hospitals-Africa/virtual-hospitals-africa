# Page 82 – Skin symptoms: flowchart

The red box is a list of urgent criteria. Below it, the page has a routing chart that sends
non-urgent patients to other pages by symptom. The routing is navigation only, so no rule encodes it.

```mermaid
flowchart TD
  S[Skin symptoms] --> U{Any urgent red-box criterion?}
  U -->|Sudden generalised itch/rash or face/tongue swelling AND wheeze, difficulty breathing, BP < 90/60, dizziness/collapse, abdominal pain, vomiting or allergen exposure| AN[Check for anaphylaxis p28 · Urgent]
  U -->|Purple/red rash AND neck stiffness, drowsy/confused, T ≥ 38°C or headache| MN[Meningococcal disease likely · Urgent]
  U -->|Diffuse rash within 3 months of new medication AND any listed sign| DR[Serious drug reaction likely · Urgent]
  U -->|No| NU[Not needing urgent attention]
  NU --> MP{Unexplained rash/lesion AND ≥ 1 systemic feature?}
  MP -->|Yes| MPX[Consider mpox p40]
  NU --> R[Route by symptom: pain 83 · itch with generalised rash 84 / localised rash 85 / no rash 86 · generalised non-itchy rash 87 · lumps/pimples 89 · ulcer/wound 90 · crusts/flaky 93 · colour change 94 · scalp 95]
  NU --> HIV[Extensive/recurrent/difficult rash: test for HIV p124]
```

| Decision node | Rule in `82-skin-symptoms.lisp` |
|---|---|
| Anaphylaxis criteria | "Diagnose possible anaphylaxis from skin symptoms"; first branch of "Urgent: skin symptoms with anaphylaxis signs, meningococcal disease or serious drug reaction" |
| Meningococcal disease likely | "Diagnose probable meningococcal disease from purple/red rash" → Urgent rule |
| Serious drug reaction likely | "Diagnose probable serious drug reaction with diffuse rash" → Urgent rule |
| Consider mpox | "Diagnose possible mpox from skin symptoms" (findings gathered by "Check for mpox features with skin symptoms") |
| Red-box findings | "Check for urgent skin symptom conditions" |
| Symptom routing, HIV test | Not encoded (navigation / management) |
