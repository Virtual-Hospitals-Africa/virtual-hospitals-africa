# Page 61 – Anal symptoms: remaining questions

Reconciled final build (base: builder B; A and B encoded identical conditions).

## Decisions made

- **Presenting complaint.** "Anal symptoms" is encoded as `(clinical_finding (snomed_concept "Anal finding" "finding"))`, the general SNOMED parent. Anal pain, Pruritus ani, Anal fissure, Ulcer of anus and Anal warts are descendants and match in `due_to`. It is **not** a recorded common symptom or warning sign, so the task fires only if the app records an anal finding.
- **Red box → `Urgent`** as `(and Anal finding (or (and Perianal lump, Anal pain + Severe) Does not defecate))`. The page doesn't escalate to Very urgent or Emergency.
- **"Extremely painful lump on anus"** = Perianal lump **and** Anal pain with `Severe (severity modifier)`. No "painful lump" concept exists.
- **"Unable to pass stool because of anal symptoms"** = `Does not defecate`. "Because of anal symptoms" is carried by the AND with the anal-finding trigger.
- **Sexually transmitted proctitis.** "If painless bleeding, passing mucus or … tenesmus, treat for sexually transmitted proctitis" is encoded as a `probable` diagnosis of `Infective proctitis` (the parent of the gonococcal and other STI proctitis concepts), with evidence Anal finding AND any of Painless rectal bleeding, Mucus in stool, Tenesmus of anus and/or rectum. "Treat for" is neither "likely" nor "consider"; I chose probable because the page acts on it as a presumptive diagnosis. The rule isn't conditioned on anal sex, because the page puts that in a separate sentence.
- **Pinworm likely** = probable `Enterobiasis` from Worms in stool AND `Pruritus ani` qualified `Night time`.
- The examination branches (Crack/s, Lump/pile, Red/raw skin, Ulcer/s or perianal wart/s) lead only to management, referral or cross-references; the page names no "likely" diagnosis on them, so they aren't encoded.

## Could not model

- **Tapeworm likely** (worm flat and white with segments). There is no finding for a worm's appearance, so no rule. A rule on Worms in stool alone would diagnose tapeworm for every worm (fires far more often than the page intends). Not encoding it means it never fires.
- **Pinworm discriminators** "thin and white" and the No branch (not flat/segmented) can't be expressed. The rule therefore also fires for a flat segmented worm that comes with night-time anal itch, so it fires slightly more often than the page intends. "Worse at night" is reduced to "at night".
- **Anaemia likely** if Hb < 12 (woman) or < 13 (man): haemoglobin has no unit or observable in the language. Not encoded (never fires here; page 44 covers anaemia).
- **"Not needing urgent attention"** (the approach section's scope) isn't expressible, so the proctitis rule also fires for urgent patients.
- Management (paracetamol, morphine, "Stop if BP drops < 90/60", ointments, anthelmintics, household treatment, hygiene, referral criteria including larva migrans) is out of scope.

- **Perianal lump and the trigger** (from builder A): `Perianal lump` is not a descendant of `Anal finding` (it sits under Perineal finding), so a patient recorded only with a perianal lump does not trigger the check task.

## SNOMED gaps

- "Anal symptom": not found; used `Anal finding` (finding).
- "Painful lump on anus": not found; used `Perianal lump` + `Anal pain` (Severe).
- "Unable to pass stool / unable to defecate": not found; used `Does not defecate`.
- "Sexually transmitted proctitis": not found; used `Infective proctitis` (disorder).
- "Passing mucus per rectum": not found; used `Mucus in stool`.
- Flat/segmented or thin/white worm, tapeworm segments seen: not found (proglottids exist only as organisms). Tapeworm is not encoded.
- "Anal itch worse at night": used `Pruritus ani` (disorder) + `Night time` qualifier.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "treat for sexually transmitted proctitis" be a `probable` or a `possible` diagnosis, and should it require a history of anal sex (`Anal penetration` finding), or apply to every patient with painless bleeding, mucus or tenesmus as written?
- Is "Does not defecate" an acceptable reading of "unable to pass stool because of anal symptoms", or should it be tenesmus, difficulty defecating, or a thrombosed/prolapsed haemorrhoid concept?
- Should a seen worm with night-time anal itch be enough for pinworm without the worm's appearance being recorded?
- Should a perianal lump alone (without another anal finding) trigger the check task? That would need `Perianal lump` in the trigger and so could not also be in its `check_for`.
