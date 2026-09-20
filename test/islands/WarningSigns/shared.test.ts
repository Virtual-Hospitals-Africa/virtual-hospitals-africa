import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { CATEGORIES, CheckedWarningSign, findChecked, searchRouteFor, signsToDisplay, tableCategories } from '../../../islands/WarningSigns/shared.ts'
import { FindingSiteWithMaybeRecords, WarningSignWithMaybeRecord } from '../../../types.ts'

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

function checked(base: WarningSignWithMaybeRecord): CheckedWarningSign {
  return { ...base, entered: { s_expression: base.clinical_finding_s_expression, display: base.name }, saving: false }
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
    it("sends the site's excluding_structures as JSON, so a name with a comma survives", () => {
      const head: FindingSiteWithMaybeRecords = {
        label: 'Head',
        snomed_concept: { name: 'Head structure', category: 'body structure' },
        excluding_structures: ['Ear structure', 'Tooth, gum, and/or supporting structure'],
        signs: [headache],
      }
      const route = searchRouteFor('/app/snomed/warning-signs?age_determination=adult', head)
      assertEquals(
        new URL(route, 'https://example.com').searchParams.get('excluding_structures'),
        '["Ear structure","Tooth, gum, and/or supporting structure"]',
      )
    })
  })

  describe('searchRouteFor including_s_expressions', () => {
    it("sends the site's including_s_expressions as JSON under their own name", () => {
      const eye: FindingSiteWithMaybeRecords = {
        label: 'Eye',
        snomed_concept: { name: 'Structure of eye proper', category: 'body structure' },
        excluding_structures: [],
        including_s_expressions: ['(finding (finding_site "Structure of visual system"))', '(finding (interprets "Visual function"))'],
        signs: [],
      }
      const params = new URL(searchRouteFor('/app/snomed/warning-signs?age_determination=adult', eye), 'https://example.com').searchParams
      assertEquals(
        params.get('including_s_expressions'),
        '["(finding (finding_site \\"Structure of visual system\\"))","(finding (interprets \\"Visual function\\"))"]',
      )
      assertEquals(params.get('excluding_structures'), null)
    })
  })

  describe('findChecked', () => {
    it('finds the checked sign that is the same sign', () => {
      const checked_headache = checked(headache)
      assertEquals(findChecked([checked_headache], headache), checked_headache)
      assertEquals(findChecked([checked_headache], fever), undefined)
    })
    it('finds a checked sign of another category standing for the same saved record', () => {
      const prior = checked(sign('Prior record', 'Pain of ear', { id: 'record-1', existence: 'Yes' }))
      const in_ear_table = { ...pain_of_ear, existing_record: { id: 'record-1', existence: 'Yes' as const } }
      assertEquals(findChecked([prior], in_ear_table), prior)
      assertEquals(findChecked([prior], pain_of_ear), undefined)
    })
  })
})
