import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { route } from '../../_route.ts'

const recommended_medications_url = route +
  '/clinical_decision_support_tools/recommended_dose_calculator/recommended_medications'

const valid_patient_case = {
  dob: '1988-10-10',
  sex: 'male',
  height_cm: '188',
  weight_kg: '88',
  snomed_concept_ids: '44054006, 195967001',
}

function urlWithParams(params: Record<string, string>) {
  const search = new URLSearchParams(params)
  return `${recommended_medications_url}?${search.toString()}`
}

describeParallel('/clinical_decision_support_tools/recommended_dose_calculator/recommended_medications', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel('prompts for missing patient details when no query params are provided', async () => {
    const response = await fetch(recommended_medications_url)
    assert(response.ok, `expected 200, got ${response.status}`)
    const body = await response.text()
    assert(body.includes('Missing patient details'))
    assert(body.includes('Date of Birth, Sex, Height and Weight are required'))
    assert(body.includes('/clinical_decision_support_tools/recommended_dose_calculator/create_patient_case'))
  })

  itParallel('prompts for missing patient details when required fields are incomplete', async () => {
    const response = await fetch(urlWithParams({
      dob: '1988-10-10',
      sex: '',
      height_cm: '188',
      weight_kg: '88',
    }))
    assert(response.ok, `expected 200, got ${response.status}`)
    assert((await response.text()).includes('Missing patient details'))
  })

  itParallel('maps SNOMED concept ids to ICD-10 for a valid patient case', async () => {
    const response = await fetch(urlWithParams(valid_patient_case))
    assert(response.ok, `expected 200, got ${response.status}`)
    const body = await response.text()
    assert(body.includes('E11.9'), 'expected ICD-10 code E11.9 from SNOMED 44054006')
    assert(body.includes('J45.9'), 'expected ICD-10 code J45.9 from SNOMED 195967001')
    assert(
      body.includes('SNOMED 44054006, 195967001'),
      'expected SNOMED concept ids in mapping summary',
    )
  })

  itParallel('renders patient details and recommended medications for a valid patient case', async () => {
    const response = await fetch(urlWithParams(valid_patient_case))
    assert(response.ok, `expected 200, got ${response.status}`)
    const body = await response.text()
    assert(body.includes('Patient Details'))
    assert(body.includes('Conditions'))
    assert(body.includes('Recommended Medications'))
    assert(body.includes('1988-10-10'))
    assert(body.includes('male'))
    assert(
      !body.includes('No recommended medications found for the specified conditions.'),
      'expected recommended medications for mapped ICD-10 conditions',
    )
    assert(body.match(/Recommended Medications[\s\S]*?\(\d+\)/), 'expected a medication count when matches exist')
  })

  itParallel('reports no recommended medications when no conditions are specified', async () => {
    const response = await fetch(urlWithParams({
      dob: '1988-10-10',
      sex: 'male',
      height_cm: '188',
      weight_kg: '88',
    }))
    assert(response.ok, `expected 200, got ${response.status}`)
    const body = await response.text()
    assert(body.includes('No conditions specified.'))
  })
})
