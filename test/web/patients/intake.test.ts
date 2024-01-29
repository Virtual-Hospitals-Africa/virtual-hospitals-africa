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
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import * as patient_conditions from '../../../db/models/patient_conditions.ts'
import * as patient_allergies from '../../../db/models/patient_allergies.ts'
import * as address from '../../../db/models/address.ts'
import * as family from '../../../db/models/family.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sample from '../../../util/sample.ts'
import { getPreExistingConditions } from '../../../db/models/patient_conditions.ts'
import deepOmit from '../../../util/deepOmit.ts'
import * as patient_occupations from '../../../db/models/patient_occupations.ts'
import { randomNationalId, randomPhoneNumber } from '../../mocks.ts'

describeWithWebServer('/app/patients/[patient_id]/intake', 8004, (route) => {
  it('loads the personal page', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })
    const response = await fetch(
      `${route}/app/patients/${patient_id}/intake/personal`,
    )
    assert(response.ok, 'should have returned ok')
    assert(
      response.url === `${route}/app/patients/${patient_id}/intake/personal`,
    )
    const pageContents = await response.text()

    const $ = cheerio.load(pageContents)
    assert($('input[name="first_name"]').length === 1)
    assert($('input[name="middle_names"]').length === 1)
    assert($('input[name="last_name"]').length === 1)
    assert($('input[name="nonexistant"]').length === 0)
  })

  it('supports POST on the personal step, moving you to the address step', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })
    const national_id_number = randomNationalId()
    const phone_number = randomPhoneNumber()
    const body = new FormData()
    body.set('first_name', 'Test')
    body.set('middle_names', 'Zoom Zoom')
    body.set('last_name', 'Patient')
    body.set('national_id_number', national_id_number)
    body.set('date_of_birth', '2020-01-01')
    body.set('gender', 'female')
    body.set('ethnicity', 'african')
    body.set('phone_number', phone_number)
    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/personal`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }

    const patients_after_update = await db.selectFrom('patients').where(
      'id',
      '=',
      patient_id,
    ).selectAll()
      .execute()
    assertEquals(patients_after_update.length, 1)
    assertEquals(patients_after_update[0].name, 'Test Zoom Zoom Patient')
    assertEquals(
      patients_after_update[0].national_id_number,
      national_id_number,
    )

    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/address`,
    )

    const getPersonalResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/personal`,
    )

    const pageContents = await getPersonalResponse.text()
    const $ = cheerio.load(pageContents)
    assertEquals($('input[name="first_name"]').val(), 'Test')
    assertEquals($('input[name="middle_names"]').val(), 'Zoom Zoom')
    assertEquals($('input[name="last_name"]').val(), 'Patient')
    assertEquals($('input[name="date_of_birth"]').val(), '2020-01-01')
    assertEquals($('select[name="gender"]').val(), 'female')
    assertEquals($('select[name="ethnicity"]').val(), 'african')
    assertEquals(
      $('input[name="national_id_number"]').val(),
      national_id_number,
    )
    assertEquals($('input[name="phone_number"]').val(), phone_number)
  })

  it('supports POST on the address step, moving you to the conditions step', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })
    const testDoctor = await addTestHealthWorker(db, { scenario: 'doctor' })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
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
    body.set('address.country_id', String(zimbabwe.id))
    body.set('address.province_id', String(province.id))
    body.set('address.district_id', String(district.id))
    body.set('address.ward_id', String(ward.id))
    if (suburb) body.set('address.suburb_id', String(suburb.id))
    body.set('address.street', '120 Main Street')
    body.set('nearest_facility_id', '5')
    body.set('primary_doctor_id', String(testDoctor.id))

    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/address`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/conditions`,
    )

    const patientResult = await db.selectFrom('patients').where(
      'id',
      '=',
      patient_id,
    ).selectAll().execute()
    assertEquals(patientResult.length, 1)
    assertEquals(patientResult[0].name, 'Test Patient')

    const patientAddress = await db.selectFrom('address').selectAll().where(
      'address.id',
      '=',
      patientResult[0].address_id ? patientResult[0].address_id : null,
    ).execute()
    assertEquals(patientAddress[0].country_id, zimbabwe.id)
    assertEquals(patientAddress[0].province_id, province.id)
    assertEquals(patientAddress[0].district_id, district.id)
    assertEquals(patientAddress[0].ward_id, ward.id)
    assertEquals(patientAddress[0].suburb_id, suburb?.id || null)
    assertEquals(patientAddress[0].street, '120 Main Street')

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/address`,
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    assertEquals(
      $('input[name="address.country_id"]').val(),
      String(zimbabwe.id),
    )
    assertEquals(
      $('select[name="address.province_id"]').val(),
      String(province.id),
    )
    assertEquals(
      $('select[name="address.district_id"]').val(),
      String(district.id),
    )
    assertEquals($('select[name="address.ward_id"]').val(), String(ward.id))
    assertEquals(
      $('select[name="address.suburb_id"]').val(),
      suburb && String(suburb.id),
    )
    assertEquals($('input[name="address.street"]').val(), '120 Main Street')
  })

  it('supports POST of pre_existing_conditions on the conditions step, moving you to the history step', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
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
    body.set('pre_existing_conditions.0.id', 'c_4373')
    body.set('pre_existing_conditions.0.start_date', '1989-01-12')
    body.set('pre_existing_conditions.0.comorbidities.0.id', 'c_8321')
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
      `${route}/app/patients/${patient_id}/intake/conditions`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }

    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/history`,
    )

    const pre_existing_conditions = await getPreExistingConditions(db, {
      patient_id,
    })

    assertEquals(pre_existing_conditions.length, 1)
    const [preExistingCondition] = pre_existing_conditions
    assertEquals(preExistingCondition.id, 'c_4373')
    assertEquals(preExistingCondition.name, 'Cigarette smoker')
    assertEquals(preExistingCondition.start_date, '1989-01-12')
    assertEquals(preExistingCondition.comorbidities.length, 1)
    assertEquals(preExistingCondition.comorbidities[0].id, 'c_8321')
    assertEquals(
      preExistingCondition.comorbidities[0].name,
      'Coma - hyperosmolar nonketotic (HONK)',
    )
    assertEquals(preExistingCondition.comorbidities[0].start_date, '1989-01-12')
    assertEquals(preExistingCondition.medications.length, 1)
    assertEquals(preExistingCondition.medications[0].dosage, 2)
    assertEquals(
      preExistingCondition.medications[0].name,
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
      `${route}/app/patients/${patient_id}/intake/conditions`,
      {},
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    const formDisplay = getFormDisplay($)
    assertEquals(
      formValues,
      deepOmit({ pre_existing_conditions }, [
        'patient_condition_id',
        'patient_condition_medication_id',
      ]),
      'The form should be 1:1 with the conditions in the DB',
    )
    assertEquals(formDisplay, {
      pre_existing_conditions: [
        {
          name: 'Cigarette smoker',
          start_date: '1989-01-12',
          comorbidities: [
            {
              name: 'Coma - hyperosmolar nonketotic (HONK)',
              start_date: '1989-01-12',
            },
          ],
          medications: [
            {
              name: drug.generic_name,
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

  it('supports POST of allergies on the conditions step, moving you to the history step', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    const body = new FormData()
    body.set('allergies.0.id', '7')
    body.set('allergies.1.id', '13')

    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/conditions`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/history`,
    )

    const allergies = await patient_allergies.get(db, patient_id)

    assertEquals(allergies.length, 2)
    assertEquals(allergies[0].id, 7)
    assertEquals(allergies[1].id, 13)

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/conditions`,
      {},
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    assertEquals(
      formValues,
      { allergies },
      'The form should be 1:1 with the conditions in the DB',
    )
  })

  it('can remove all pre_existing_conditions on POST', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    await patient_conditions.upsertPreExisting(db, patient_id, [
      {
        id: 'c_4373',
        start_date: '1989-01-12',
      },
    ])

    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/conditions`,
      {
        method: 'POST',
        body: new FormData(),
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/history`,
    )

    const pre_existing_conditions = await getPreExistingConditions(db, {
      patient_id: patient_id,
    })

    assertEquals(pre_existing_conditions.length, 0)
  })

  it('handles holes in an array of pre_existing_conditions on POST', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
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
    body.set('pre_existing_conditions.1.id', 'c_4373')
    body.set('pre_existing_conditions.1.start_date', '1989-01-12')
    body.set('pre_existing_conditions.1.comorbidities.0.id', 'c_8321')
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
      `${route}/app/patients/${patient_id}/intake/conditions`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/history`,
    )

    const pre_existing_conditions = await getPreExistingConditions(db, {
      patient_id: patient_id,
    })

    assertEquals(pre_existing_conditions.length, 1)
    const [preExistingCondition] = pre_existing_conditions
    assertEquals(preExistingCondition.id, 'c_4373')
    assertEquals(preExistingCondition.name, 'Cigarette smoker')
    assertEquals(preExistingCondition.start_date, '1989-01-12')
    assertEquals(preExistingCondition.comorbidities.length, 1)
    assertEquals(preExistingCondition.comorbidities[0].id, 'c_8321')
    assertEquals(
      preExistingCondition.comorbidities[0].name,
      'Coma - hyperosmolar nonketotic (HONK)',
    )
    assertEquals(preExistingCondition.comorbidities[0].start_date, '1989-01-12')
    assertEquals(preExistingCondition.medications.length, 1)
    assertEquals(preExistingCondition.medications[0].dosage, 2)
    assertEquals(
      preExistingCondition.medications[0].name,
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

  it('supports POST on the family step, moving you to the lifestyle step', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })
    await patients.upsert(db, {
      id: patient_id,
      date_of_birth: '2020-01-01',
    })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })
    const guardian_phone = randomPhoneNumber()
    const body = new FormData()
    body.set('family.guardians.0.patient_name', 'New Guardian')
    body.set('family.guardians.0.family_relation_gendered', 'biological mother')
    body.set('family.guardians.0.patient_phone_number', guardian_phone)
    body.set('family.marital_status', 'Single')
    body.set('family.religion', 'Non-Religious')
    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/family`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/lifestyle`,
    )

    const patient_family = await family.get(db, { patient_id })

    assertEquals(patient_family.dependents.length, 0)
    assertEquals(patient_family.guardians.length, 1)
    assertEquals(patient_family.guardians[0].patient_name, 'New Guardian')
    assertEquals(
      patient_family.guardians[0].family_relation_gendered,
      'biological mother',
    )
    assertEquals(
      patient_family.guardians[0].patient_phone_number,
      guardian_phone,
    )
    assertEquals(patient_family.guardians[0].patient_gender, 'female')
    assertEquals(patient_family.religion, 'Non-Religious')
    assertEquals(patient_family.marital_status, 'Single')

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/family`,
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    assertEquals(formValues, {
      family: {
        guardians: [
          {
            family_relation_gendered: 'biological mother',
            next_of_kin: false,
            patient_id: patient_family.guardians[0].patient_id,
            patient_name: 'New Guardian',
            patient_phone_number: Number(guardian_phone),
          },
        ],
        home_satisfaction: null,
        spiritual_satisfaction: null,
        social_satisfaction: null,
        religion: 'Non-Religious',
        family_type: null,
        marital_status: 'Single',
        patient_cohabitation: null,
      },
    })
  })

  it('redirects you to the personal step if no DOB was yet filled out and you try to access occupation', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })

    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/occupation`,
      {},
    )

    assertEquals(
      getResponse.url,
      `${route}/app/patients/${patient_id}/intake/personal?warning=Please%20fill%20out%20the%20patient%27s%20personal%20information%20beforehand.`,
    )
  })

  it('supports POST on the occupation step(0-18), moving you to the family step', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient',
      reason: 'seeking treatment',
    })

    await patients.upsert(db, {
      id: patient_id,
      date_of_birth: '2020-01-01',
    })

    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    const body = new FormData()
    body.set('occupation.school.status', 'in school')
    body.set('occupation.school.current.inappropriate_reason', 'Change of town')
    body.set(
      'occupation.school.current.grades_dropping_reason',
      'Abuse',
    )
    //body.set('occupation.sport', 'on')
    body.set('occupation.school.current.grade', 'Grade 3')
    body.set('occupation.school.current.happy', 'on')

    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/occupation`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/family`,
    )

    const occupation = await patient_occupations.get(db, {
      patient_id,
    })
    assert(occupation)
    assertEquals(occupation, {
      school: {
        current: {
          grade: 'Grade 3',
          grades_dropping_reason: 'Abuse',
          happy: true,
          inappropriate_reason: 'Change of town',
        },
        status: 'in school',
      },
    })

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/occupation`,
      {},
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    assertEquals(
      formValues,
      {
        occupation: {
          school: {
            current: {
              grade: 'Grade 3',
              grades_dropping_reason: 'Abuse',
              happy: true,
              inappropriate_reason: 'Change of town',
            },
            status: 'in school',
          },
        },
        omit: {
          grades_dropping: true,
          patient_goes_to_school: true,
          school: {
            appropriate: null,
          },
        },
      },
      'The form should be 1:1 with the occupations in the DB',
    )
  })

  it('supports POST on the occupation step(19+), moving you to the family step', async () => {
    const { patient_id } = await patient_encounters.upsert(db, 1, {
      patient_name: 'Test Patient 19',
      reason: 'seeking treatment',
    })

    await patients.upsert(db, {
      id: patient_id,
      date_of_birth: '2000-01-01',
    })

    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    const body = new FormData()
    body.set('occupation.school.status', 'adult in school')
    body.set('occupation.job.happy', 'on')
    body.set(
      'occupation.job.descendants_employed',
      'on',
    )
    body.set('occupation.job.require_assistance', 'on')
    body.set('occupation.job.profession', 'Accountant')
    body.set('occupation.job.work_satisfaction', 'Excellent')
    body.set('occupation.school.education_level', 'Elementary School')

    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/occupation`,
      {
        method: 'POST',
        body,
      },
    )

    if (!postResponse.ok) {
      throw new Error(await postResponse.text())
    }
    assertEquals(
      postResponse.url,
      `${route}/app/patients/${patient_id}/intake/family`,
    )

    const occupation = await patient_occupations.get(db, {
      patient_id,
    })
    assert(occupation)
    assertEquals(occupation, {
      school: {
        status: 'adult in school',
        education_level: 'Elementary School',
      },
      job: {
        happy: true,
        descendants_employed: true,
        require_assistance: true,
        profession: 'Accountant',
        work_satisfaction: 'Excellent',
      },
    })

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/occupation`,
      {},
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    assertEquals(
      formValues,
      {
        occupation: {
          school: {
            status: 'adult in school',
            education_level: 'Elementary School',
          },
          job: {
            happy: true,
            descendants_employed: true,
            require_assistance: true,
            profession: 'Accountant',
            work_satisfaction: 'Excellent',
          },
        },
        omit: {
          patient_goes_to_school: true,
        },
      },
      'The form should be 1:1 with the occupations in the DB',
    )
  })
})
