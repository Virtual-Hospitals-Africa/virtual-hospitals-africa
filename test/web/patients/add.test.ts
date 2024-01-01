import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorker,
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  getFormDisplay,
  getFormValues,
} from '../utilities.ts'
import * as cheerio from 'cheerio'
import db from '../../../db/db.ts'
import * as patients from '../../../db/models/patients.ts'
import * as patient_conditions from '../../../db/models/patient_conditions.ts'
import * as patient_allergies from '../../../db/models/patient_allergies.ts'
import * as address from '../../../db/models/address.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sample from '../../../util/sample.ts'
import { getPreExistingConditions } from '../../../db/models/patient_conditions.ts'
import omit from '../../../util/omit.ts'

describeWithWebServer('/app/patients/add', 8004, (route) => {
  it('loads the personal page', async () => {
    const { fetch } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })
    const response = await fetch(`${route}/app/patients/add?step=personal`)
    assert(response.ok, 'should have returned ok')
    assert(response.url === `${route}/app/patients/add?step=personal`)
    const pageContents = await response.text()

    const $ = cheerio.load(pageContents)
    assert($('input[name="first_name"]').length === 1)
    assert($('input[name="middle_names"]').length === 1)
    assert($('input[name="last_name"]').length === 1)
    assert($('input[name="nonexistant"]').length === 0)
  })

  it('supports POST on the personal step, moving you to the address step', async () => {
    const { fetch } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })
    const body = new FormData()
    body.set('first_name', 'Test')
    body.set('middle_names', 'Zoom Zoom')
    body.set('last_name', 'Patient')
    body.set('national_id_number', '08-123456 D 53')
    body.set('date_of_birth', '2020-01-01')
    body.set('gender', 'female')
    body.set('ethnicity', 'african')
    body.set('phone_number', '5555555555')
    const postResponse = await fetch(
      `${route}/app/patients/add?step=personal`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }

    const patients = await db.selectFrom('patients').selectAll().execute()
    assertEquals(patients.length, 1)
    assertEquals(patients[0].name, 'Test Zoom Zoom Patient')
    assertEquals(patients[0].national_id_number, '08-123456 D 53')

    assert(
      postResponse.url ===
        `${route}/app/patients/add?step=address&patient_id=${patients[0].id}`,
    )

    const getPersonalResponse = await fetch(
      `${route}/app/patients/add?step=personal&patient_id=${patients[0].id}`,
    )

    const pageContents = await getPersonalResponse.text()
    const $ = cheerio.load(pageContents)
    assertEquals($('input[name="first_name"]').val(), 'Test')
    assertEquals($('input[name="middle_names"]').val(), 'Zoom Zoom')
    assertEquals($('input[name="last_name"]').val(), 'Patient')
    assertEquals($('input[name="date_of_birth"]').val(), '2020-01-01')
    assertEquals($('select[name="gender"]').val(), 'female')
    assertEquals($('select[name="ethnicity"]').val(), 'african')
    assertEquals($('input[name="national_id_number"]').val(), '08-123456 D 53')
    assertEquals($('input[name="phone_number"]').val(), '5555555555')
  })

  it('supports POST on the address step, moving you to the pre-existing_conditions step', async () => {
    const patient = await patients.upsert(db, {
      name: 'Test Patient',
    })
    const testDoctor = await addTestHealthWorker({ scenario: 'doctor' })
    const { fetch } = await addTestHealthWorkerWithSession({
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

    const patientAddress = await db.selectFrom('address').selectAll().where(
      'address.id',
      '=',
      patientResult[0].address_id ? patientResult[0].address_id : null,
    ).execute()
    assertEquals(patientAddress[0].country_id, zimbabwe.id)
    assertEquals(patientAddress[0].province_id, province.id)
    assertEquals(patientAddress[0].ward_id, ward.id)
    assertEquals(patientAddress[0].suburb_id, suburb?.id || null)
    assertEquals(patientAddress[0].street, '120 Main Street')

    const getResponse = await fetch(
      `${route}/app/patients/add?step=address&patient_id=${patient.id}`,
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    assertEquals($('select[name="country_id"]').val(), String(zimbabwe.id))
    assertEquals($('select[name="province_id"]').val(), String(province.id))
    assertEquals($('select[name="ward_id"]').val(), String(ward.id))
    assertEquals(
      $('select[name="suburb_id"]').val(),
      suburb && String(suburb.id),
    )
    assertEquals($('input[name="street"]').val(), '120 Main Street')
  })

  it('supports POST of pre_existing_conditions on the pre-existing_conditions step, moving you to the history step', async () => {
    const patient = await patients.upsert(db, {
      name: 'Test Patient',
    })
    const { fetch } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })

    const tablet = await db.selectFrom('medications')
      .selectAll()
      .where(
        'medications.form_route',
        '=',
        'TABLET, COATED; ORAL',
      )
      .executeTakeFirstOrThrow()

    const drug = await db.selectFrom('drugs').select('generic_name').where(
      'id',
      '=',
      tablet.drug_id,
    ).executeTakeFirstOrThrow()

    const body = new FormData()
    body.set('pre_existing_conditions.0.key_id', 'c_4373')
    body.set('pre_existing_conditions.0.start_date', '1989-01-12')
    body.set('pre_existing_conditions.0.comorbidities.0.key_id', 'c_8321')
    body.set(
      'pre_existing_conditions.0.medications.0.medication_id',
      String(tablet.id),
    )
    body.set(
      'pre_existing_conditions.0.medications.0.strength',
      String(tablet.strength_numerators[0]),
    )
    body.set('pre_existing_conditions.0.medications.0.route', tablet.routes[0])
    body.set('pre_existing_conditions.0.medications.0.dosage', '2')
    body.set(
      'pre_existing_conditions.0.medications.0.intake_frequency',
      'qod',
    )

    const postResponse = await fetch(
      `${route}/app/patients/add?step=pre-existing_conditions&patient_id=${patient.id}`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assert(
      postResponse.url ===
        `${route}/app/patients/add?step=history&patient_id=${patient.id}`,
    )

    const pre_existing_conditions = await getPreExistingConditions(db, {
      patient_id: patient.id,
    })

    assertEquals(pre_existing_conditions.length, 1)
    const [preExistingCondition] = pre_existing_conditions
    assertEquals(preExistingCondition.key_id, 'c_4373')
    assertEquals(preExistingCondition.primary_name, 'Cigarette smoker')
    assertEquals(preExistingCondition.start_date, '1989-01-12')
    assertEquals(preExistingCondition.comorbidities.length, 1)
    assertEquals(preExistingCondition.comorbidities[0].key_id, 'c_8321')
    assertEquals(
      preExistingCondition.comorbidities[0].primary_name,
      'Coma - hyperosmolar nonketotic (HONK)',
    )
    assertEquals(preExistingCondition.comorbidities[0].start_date, '1989-01-12')
    assertEquals(preExistingCondition.medications.length, 1)
    assertEquals(preExistingCondition.medications[0].dosage, 2)
    assertEquals(
      preExistingCondition.medications[0].generic_name,
      drug.generic_name,
    )
    assertEquals(
      preExistingCondition.medications[0].intake_frequency,
      'qod',
    )
    assertEquals(preExistingCondition.medications[0].medication_id, 1)
    assertEquals(
      preExistingCondition.medications[0].strength,
      150,
    )

    const getResponse = await fetch(
      `${route}/app/patients/add?step=pre-existing_conditions&patient_id=${patient.id}`,
      {},
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    const formDisplay = getFormDisplay($)
    assertEquals(
      // deno-lint-ignore no-explicit-any
      omit(formValues as any, ['allergy_search']),
      { pre_existing_conditions },
      'The form should be 1:1 with the conditions in the DB',
    )
    assertEquals(formDisplay, {
      allergy_search: '',
      pre_existing_conditions: [
        {
          primary_name: 'Cigarette smoker',
          start_date: '1989-01-12',
          comorbidities: [
            {
              primary_name: 'Coma - hyperosmolar nonketotic (HONK)',
              start_date: '1989-01-12',
            },
          ],
          medications: [
            {
              generic_name: drug.generic_name,
              start_date: '1989-01-12',
              end_date: null,
              medication_id: 'TABLET, COATED; ORAL',
              strength: '150MG/TABLET',
              dosage: '2 TABLETS (300MG)',
              intake_frequency: 'alternate days',
              special_instructions: null,
            },
          ],
        },
      ],
    }, 'The form should display the medications in a human-readable format')
  })

  it('supports POST of allergies on the pre-existing_conditions step, moving you to the history step', async () => {
    const patient = await patients.upsert(db, {
      name: 'Test Patient',
    })
    const { fetch } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })

    const body = new FormData()
    body.set('allergies.0.allergy_id', '7')
    body.set('allergies.1.allergy_id', '13')

    const postResponse = await fetch(
      `${route}/app/patients/add?step=pre-existing_conditions&patient_id=${patient.id}`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assert(
      postResponse.url ===
        `${route}/app/patients/add?step=history&patient_id=${patient.id}`,
    )

    const allergies = await patient_allergies.get(db, patient.id)

    assertEquals(allergies.length, 2)
    assertEquals(allergies[0].allergy_id, 7)
    assertEquals(allergies[1].allergy_id, 13)

    const getResponse = await fetch(
      `${route}/app/patients/add?step=pre-existing_conditions&patient_id=${patient.id}`,
      {},
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    assertEquals(
      // deno-lint-ignore no-explicit-any
      omit(formValues as any, ['allergy_search']),
      { allergies },
      'The form should be 1:1 with the conditions in the DB',
    )
  })

  it('can remove all pre_existing_conditions on POST', async () => {
    const patient = await patients.upsert(db, {
      name: 'Test Patient',
    })
    const { fetch } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })

    await patient_conditions.upsertPreExisting(db, patient.id, [
      {
        key_id: 'c_4373',
        start_date: '1989-01-12',
      },
    ])

    const postResponse = await fetch(
      `${route}/app/patients/add?step=pre-existing_conditions&patient_id=${patient.id}`,
      {
        method: 'POST',
        body: new FormData(),
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assert(
      postResponse.url ===
        `${route}/app/patients/add?step=history&patient_id=${patient.id}`,
    )

    const pre_existing_conditions = await getPreExistingConditions(db, {
      patient_id: patient.id,
    })

    assertEquals(pre_existing_conditions.length, 0)
  })

  it('handles holes in an array of pre_existing_conditions on POST', async () => {
    const patient = await patients.upsert(db, {
      name: 'Test Patient',
    })
    const { fetch } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })

    const tablet = await db.selectFrom('medications')
      .selectAll()
      .where(
        'medications.form_route',
        '=',
        'TABLET, COATED; ORAL',
      )
      .executeTakeFirstOrThrow()

    const drug = await db.selectFrom('drugs').select('generic_name').where(
      'id',
      '=',
      tablet.drug_id,
    ).executeTakeFirstOrThrow()

    const body = new FormData()
    body.set('pre_existing_conditions.1.key_id', 'c_4373')
    body.set('pre_existing_conditions.1.start_date', '1989-01-12')
    body.set('pre_existing_conditions.1.comorbidities.0.key_id', 'c_8321')
    body.set(
      'pre_existing_conditions.1.medications.0.medication_id',
      String(tablet.id),
    )
    body.set(
      'pre_existing_conditions.1.medications.0.strength',
      String(tablet.strength_numerators[0]),
    )
    body.set('pre_existing_conditions.1.medications.0.route', tablet.routes[0])
    body.set('pre_existing_conditions.1.medications.0.dosage', '2')
    body.set(
      'pre_existing_conditions.1.medications.0.intake_frequency',
      'qod',
    )

    const postResponse = await fetch(
      `${route}/app/patients/add?step=pre-existing_conditions&patient_id=${patient.id}`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assert(
      postResponse.url ===
        `${route}/app/patients/add?step=history&patient_id=${patient.id}`,
    )

    const pre_existing_conditions = await getPreExistingConditions(db, {
      patient_id: patient.id,
    })

    assertEquals(pre_existing_conditions.length, 1)
    const [preExistingCondition] = pre_existing_conditions
    assertEquals(preExistingCondition.key_id, 'c_4373')
    assertEquals(preExistingCondition.primary_name, 'Cigarette smoker')
    assertEquals(preExistingCondition.start_date, '1989-01-12')
    assertEquals(preExistingCondition.comorbidities.length, 1)
    assertEquals(preExistingCondition.comorbidities[0].key_id, 'c_8321')
    assertEquals(
      preExistingCondition.comorbidities[0].primary_name,
      'Coma - hyperosmolar nonketotic (HONK)',
    )
    assertEquals(preExistingCondition.comorbidities[0].start_date, '1989-01-12')
    assertEquals(preExistingCondition.medications.length, 1)
    assertEquals(preExistingCondition.medications[0].dosage, 2)
    assertEquals(
      preExistingCondition.medications[0].generic_name,
      drug.generic_name,
    )
    assertEquals(
      preExistingCondition.medications[0].intake_frequency,
      'qod',
    )
    assertEquals(preExistingCondition.medications[0].medication_id, 1)
    assertEquals(
      preExistingCondition.medications[0].strength,
      150,
    )
  })
})
