import { FINDING_SITE_FINDINGS } from '../shared/finding_site_findings.ts'
import { insertableFindingFullDisplay } from '../shared/patient_records.ts'

console.log(['label', 'finding_site_structure', 'clinical_finding_s_expression', 'display'].join('\t'))
for (const finding_site of FINDING_SITE_FINDINGS) {
  for (const clinical_finding_s_expression of finding_site.clinical_finding_s_expressions) {
    console.log([finding_site.label, finding_site.finding_site_structure, clinical_finding_s_expression, insertableFindingFullDisplay(clinical_finding_s_expression)].join('\t'))
  }
}