# Page 55 – Breast symptoms: remaining questions

## Decisions made

- **Presenting complaint.** "Breast symptoms" is not a recorded common symptom or warning sign. The task and the abscess rule use `Breast finding` (finding), the general concept; descendants such as `Breast lump` and `Pain of breast` match it.
- **Red box → probable breast abscess + Urgent.** The red box names a single likely diagnosis for all its criteria, so it is a `probable` rule for `Abscess of breast` (disorder) (`Breast abscess` is not an FSN), and the priority evaluation is `(active_condition Abscess of breast)`, as on the gold page.
- **"Painful lump in breast/s"** = `Breast lump` AND `Pain of breast`. No precoordinated painful breast lump concept exists; the `Tender` qualifier means something different. **"Which may be fluctuant"** is optional on the page, so fluctuance is not required.
- **"Body pain"** = `Generalized aches and pains` (finding). `Muscle pain` (a common symptom) was the alternative and would anchor better, but it is narrower than "body pain".
- **Breastfeeding** = `Mother currently breastfeeding` (situation).
- **Mastitis likely** = `Mastitis associated with lactation` (disorder), since this branch is breastfeeding only. The page's "with or without lump/s" means a lump is not required.
- **Engorgement/blocked duct likely** is one outcome on the page. It is written as two probable rules with identical evidence: `Milk engorgement of breast` and `Obstruction of lactiferous duct`. The "No" branch is encoded as temperature < 38°C and `(no Generalized aches and pains)`.
- A breastfeeding patient who meets the red-box criteria also meets the mastitis rule. That is how the page reads (the red box comes first); both diagnoses can fire.

## Could not model

- **"If breast exam normal, mastalgia likely"** (not breastfeeding, painful breast/s). In SNOMED, "mastalgia" is a synonym of `Pain of breast`, the presenting finding itself, so a probable diagnosis would just restate the complaint. `Cyclical mastalgia` / `Non-cyclical mastalgia` are more specific than the page. Not encoded. A reviewer may prefer a probable `Pain of breast` rule with evidence `Pain of breast`, `Breast normal`, `(no Mother currently breastfeeding)`.
- **Warning signs for same-week referral** (skin changes; breast lump with age > 25, family history, irregular fixed lump, skin/nipple changes, discharge or axillary lump; axillary lump with …; nipple discharge/retraction with age ≥ 50, blood-stained or one-sided discharge, male, …). These are referral criteria with no named diagnosis and no urgency level, so they were not encoded. They also gate the breastfeeding branch ("If none of above, continue"), which the probable rules do not model. So mastitis and engorgement can fire alongside a warning sign; the rules fire more often than the page intends.
- **The engorgement/blocked duct "No" branch needs a recorded temperature.** Without a temperature measurement, the rules do not fire (less often than intended).
- **Painful/cracked nipples** ("usually due to poor latching"): no "likely" diagnosis; management only.
- Non-breastfeeding branches (axillary lump, breast enlargement, breast lump by age, nipple discharge): management, referral and cross-references only.

## SNOMED gaps

- `Mastitis` (disorder), `Breast abscess` (disorder), `Blocked milk duct`, `Body ache`, `Breastfeeding` (finding): not FSNs. The substitutes used are listed above.
- No precoordinated "painful breast lump" concept.

## Checker issues left in place

- None.

## Questions for a clinician

- Is `Generalized aches and pains` the right reading of "body pain" here, or should it be `Muscle pain` (a recorded common symptom)?
- Should "Engorgement/blocked duct likely" be two diagnoses, or only engorgement?
- Should the same-week referral warning signs become a rule (e.g. a possible breast malignancy), even though the page names no diagnosis?
- Should mastalgia be recorded as a diagnosis when the exam is normal?
