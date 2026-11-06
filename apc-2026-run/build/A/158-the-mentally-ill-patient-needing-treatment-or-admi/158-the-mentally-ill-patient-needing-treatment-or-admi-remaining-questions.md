# Page 158 – The mentally ill patient needing treatment or admission: remaining questions

## Decisions made

- **Trigger** is `(clinical_finding (snomed_concept "Mental disorder" "disorder"))`, used in both the `check_for` task and the priority rule (no rule diagnoses Mental disorder at `probable`). Mental disorder is not a recorded common symptom or warning sign, so the task only fires if a mental disorder is recorded.
- **"May lead to … causing" is read as risk.** The red-box items are encoded as risk findings: `At increased risk of self-injurious behavior` (in VHA vocabulary), `High risk of harm to others`, `At increased risk for destructive behavior to property`. "Serious harm to self/others" is split into self and others.
- Priority level is `Urgent` ("Give urgent attention"); no escalation on the page.
- The consent/MHCA flowchart is legal routing and was not encoded (see flowchart file).
- No shock, BP or time criteria on this page.

## Could not model

- **Death** and **Irreversible health problem/s** as consequences of delayed referral: no SNOMED risk finding; not encoded. The priority rule therefore fires *less often* than the page intends.
- "Loss of property" is folded into the property-destruction risk finding.
- Consent capacity, refusal, and the flowchart's "serious damage to financial interests/reputation" are legal/administrative routing, not triage.

## SNOMED gaps

- Risk of death due to mental illness: nothing found (searched "risk of death", "increased risk death").
- Risk of irreversible health problems: nothing found.
- `High risk of harm to self` (finding) does not exist; used `At increased risk of self-injurious behavior`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "Death" be approximated by `High suicide risk` (finding)? Not done, to avoid adding a criterion.
- Is `Aggressive behavior` (a warning sign) intended to trigger this page's urgent rule? The page only points aggression to page 35 as management.
- Should the trigger also accept specific disorders (psychosis, mania) — they are descendants of Mental disorder and match automatically; please confirm that is intended.
