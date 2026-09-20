import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { CATEGORIES, findRecorded, searchRouteFor, signsToDisplay, tableCategories, uniqueIdentifier } from '../../../islands/WarningSigns/shared.ts'
import { FindingSiteWithMaybeRecords, RecordedFinding, WarningSignWithMaybeRecord } from '../../../types.ts'

const finding = (name: string) => `(clinical_finding (snomed_concept "${name}" "finding"))`

function sign(category: string, name: string, existing_record?: WarningSignWithMaybeRecord['existing_record']): WarningSignWithMaybeRecord {
  return {
    category,
    key: name,
    name,
    description: null,
    clinical_finding_s_expression: finding(name),
    predefined_attributes: [],
    relevant_qualifiers: [],
    onset_required: false,
    existing_record,
  }
}

// The sign as recorded on this visit: keyed by the sign, entered as the sign names it
function recorded(base: WarningSignWithMaybeRecord, record_id = `${base.name}-id`, s_expression = base.clinical_finding_s_expression): RecordedFinding {
  return { key: uniqueIdentifier(base), entered: { s_expression, display: base.name }, record_id, saving: false }
}

const headache = sign('Common Symptoms', 'Headache')
const fever = sign('Common Symptoms', 'Fever')
const pain_of_ear = sign('Ear', 'Pain of ear')
const ear: FindingSiteWithMaybeRecords = {
  label: 'Ear',
  snomed_concept: { name: 'Ear structure', category: 'body structure' },
  excluding_structures: [],
  signs: [pain_of_ear, sign('Ear', 'Tinnitus')],
}

describe('islands/WarningSigns/shared.ts', () => {
  describe('signsToDisplay', () => {
    it('shows the warning signs when nothing is searched or filtered', () => {
      assertEquals(signsToDisplay({ search_results: null, finding_site: null, warning_signs: [headache, fever] }), [headache, fever])
    })
    it("shows a chosen finding site's signs in place of the warning signs", () => {
      assertEquals(signsToDisplay({ search_results: null, finding_site: ear, warning_signs: [headache, fever] }), ear.signs)
    })
    it('shows search results ahead of either', () => {
      const results = [sign('Search Results', 'Otalgia')]
      assertEquals(signsToDisplay({ search_results: results, finding_site: ear, warning_signs: [headache, fever] }), results)
    })
  })

  describe('tableCategories', () => {
    it('is the usual categories with no finding site chosen', () => {
      assertEquals(tableCategories(null), CATEGORIES)
    })
    it('is search results and the finding site, headed by its label, when one is chosen', () => {
      assertEquals(tableCategories(ear), [
        { category: 'Search Results', priority: null },
        { category: 'Ear', priority: null },
      ])
    })
  })

  describe('searchRouteFor', () => {
    it('leaves the route alone with no finding site chosen', () => {
      assertEquals(searchRouteFor('/app/snomed/warning-signs?age_determination=adult', null), '/app/snomed/warning-signs?age_determination=adult')
    })
    it('adds the finding site by name when one is chosen', () => {
      assertEquals(
        searchRouteFor('/app/snomed/warning-signs?age_determination=adult', ear),
        '/app/snomed/warning-signs?age_determination=adult&finding_site=Ear+structure',
      )
    })
  })

  describe('findRecorded', () => {
    it('finds the finding recorded under the sign itself', () => {
      const recorded_headache = recorded(headache)
      assertEquals(findRecorded([recorded_headache], headache), recorded_headache)
      assertEquals(findRecorded([recorded_headache], fever), undefined)
    })
    it('finds a finding recorded under a sign of another category standing for the same saved record', () => {
      const prior = recorded(sign('Prior record', 'Pain of ear', { id: 'record-1', existence: 'Yes' }), 'record-1')
      const in_ear_table = { ...pain_of_ear, existing_record: { id: 'record-1', existence: 'Yes' as const } }
      assertEquals(findRecorded([prior], in_ear_table), prior)
    })
    it('finds a finding entered as the very finding the sign names, as a follow up checked from the panel is', () => {
      const from_panel: RecordedFinding = {
        key: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain of ear" "finding"))',
        entered: { s_expression: pain_of_ear.clinical_finding_s_expression, display: 'Pain of ear' },
        record_id: 'record-2',
        saving: false,
      }
      assertEquals(findRecorded([from_panel], pain_of_ear), from_panel)
      assertEquals(findRecorded([from_panel], headache), undefined)
    })
    it('does not take a sign with a record for a finding recorded under another sign', () => {
      const prior = recorded(sign('Prior record', 'Tinnitus'), 'record-1')
      assertEquals(findRecorded([prior], pain_of_ear), undefined)
    })
  })
})
