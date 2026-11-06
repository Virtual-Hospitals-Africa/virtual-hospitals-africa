# Page 29 – Bites and stings: remaining questions

## Decisions made

- **Presenting complaint.** "Bite/sting" is `(or Bite - wound, Venomous sting)`. `Insect bite - wound`
  (a recorded common symptom), `Snake bite - wound`, `Spider bite wound`, `Human bite - wound`,
  `Animal bite wound` and `Poisoning due to bite of Scorpiones` all descend from `Bite - wound`;
  `Insect sting` (and bee/wasp/ant stings) descend from `Venomous sting`.
- **Red box → `Urgent: bite/sting with danger signs`**, `(and <bite/sting> (or …))`. The page says
  "give urgent attention" and nothing escalates it, so the level is `Urgent`.
- **Shock/systolic BP < 80** is encoded as written on this page: `(or Shock, systolic BP < 80)`
  (pre-made decision). Footnote 2 ("If SBP < 80, pulse ≥ 100, respiratory rate > 30,
  confusion/restlessness, weakness, shock likely") is **not** made into a probable shock rule:
  the brief says not to build a definition of shock, and the footnote does not say whether one or
  all of the signs are needed.
- **Spider bite** qualifies with **any one** of drooling, restlessness or muscle cramps.
- **Anaphylaxis likely** → `Diagnose probable anaphylaxis after bite/sting`: bite/sting **and**
  any one item of the list, each with the `Sudden onset` qualifier ("Sudden onset of …" governs the
  whole list). Page 20 (2023 gold) puts `Sudden onset` only on the skin group; here it is on every
  item, so a cough or nausea recorded without the qualifier does not make anaphylaxis probable.
  "Or exposure to possible allergen³" is not a separate disjunct: footnote 3 counts an insect
  bite/sting as the exposure, and the patient on this page already has a bite/sting. Taking the
  exposure alone as sufficient would make every insect bite probable anaphylaxis.
- The urgent rule consumes anaphylaxis through `(active_condition Anaphylaxis)`, so a probable
  diagnosis from page 28 also counts.
- **Papular urticaria likely** → `Diagnose probable papular urticaria after bite/sting`, evidence
  `Insect bite reaction` + `Extensive`. That concept is itself a kind of `Insect bite - wound`, so no
  separate bite conjunct (the checker flagged the redundant `or`).
- **Cellulitis likely** → `Diagnose probable cellulitis after bite/sting`: bite/sting **and**
  erythema **and** warm skin **and** pain of skin (read as all three).
- **Rabies decision tree and human bite** are management routing (PEP, vaccine, immunoglobulin,
  antibiotics) with no "likely/consider" diagnosis, so they are not modelled. They are outside
  elements and need no accounting.
- No `measure` task: systolic BP is a routine vital.

## Could not model

- "Snake bite **even if bite not seen**": the health worker records the snake bite from the
  history; the language cannot say more.
- "Deep or **large** wound **needing sutures**": only `Deep bite wound` is encoded. Large but
  shallow wounds are missed, so the rule fires less often than the page intends.
- "**Actively** bleeding": plain `Bleeding` matches any recorded bleeding, including controlled
  bleeding, so the rule fires more often than the page intends.
- "Venom in eyes": encoded as `Effect of spitting cobra venom on conjunctiva`, which is narrower
  (spitting cobra only). It fires less often if other venoms reach the eye.
- Papular urticaria after a **spider** bite: `Insect bite reaction` does not cover spider bites,
  so the rule fires less often than the page intends.
- Cellulitis: the flowchart reaches "cellulitis likely" only from spider/insect bites and lower-risk
  animal bites, after "return if worse/no better after 2 days". The rule fires for any bite/sting
  with the three skin signs, so it fires more often (e.g. human bites) and has no time condition.
- Footnote 1 (obtain a description of the spider/snake/scorpion) is a recording instruction.

## SNOMED gaps

- "Scorpion sting": no sting concept; used `Poisoning due to bite of Scorpiones` (disorder).
- "Venom in eyes": no general concept; used `Effect of spitting cobra venom on conjunctiva`.
- "Drooling": no FSN; used `Dribbling from mouth` (finding), of which it is a synonym.
- "Muscle cramps": no `Muscle cramp` FSN; used `Cramp` (finding).
- "Papular urticaria": no FSN; used `Prurigo simplex` (disorder), of which it is a synonym.
- "Extensive local response to bite": no concept; used `Insect bite reaction` + `Extensive`.
- "Large wound", "wound needing sutures", "actively bleeding": no concepts (see above).

## Checker issues left in place

- None.

## Questions for a clinician

1. Should "Sudden onset" apply to every item of the anaphylaxis list (as encoded), or only to the
   skin features, as on the 2023 anaphylaxis page?
2. Does "or exposure to possible allergen" mean that a bite/sting plus *any* of the features is
   enough (as encoded), or that exposure to a medication/new food is enough on its own?
3. Spider bite: is one of drooling, restlessness or muscle cramps enough (as encoded)?
4. Should footnote 2 ("shock likely") become a probable shock rule on this page, and if so, which
   signs are needed?
5. Is `Bleeding` (any) acceptable for "actively bleeding", or should it be restricted to the
   uncontrolled-bleeding warning sign?
6. Is spitting cobra venom an acceptable reading of "venom in eyes"?
