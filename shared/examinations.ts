export const EXAMINATIONS = [
  'Head-to-toe Assessment' as const,
  "Women's Health Assessment" as const,
  'Maternity Assessment' as const,
  "Men's Health Assessment" as const,
  'Mental Health Assessment' as const,
  'Child Health Assessment' as const,
  'Gastroenterology' as const,
  'Endocrine' as const,
  'Osteopathy' as const,
  'Trauma' as const,
  'Oncology' as const,
  'Dental' as const,
  'Otolaryngology' as const,
  'Immunology' as const,
  'Urology' as const,
  'Gynecological' as const,
  'Neurology' as const,
  'Anesthetic' as const,
  'Obstetric' as const,
  'Ophthalmology' as const,
  'Geriatric' as const,
  'Pulmonology' as const,
  'Haematology' as const,
  'Dermatology' as const,
  'Paediatric' as const,
  'Rheumatology' as const,
  'Vascular' as const,
  'Cardiology' as const,
  'Psychiatry' as const,
  'Maxillofacial' as const,
  'Nephrology' as const,
]

export type Examination = typeof EXAMINATIONS[number]

/*  SQL to get all examination findings
    select examination_findings.name,
           examination_name,
           category,
           examination_findings.type,
           required,
           options,
           ask_dependent_on,
           ask_dependent_values
      from examination_findings
      join examination_categories on examination_findings.examination_category_id = examination_categories.id
      join examinations on examination_categories.examination_name = examinations.name
  order by examinations.order asc,
           examination_categories.order asc,
           examination_findings.order asc
*/
