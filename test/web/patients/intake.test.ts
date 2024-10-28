import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorker,
  addTestHealthWorkerWithSession,
  getFormDisplay,
  getFormValues,
  readFirstFiveRowsOfSeedDump,
  route,
} from '../utilities.ts'
import * as cheerio from 'cheerio'
import db from '../../../db/db.ts'
import * as patients from '../../../db/models/patients.ts'
import * as patient_encounters from '../../../db/models/patient_encounters.ts'
import * as patient_conditions from '../../../db/models/patient_conditions.ts'
import * as patient_allergies from '../../../db/models/patient_allergies.ts'
import * as addresses from '../../../db/models/addresses.ts'
import * as family from '../../../db/models/family.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sample from '../../../util/sample.ts'
import { getPreExistingConditions } from '../../../db/models/patient_conditions.ts'
import deepOmit from '../../../util/deepOmit.ts'
import * as patient_occupations from '../../../db/models/patient_occupations.ts'
import * as patient_lifestyle from '../../../db/models/patient_lifestyle.ts'
import { INTAKE_STEPS } from '../../../shared/intake.ts'
import { randomNationalId, randomPhoneNumber } from '../../mocks.ts'

describe('/app/patients/[patient_id]/intake', {
  sanitizeResources: false,
  sanitizeOps: false,
}, () => {
  const allergies = readFirstFiveRowsOfSeedDump('allergies')

  it('loads the personal page', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )
    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })
    const response = await fetch(
      `${route}/app/patients/${patient_id}`,
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
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )
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
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )
    const testDoctor = await addTestHealthWorker(db, { scenario: 'doctor' })
    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })
    const countryInfo = await addresses.getCountryAddressTree(db)
    const zimbabwe = countryInfo[0]
    assertEquals(zimbabwe.name, 'Zimbabwe')

    const province = sample(zimbabwe.provinces)
    const district = sample(province.districts)
    const ward = sample(district.wards)

    const body = new FormData()
    body.set('address.country', zimbabwe.name)
    body.set('address.administrative_area_level_1', province.name)
    body.set('address.administrative_area_level_2', district.name)
    body.set('address.locality', ward.name)
    body.set('address.street', '123 Main Street apt 3')
    body.set('nearest_organization_id', '00000000-0000-0000-0000-000000000001')
    body.set('primary_doctor_id', testDoctor.employee_id!)

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

    const patientAddress = await db.selectFrom('addresses').selectAll().where(
      'addresses.id',
      '=',
      patientResult[0].address_id,
    ).executeTakeFirstOrThrow()

    assertEquals(patientAddress.country, zimbabwe.name)
    assertEquals(patientAddress.administrative_area_level_1, province.name)
    assertEquals(patientAddress.administrative_area_level_2, district.name)
    assertEquals(patientAddress.locality, ward.name)
    assertEquals(patientAddress.route, 'Main Street')
    assertEquals(patientAddress.street_number, '123')
    assertEquals(patientAddress.unit, 'apt 3')

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/address`,
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    assertEquals(
      $('input[name="address.administrative_area_level_1"]').val(),
      String(province.name),
    )
    assertEquals(
      $('input[name="address.administrative_area_level_2"]').val(),
      String(district.name),
    )
    assertEquals($('input[name="address.locality"]').val(), String(ward.name))
    assertEquals(
      $('input[name="address.street"]').val(),
      '123 Main Street apt 3',
    )
  })

  it('supports POST of pre_existing_conditions on the conditions step, moving you to the history step', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )
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
    body.set('pre_existing_conditions.0.medications.0.start_date', '1989-01-12')
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
    assertEquals(preExistingCondition.medications[0].medication_id, tablet.id)
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
        'manufactured_medication_id',
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
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )
    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    const body = new FormData()
    body.set('allergies.0.id', allergies.value[0].id)
    body.set('allergies.1.id', allergies.value[1].id)

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

    const allergies_of_patient = await patient_allergies.get(db, patient_id)

    assertEquals(allergies_of_patient.length, 2)
    assertEquals(allergies_of_patient[0].id, allergies.value[0].id)
    assertEquals(allergies_of_patient[1].id, allergies.value[1].id)

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/conditions`,
      {},
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    assertEquals(
      formValues,
      { allergies: allergies_of_patient },
      'The form should be 1:1 with the conditions in the DB',
    )
  })

  it('can remove all pre_existing_conditions on POST', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )
    const { fetch, healthWorker } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    await patient_conditions.upsertPreExisting(db, {
      patient_id: patient_id,
      employment_id: healthWorker.employee_id!,
      patient_conditions: [
        {
          id: 'c_4373',
          start_date: '1989-01-12',
        },
      ],
    })

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
      patient_id,
    })

    assertEquals(pre_existing_conditions.length, 0)
  })

  it('handles holes in an array of pre_existing_conditions on POST', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )
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
      'pre_existing_conditions.1.medications.0.start_date',
      '1989-01-12',
    ),
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
    assertEquals(preExistingCondition.medications[0].medication_id, tablet.id)
    assertEquals(
      preExistingCondition.medications[0].strength,
      150,
    )
  })

  it('supports POST on the family step, moving you to the lifestyle step', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )
    await patients.update(db, {
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
            patient_phone_number: guardian_phone,
          },
        ],
        religion: 'Non-Religious',
        family_type: null,
        marital_status: 'Single',
        patient_cohabitation: null,
        under_18: true,
      },
    })
  })

  it('redirects you to the personal step if no DOB was yet filled out and you try to access occupation', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )

    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/occupation`,
      {},
    )

    assertEquals(
      getResponse.url,
      `${route}/app/patients/${patient_id}/intake/personal?warning=Some%20questions%20are%20age-dependent%2C%20so%20please%20fill%20out%20the%20patient%27s%20personal%20information%20beforehand.`,
    )
  })

  it('supports POST on the occupation step(0-18), moving you to the family step', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )

    await patients.update(db, {
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
            appropriate: false,
          },
        },
      },
      'The form should be 1:1 with the occupations in the DB',
    )
  })

  it('supports POST on the occupation step(19+), moving you to the family step', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient 19',
        reason: 'seeking treatment',
      },
    )

    await patients.update(db, {
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

  it.skip('supports POST on the lifestyle step, moving you to the summary step if you already completed all other sections', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )

    const prior_intake_steps = INTAKE_STEPS.filter((step) =>
      step !== 'lifestyle' && step !== 'summary'
    )
    const patient_intake_insert = prior_intake_steps.map((intake_step) => ({
      patient_id,
      intake_step,
    }))

    await db.insertInto('patient_intake').values(patient_intake_insert)
      .execute()

    await patients.update(db, {
      id: patient_id,
      date_of_birth: '2000-01-01',
    })

    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    const body = new FormData()
    body.set('lifestyle.sexual_activity.ever_been_sexually_active', 'on')
    body.set('lifestyle.sexual_activity.currently_sexually_active', 'on')
    body.set('lifestyle.sexual_activity.had_sex_after_drugs', 'on')
    body.set('lifestyle.sexual_activity.recently_treated_for_stis', 'on')
    body.set('lifestyle.sexual_activity.know_partner_hiv_status', 'on')
    body.set('lifestyle.sexual_activity.partner_hiv_status', 'on')
    body.set('lifestyle.sexual_activity.first_encounter', '5')
    body.set('lifestyle.sexual_activity.attracted_to', '')
    body.set('lifestyle.sexual_activity.current_sexual_partners', '')
    body.set('lifestyle.sexual_activity.has_traded_sex_for_favors', '')
    body.set('lifestyle.sexual_activity.recently_hiv_tested', '')

    body.set('lifestyle.alcohol.has_ever_drank', 'on')
    body.set('lifestyle.alcohol.currently_drinks', 'on')
    body.set('lifestyle.alcohol.binge_drinking', 'on')
    body.set('lifestyle.alcohol.drawn_to_cut_down', 'on')
    body.set('lifestyle.alcohol.annoyed_by_critics', 'on')
    body.set('lifestyle.alcohol.arrested', '')
    body.set('lifestyle.alcohol.attempted_to_stop', '')
    body.set('lifestyle.alcohol.criticized', '')
    body.set('lifestyle.alcohol.first_drink', '')
    body.set('lifestyle.alcohol.guilty', '')
    body.set('lifestyle.alcohol.missed_work', '')
    body.set('lifestyle.alcohol.number_drinks_per_sitting', '')
    body.set('lifestyle.alcohol.withdrawal', '')
    body.set('lifestyle.alcohol.years_drinking', '')
    body.set('lifestyle.alcohol.eye_opener', 'on')
    body.set('lifestyle.alcohol.quit_for_six_or_more_months', 'on')
    body.set('lifestyle.alcohol.abstinence_length_months', '10')
    body.set(
      'lifestyle.alcohol.alcohol_products_used.0',
      'Traditional brew',
    )
    body.set(
      'lifestyle.alcohol.alcohol_products_used.1',
      'Opaque beer',
    )
    body.set(
      'lifestyle.alcohol.alcohol_products_used.2',
      'Bottled beer (ciders/lagers)',
    )
    body.set(
      'lifestyle.alcohol.alcohol_products_used.3',
      'Wine/ fermented fruit drinks',
    )
    body.set(
      'lifestyle.alcohol.alcohol_products_used.4',
      'Pure spirits/liquors (gin, brandy, vodka, whiskey)',
    )
    body.set(
      'lifestyle.alcohol.alcohol_products_used.5',
      'Illegal/illicit drinks',
    )

    body.set('lifestyle.smoking.has_ever_smoked', 'on')
    body.set('lifestyle.smoking.currently_smokes', 'on')
    body.set('lifestyle.smoking.felt_to_cutdown', 'on')
    body.set('lifestyle.smoking.annoyed_by_criticism', 'on')
    body.set('lifestyle.smoking.guilty', 'on')
    body.set('lifestyle.smoking.forbidden_place', 'on')
    body.set('lifestyle.smoking.attempt_to_quit', 'on')
    body.set('lifestyle.smoking.first_smoke_age', '')
    body.set('lifestyle.smoking.weekly_smokes', '')
    body.set('lifestyle.smoking.quit_more_than_six_months', 'on')
    body.set('lifestyle.smoking.quit_smoking_years', '5')
    body.set('lifestyle.smoking.number_of_products', '5')
    body.set(
      'lifestyle.smoking.tobacco_products_used.0',
      'Flavored cigarettes',
    )
    body.set(
      'lifestyle.smoking.tobacco_products_used.1',
      'Cigarettes',
    )

    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/lifestyle`,
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
      `${route}/app/patients/${patient_id}/intake/summary`,
    )

    const lifestyle = await patient_lifestyle.get(db, {
      patient_id,
    })

    assert(lifestyle)
    assertEquals(lifestyle, {
      sexual_activity: {
        ever_been_sexually_active: true,
        currently_sexually_active: true,
        had_sex_after_drugs: true,
        recently_treated_for_stis: true,
        know_partner_hiv_status: true,
        partner_hiv_status: true,
        first_encounter: 5,
      },
      alcohol: {
        has_ever_drank: true,
        currently_drinks: true,
        binge_drinking: true,
        drawn_to_cut_down: true,
        annoyed_by_critics: true,
        eye_opener: true,
        quit_for_six_or_more_months: true,
        abstinence_length_months: 10,
        alcohol_products_used: [
          'Traditional brew',
          'Opaque beer',
          'Bottled beer (ciders/lagers)',
          'Wine/ fermented fruit drinks',
          'Pure spirits/liquors (gin, brandy, vodka, whiskey)',
          'Illegal/illicit drinks',
        ],
      },
      smoking: {
        has_ever_smoked: true,
        currently_smokes: true,
        felt_to_cutdown: true,
        annoyed_by_criticism: true,
        guilty: true,
        forbidden_place: true,
        attempt_to_quit: true,
        quit_more_than_six_months: true,
        quit_smoking_years: 5,
        number_of_products: 5,
        tobacco_products_used: ['Flavored cigarettes', 'Cigarettes'],
      },
      // deno-lint-ignore no-explicit-any
    } as any)

    const getResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/lifestyle`,
      {},
    )

    const pageContents = await getResponse.text()
    const $ = cheerio.load(pageContents)
    const formValues = getFormValues($)
    assertEquals(
      formValues,
      {
        lifestyle: {
          sexual_activity: {
            attracted_to: null,
            current_sexual_partners: null,
            ever_been_sexually_active: true,
            currently_sexually_active: true,
            had_sex_after_drugs: true,
            has_traded_sex_for_favors: null,
            recently_treated_for_stis: true,
            know_partner_hiv_status: true,
            partner_hiv_status: true,
            first_encounter: 5,
            recently_hiv_tested: null,
          },
          alcohol: {
            abstinence_length_months: 10,
            annoyed_by_critics: true,
            arrested: null,
            attempted_to_stop: null,
            binge_drinking: true,
            criticized: null,
            currently_drinks: true,
            drawn_to_cut_down: true,
            eye_opener: true,
            first_drink: null,
            guilty: null,
            has_ever_drank: true,
            missed_work: null,
            number_drinks_per_sitting: null,
            quit_for_six_or_more_months: true,
            withdrawal: null,
            years_drinking: null,
            alcohol_products_used: [
              'Traditional brew',
              'Opaque beer',
              'Bottled beer (ciders/lagers)',
              'Wine/ fermented fruit drinks',
              'Pure spirits/liquors (gin, brandy, vodka, whiskey)',
              'Illegal/illicit drinks',
            ],
          },
          smoking: {
            has_ever_smoked: true,
            currently_smokes: true,
            felt_to_cutdown: true,
            annoyed_by_criticism: true,
            guilty: true,
            forbidden_place: true,
            attempt_to_quit: true,
            quit_more_than_six_months: true,
            quit_smoking_years: 5,
            number_of_products: 5,
            first_smoke_age: null,
            weekly_smokes: null,
            tobacco_products_used: ['Flavored cigarettes', 'Cigarettes'],
          },
        },
      },
      'The form should be 1:1 with the lifestyles in the DB',
    )
  })

  it.skip('supports POST on the lifestyle step, returning you to the first incomplete step before summary if any are not yet done', async () => {
    const { patient_id } = await patient_encounters.upsert(
      db,
      '00000000-0000-0000-0000-000000000001',
      {
        patient_name: 'Test Patient',
        reason: 'seeking treatment',
      },
    )

    await db.insertInto('patient_intake').values({
      patient_id,
      intake_step: 'personal',
    }).execute()

    await patients.update(db, {
      id: patient_id,
      date_of_birth: '2000-01-01',
    })

    const { fetch } = await addTestHealthWorkerWithSession(db, {
      scenario: 'approved-nurse',
    })

    const body = new FormData()

    const postResponse = await fetch(
      `${route}/app/patients/${patient_id}/intake/lifestyle`,
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
      `${route}/app/patients/${patient_id}/intake/address?warning=Please%20fill%20out%20the%20address%20form%20before%20completing%20the%20intake%20process`,
    )
  })
})
