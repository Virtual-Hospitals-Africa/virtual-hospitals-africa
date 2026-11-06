# Page 55 – Breast symptoms: remaining questions

## Decisions made

- **Trigger.** "Breast symptoms" is not a recorded common symptom or warning sign. The check-for
  task is triggered by the general `Breast finding`, so any recorded breast finding (lump, pain,
  breastfeeding, …) starts it.
- **Red box → probable breast abscess → Urgent.** The red box names "breast abscess likely" for
  all of its criteria, so `Diagnose probable breast abscess` carries them and
  `Urgent: breast symptoms with likely breast abscess` fires on `(active_condition Abscess of breast)`.
  No escalation beyond Urgent, since the page does not escalate.
- **"Painful lump in breast/s"** is `Breast lump` AND `Pain of breast`; SNOMED has no "painful"
  qualifier value. "Which may be fluctuant" is descriptive, not a requirement, and is not encoded.
- **"Body pain"** is `Generalized aches and pains` (finding).
- **Temperature ≥ 38 °C** is the measured body temperature, not the `Fever` finding, exactly as the
  page writes it.
- **Mastitis** uses `Mastitis associated with lactation`, because the page reaches it only on the
  breastfeeding branch. Evidence: breastfeeding AND pain of breast (lump optional, "with or without
  lump/s") AND (temperature ≥ 38 °C OR body pain).
- **Engorgement/blocked duct** is the "No" branch: temperature < 38 °C AND (no body pain), written
  as two probable rules with identical evidence (`Engorgement of breasts`, `Obstruction of
  lactiferous duct`).
- **Mastalgia** is diagnosed as `Pain of breast`, the concept whose synonym is "mastalgia".
  Evidence: (no maternal breastfeeding) AND pain of breast AND `Breast normal`.
- **Not encoded (management or referral only):** the warning-sign list (refer same week), painful
  or cracked nipples ("usually due to poor latching"), HIV breastfeeding advice, axillary lump,
  breast enlargement, breast lump re-examination and age-based referral, nipple discharge, all
  medicines and the footnote.

## Could not model

- The "Is the patient breastfeeding? → No" branch depends on breastfeeding being recorded as absent.
  `(no Maternal breastfeeding)` needs an explicit negative; if breastfeeding is simply not
  recorded, mastalgia does not fire (fires less often than the page intends).
- The engorgement/blocked duct rules need a measured temperature (< 38 °C). Without a temperature
  reading they do not fire.
- "If none of above [warning signs], continue to assess the patient below": the mastitis,
  engorgement and mastalgia rules do not exclude the warning signs, so they may fire alongside a
  warning sign (more often than the page intends). The warning signs themselves are not encoded.
- The abscess and mastitis rules overlap: a breastfeeding patient with a painful lump and fever
  gets both. The page's red box takes precedence (urgent), which the Urgent priority reflects.

## SNOMED gaps

- No "Mastitis" (disorder) concept by that exact name: used `Mastitis associated with lactation`.
- No "Blocked milk duct"/"Galactostasis": used `Obstruction of lactiferous duct`.
- No "Breast engorgement": used `Engorgement of breasts` (finding).
- No "Breastfeeding" (finding): used `Maternal breastfeeding` (finding).
- No "Painful" qualifier value: "painful lump" = `Breast lump` + `Pain of breast`.
- No separate "Mastalgia" concept: used `Pain of breast`.
- "Body pain": used `Generalized aches and pains`.

## Checker issues left in place

- None.

## Questions for a clinician

- Should "body pain" be the common symptom `Muscle pain` (which the app already records) instead of,
  or as well as, `Generalized aches and pains`?
- Should a painful breast lump with fever in a breastfeeding woman be diagnosed as both mastitis and
  breast abscess, or abscess only?
- Is it acceptable that mastalgia needs breastfeeding to be recorded as absent?
- Should the same-week referral warning signs become a `possible` breast cancer rule? The page never
  names a diagnosis, so it was left out.
