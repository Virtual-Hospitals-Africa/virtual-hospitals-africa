# Page 55 – Breast symptoms: remaining questions

Reconciled from two independent builds (base: builder A; see `reconcile.json`).

## Decisions made

- **Trigger.** "Breast symptoms" is not a recorded common symptom or warning sign. The check-for
  task is triggered by the general `Breast finding`, so any recorded breast finding (lump, pain,
  breastfeeding, …) starts it.
- **Red box → probable breast abscess → Urgent.** The red box names "breast abscess likely" for
  all of its criteria, so `Diagnose probable breast abscess` carries them and
  `Urgent: breast symptoms with likely breast abscess` fires on `(active_condition Abscess of breast)`
  (`Breast abscess` is not an FSN). No escalation beyond Urgent, since the page does not escalate.
  The abscess rule does not repeat `Breast finding` ("patient with breast symptoms"): `Breast lump`
  and `Pain of breast` are already breast findings, so it would add nothing.
- **"Painful lump in breast/s"** is `Breast lump` AND `Pain of breast`; SNOMED has no "painful"
  qualifier value or precoordinated painful breast lump (the `Tender` qualifier means something
  different). "Which may be fluctuant" is descriptive, not a requirement, and is not encoded.
- **"Body pain"** is `Generalized aches and pains` (finding).
- **Temperature ≥ 38 °C** is the measured body temperature, not the `Fever` finding, exactly as the
  page writes it.
- **Breastfeeding** is `Maternal breastfeeding` (finding). `Mother currently breastfeeding`
  (situation) was rejected: in SNOMED it is a family-history context about the patient's mother.
- **Mastitis** uses `Mastitis associated with lactation`, because the page reaches it only on the
  breastfeeding branch. Evidence: breastfeeding AND pain of breast (lump optional, "with or without
  lump/s") AND (temperature ≥ 38 °C OR body pain).
- **Engorgement/blocked duct** is the "No" branch: temperature < 38 °C AND (no body pain). It is one
  outcome on the page, written as two probable rules with identical evidence (`Milk engorgement of
  breast`, the lactational concept, and `Obstruction of lactiferous duct`).
- **Mastalgia** is diagnosed as `Pain of breast`, the concept whose synonym is "mastalgia".
  Evidence: (no maternal breastfeeding) AND pain of breast AND `Breast normal`. The diagnosis
  concept is also one of its evidence findings (see Questions for a clinician).
- **A breastfeeding patient who meets the red-box criteria also meets the mastitis rule.** That is
  how the page reads (the red box comes first); both diagnoses can fire, and Urgent reflects the
  red box.
- **Not encoded (management or referral only):** the warning-sign list (refer same week), painful
  or cracked nipples ("usually due to poor latching"), HIV breastfeeding advice, axillary lump,
  breast enlargement, breast lump re-examination and age-based referral, nipple discharge, all
  medicines and the footnote.

## Could not model

- The "Is the patient breastfeeding? → No" branch depends on breastfeeding being recorded as absent.
  `(no Maternal breastfeeding)` needs an explicit negative; if breastfeeding is simply not
  recorded, mastalgia does not fire (fires less often than the page intends).
- The engorgement/blocked duct rules need a measured temperature (< 38 °C). Without a temperature
  reading they do not fire (less often than intended).
- **Warning signs for same-week referral** (skin changes; breast lump with age > 25, family history,
  irregular fixed lump, skin/nipple changes, discharge or axillary lump; axillary lump with …;
  nipple discharge/retraction with age ≥ 50, blood-stained or one-sided discharge, male, …) are
  referral criteria with no named diagnosis and no urgency level, so they were not encoded. They
  also gate the breastfeeding branch ("If none of above, continue to assess"), which the mastitis,
  engorgement and mastalgia rules do not model, so those may fire alongside a warning sign (more
  often than the page intends).

## SNOMED gaps

- No "Mastitis" (disorder) by that exact name: used `Mastitis associated with lactation`.
- No "Breast abscess" (disorder): used `Abscess of breast`.
- No "Blocked milk duct"/"Galactostasis": used `Obstruction of lactiferous duct`.
- No "Breast engorgement": used `Milk engorgement of breast` (disorder).
- No "Breastfeeding" (finding): used `Maternal breastfeeding` (finding).
- No "Painful" qualifier value: "painful lump" = `Breast lump` + `Pain of breast`.
- No separate "Mastalgia" concept: used `Pain of breast`.
- No "Body ache"/"Body pain": used `Generalized aches and pains`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "body pain" be the common symptom `Muscle pain` (which the app already records) instead of,
  or as well as, `Generalized aches and pains`?
- Should a painful breast lump with fever in a breastfeeding woman be diagnosed as both mastitis and
  breast abscess, or abscess only?
- Should "Engorgement/blocked duct likely" be two diagnoses, or only engorgement?
- Should mastalgia be recorded as a diagnosis at all, given that its SNOMED concept (`Pain of
  breast`) is also the presenting finding? Is it acceptable that it needs breastfeeding to be
  recorded as absent?
- Should the same-week referral warning signs become a `possible` breast cancer rule? The page never
  names a diagnosis, so it was left out.
