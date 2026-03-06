export const FALLBACK_MEDICINE_SPECIAL_INSTRUCTIONS = new Set([
  '13 x 400mg tablets per 2L normal saline (sodium chloride 0.9%) for wound irrigation 400mg per 35cm2. applied twice daily',
  '(130 - Na) x body weight in kg x 4',
  'Total % burn x weight (kg) x 4 mL',
  '2g, diluted with 100 mL sodium chloride 0.9%, over 10 minutes',
  '4g as a loading dose diluted with 200 mL sodium chloride 0.9% and infused over 20 minutes',
  'in 1000 mL sodium chloride 0.9% infused at 250 mL/hour in 2nd IV line',
  '200 mL sodium chloride 0.9% infused over 20 minutes or 100ml infused over 10 minutes with with magnesium sulfate',
  '200 mL sodium chloride 0.9% infused over 20 minutes with with magnesium sulfate',
  'in 200 mL sodium chloride 0.9% over 10 minutes, or 1g by slow IV injection',
  'premixed with sodium chloride and infused over 2-4 hours before amphotericin B infusion',
  'infused over 2-4 hours before amphotericin B infusion',
  '1-4 mL/hour',
  '1-2 mL/hour',
  '2-5 mL/hour',
  '5 mL/hour over 4 hours',
  'confirm dose with Jane',
  '<1 mEq/kg/hour (not be >40mmol/L/infusion)(1g KCl = 13mEq; 1 mL 15% KCl = 2 mmol; 1 mEq = 1 mmol)',
  '380mm2',
  'dilute rabbies immunoglobulin',
  // Prednisone: time-based dosing schedule
  '13. 7 and 1 hour before procedure',
  // Atropine: can-repeat interval
  'stat, can repeat after 5 minutes',
  // Artemether/lumefantrine complex interval
  'First dose immediately, second dose after 8 hours, then 12 hourly for 2 days (total 6 doses in 3 days)',
  // Olanzapine complex dose with nested parentheticals
  '(5-10 mg (adults/pregnant) 2.5-5 mg (elderly/frail)',
  // Hepatitis B vaccine series
  '1dose/month x 3 months',
  // Magnesium sulfate rate limit
  'maximum rate of administration = 1g/7 minutes',
  // Diazepam interval with slash
  'daily/12 hourly',
  // Rotavirus vaccine: ambiguous mL dose
  '1 or 2 mL',
  // Paracetamol: complex dose with embedded frequency
  '500mg-1g 4-6 hourly to a maximum of 4g in 24 hours',
  // Valproate: complex dose with titration parenthetical
  '20-30mg/kg/day (titrated by 5mg/kg weekly. maximum daily dose = 40mg/kg/day)',
  // Trimethoprim: multi-strength dose
  '100/20 mg/ 200/40 mg/ 400/80 mg/ 800/160 mg',
  // Bupivacaine: text-only dose
  'maximum dose allowed for patient weight',
  'to desired volume to dilute bupivacaine',
  // IVIG
  'total of 2g/kg',
  // Magnesium Sulphate 50%
  '2g in 1ml',
  // Adrenaline
  '1:1000 mL soak gauze or apply directly',
  '2ml of 1:1000',
  '1ml of 1:1000',
  // Activated charcoal
  '1g/kg in 50-100ml water',
  // Bolus dose with duration
  'bolus dose over 1 hour',
  // Midazolam: malformed unclosed parenthetical
  '1-3 mg/kg/24 hours (up to 7 mg/kg/24 hours (maximum = 60mg/24 hours)',
  // Fluticasone spray dose
  '50mcg/spray. 1 spray',
  // Dextrose 50%: parenthetical concentration label
  '1 mL/kg',
  // Magnesium: complex dose with per_size collision
  '0.5-2.0 mmol/kg/day = 0.02-0.08 mmol/kg/hour',
  // Lidocaine: dose with two max parentheticals
  '1mg/kg (maximum = 100 mg/dose)(maximum = 3 mg/kg or 300 mg)',
  // Atropine: dose with bad encoding (kg2)
  '0.01 mg/kg2 mg (0.02 mg/mL)',
  // Phenobarbital: complex dose with nested min/max
  '0.02mg/kg (minimum = 0.1 mg. maximum = 0.5 mg (1 mg adolescents))',
  // Calcium/Potassium chloride: complex dose with per_size collision
  '1-2mmol/kg (recommended dose = 1.2 mmol/kg = 0.3 mmol/kg/hour for 4 hours)',
  'slow IV, over 4 hours (maximum rate of replacement = 0.5 mmol/kg/hour)',
  // Quinine: loading to maintenance dose with maint tag
  '1g over 10mins (loading) to 1g over 8 hours (maint)',
  // Salbutamol nebulization doses
  '5mg/ml in 2-4ml sodium chloride 0.9%',
  '0.15-0.3 mg/kg/dose in 2-4ml of sodium chloride 3%',
  // Rifampicin/Isoniazid fixed-ratio doses without units
  '150/75',
  '300/75',
  // Glycerine suppository volume/weight doses
  '0.891 mL/1.26 g suppository',
  '1.698 mL/2.4 g suppository',
  // ICU maintenance doses with rate
  '20-100 mcg; 50-100 mcg/h maintenance',
  '0.25-0.5 mg/kg; 0.05-0.4 mg/kg/h maintenance',
  '1-5 mg/h',
  '2-10 mg bolus; 2-5 mg/h maintenance',
  '5-50mcg/kg/min or 50-200mg/h',
])
