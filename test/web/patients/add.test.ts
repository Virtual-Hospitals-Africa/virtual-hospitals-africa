import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorker,
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from '../utilities.ts'
import * as cheerio from 'cheerio'
import db from '../../../db/db.ts'
import * as patients from '../../../db/models/patients.ts'
import * as address from '../../../db/models/address.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sample from '../../../util/sample.ts'

// Works around incorrect typedefs in the cheerio package
// deno-lint-ignore no-explicit-any
const loadHtml: typeof cheerio.load = (cheerio as any).cheerio.load

describeWithWebServer('/app/patients/add', 8004, (route) => {
  it('loads the personal page', async () => {
    const { sessionId } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })
    const response = await fetch(`${route}/app/patients/add?step=personal`, {
      headers: {
        Cookie: `sessionId=${sessionId}`,
      },
    })
    assert(response.ok, 'should have returned ok')
    assert(response.url === `${route}/app/patients/add?step=personal`)
    const pageContents = await response.text()

    const $ = loadHtml(pageContents)
    assert($('input[name="first_name"]').length === 1)
    assert($('input[name="middle_names"]').length === 1)
    assert($('input[name="last_name"]').length === 1)
    assert($('input[name="foo"]').length === 0)
  })

  it('supports POST on the personal step, moving you to the address step', async () => {
    const { sessionId } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })
    const body = new FormData()
    body.set('first_name', 'Test')
    body.set('middle_names', 'Zoom Zoom')
    body.set('last_name', 'Patient')
    body.set('national_id_number', '08- 123456 D 53')
    body.set('date_of_birth', '2020-01-01')
    body.set('gender', 'female')
    body.set('phone_number', '5555555555')
    const postResponse = await fetch(
      `${route}/app/patients/add?step=personal`,
      {
        method: 'POST',
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }

    const patients = await db.selectFrom('patients').selectAll().execute()
    assertEquals(patients.length, 1)
    assertEquals(patients[0].name, 'Test Zoom Zoom Patient')
    assertEquals(patients[0].national_id_number, '08- 123456 D 53')

    assert(
      postResponse.url ===
        `${route}/app/patients/add?step=address&patient_id=${patients[0].id}`,
    )

    const getPersonalResponse = await fetch(
      `${route}/app/patients/add?step=personal&patient_id=${patients[0].id}`,
      {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      },
    )

    const pageContents = await getPersonalResponse.text()
    const $ = loadHtml(pageContents)
    assertEquals($('input[name="first_name"]').val(), 'Test')
    assertEquals($('input[name="middle_names"]').val(), 'Zoom Zoom')
    assertEquals($('input[name="last_name"]').val(), 'Patient')
    assertEquals($('input[name="date_of_birth"]').val(), '2020-01-01')
    assertEquals($('select[name="gender"]').val(), 'female')
    assertEquals($('input[name="national_id_number"]').val(), '08- 123456 D 53')
    assertEquals($('input[name="phone_number"]').val(), '5555555555')
  })

  it('supports POST on the address step, moving you to the pre-existing_conditions step', async () => {
    const patient = await patients.upsert(db, {
      name: 'Test Patient',
    })
    const testDoctor = await addTestHealthWorker({ scenario: 'doctor' })
    const { sessionId } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })
    const countryInfo = await address.getFullCountryInfo(db)
    const zimbabwe = countryInfo[0]
    assertEquals(zimbabwe.name, 'Zimbabwe')

    const province = sample(zimbabwe.provinces)
    const district = sample(province.districts)
    const ward = sample(district.wards)
    const suburb = ward.suburbs.length ? sample(ward.suburbs) : undefined

    const body = new FormData()
    body.set('country_id', String(zimbabwe.id))
    body.set('province_id', String(province.id))
    body.set('district_id', String(district.id))
    body.set('ward_id', String(ward.id))
    if (suburb) body.set('suburb_id', String(suburb.id))
    body.set('street', '120 Main Street')
    body.set('nearest_facility_id', '5')
    body.set('primary_doctor_id', String(testDoctor.id))

    const postResponse = await fetch(
      `${route}/app/patients/add?step=address&patient_id=${patient.id}`,
      {
        method: 'POST',
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assert(
      postResponse.url ===
        `${route}/app/patients/add?step=pre-existing_conditions&patient_id=${patient.id}`,
    )

    const patientResult = await db.selectFrom('patients').selectAll().execute()
    assertEquals(patientResult.length, 1)
    assertEquals(patientResult[0].name, 'Test Patient')
    assertEquals(patientResult[0].country_id, zimbabwe.id)
    assertEquals(patientResult[0].province_id, province.id)
    assertEquals(patientResult[0].ward_id, ward.id)
    assertEquals(patientResult[0].suburb_id, suburb?.id || null)
    assertEquals(patientResult[0].street, '120 Main Street')

    const getAddressResponse = await fetch(
      `${route}/app/patients/add?step=address&patient_id=${patient.id}`,
      {
        headers: {
          Cookie: `sessionId=${sessionId}`,
        },
      },
    )

    const pageContents = await getAddressResponse.text()
    const $ = loadHtml(pageContents)
    assertEquals($('select[name="country_id"]').val(), String(zimbabwe.id))
    assertEquals($('select[name="province_id"]').val(), String(province.id))
    assertEquals($('select[name="ward_id"]').val(), String(ward.id))
    assertEquals(
      $('select[name="suburb_id"]').val(),
      suburb && String(suburb.id),
    )
    assertEquals($('input[name="street"]').val(), '120 Main Street')
  })
})
