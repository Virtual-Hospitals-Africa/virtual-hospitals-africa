# Page 79 – Neck pain / Arm or hand symptoms: flowchart

Source: APC 2026 page 79 image (two red boxes, a Yes/No approach for neck pain, and four "likely" columns for arm or hand symptoms).

```mermaid
flowchart TD
    NP["Neck pain"] --> RB2{"Red box: any of<br/>1) Neck stiffness + any of T ≥ 38°C, headache, drowsy/confused, purple/red rash → meningitis likely<br/>2) Neurological symptoms in arms/legs<br/>3) Recent injury + x-ray unavailable/abnormal or neurological symptoms"}
    RB2 -- Yes --> URG2["Urgent. Refer urgently"]
    RB2 -- No --> QN{"Any of: >50 years, pain progressive or > 6 weeks, oral steroids, HIV, diabetes, IV drug use,<br/>unexplained weight loss/fever or TB, neck surgery, previous cancer?"}
    QN -- Yes --> XR["Cervical spine x-ray, refer to doctor"]
    QN -- No --> AN["Analgesia, physiotherapy, review"]

    AH["Arm or hand symptoms"] --> J{"Joint warm/tender/swollen or unable to do all actions comfortably?"}
    J -- Yes --> JP["Joint problem likely → 77"]
    AH --> RB1{"Red box: any of<br/>1) Arm pain with chest pain<br/>2) Recent injury + severe pain/swelling or deformity → fracture likely<br/>3) New sudden onset arm weakness → consider stroke/TIA"}
    RB1 -- Yes --> URG1["Urgent"]
    RB1 -- No --> COLS{"Which pattern?"}
    COLS -- "Painful shoulder" --> RP["Referred pain likely"]
    COLS -- "Wrist/hand pain: intermittent, worse at night, relieved by shaking" --> CTS["Carpal tunnel syndrome likely"]
    COLS -- "Elbow pain with/after flexion/extension" --> TE["Tennis or golfer's elbow likely"]
    COLS -- "Thumb pain worse with movement, or catching/locking of finger" --> TS["Tenosynovitis likely"]
```

## Decision nodes → rules

| Node | Modelled as | Rule |
|---|---|---|
| RB2 item 1 | Stiff neck AND any of T ≥ 38 °C, headache, drowsy, acute confusion, purpuric or erythematous rash | `Diagnose probable meningitis from neck stiffness (neck pain page)` |
| RB2 (all items) | Neck pain AND (active meningitis OR any limb neuro symptom OR (recent neck injury AND (abnormal C-spine x-ray OR neuro symptom))) | `Urgent: neck pain with meningitis, neurological symptoms or recent injury` |
| RB2 findings | check list | `Check for urgent neck pain conditions` |
| QN | Not modelled (no diagnosis; management routing) | — |
| J | Upper-limb finding AND (joint warm / tender / swollen / limitation of joint movement) | `Diagnose probable joint problem (arm or hand symptoms)` |
| RB1 item 2 | Recent upper-limb injury AND (severe arm pain OR severe swelling OR deformity) | `Diagnose probable fracture of upper limb (arm or hand symptoms)` |
| RB1 item 3 | Sudden-onset upper-limb weakness | `Diagnose possible stroke from sudden arm weakness (arm or hand symptoms)`, `Diagnose possible TIA from sudden arm weakness (arm or hand symptoms)` |
| RB1 (all items) | Upper-limb finding AND ((arm pain AND chest pain) OR active fracture of upper limb OR sudden arm weakness) | `Urgent: arm or hand symptoms with chest pain, fracture or sudden weakness` |
| RP | Pain of shoulder region | `Diagnose probable referred pain from painful shoulder (arm or hand symptoms)` |
| CTS | Intermittent wrist or hand pain AND night pain | `Diagnose probable carpal tunnel syndrome (arm or hand symptoms)` |
| TE | Elbow pain | `Diagnose probable tennis or golfer's elbow (arm or hand symptoms)` |
| TS | Thumb pain OR catching/locking of finger | `Diagnose probable tenosynovitis (arm or hand symptoms)` |
| RB1/RB2 findings | check list | `Check for arm or hand symptom conditions` |

## Notes

- "Refer urgently", ceftriaxone, collar/immobilisation, analgesia, splints and referrals are management, not modelled.
- Optional "may be/may have" features (numbness/tingling of fingers, weakness of hand, decreased grip strength) and "with/without difficulty speaking or visual disturbance" are not criteria and are not modelled.
