import { define } from '../define.ts'
import { parseJSONSync } from '../../../util/parseJSON.ts'
import { groupBy } from '../../../util/groupBy.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { asNames } from '../../../util/asNames.ts'

// Set this to the local path of the HPCSA doctors JSON file before running the seed
const doctors_file_path = ''
if (!doctors_file_path) console.log('WARNING: doctors_file_path is not set in 32_health_workers.ts — please set it before seeding')

const doctor_specialties = parseJSONSync(doctors_file_path)

const doctors = groupBy(doctor_specialties, 'Registration')

export default define(['health_workers', 'health_worker_licence_numbers', 'health_worker_licences'], async (trx) => {
  const skipped_registrations: string[] = []

  for (const [registration_number, specialties] of doctors) {
    if (specialties.length > 1) {
      assertEquals(specialties[0].Surname, specialties[1].Surname)
      assertEquals(specialties[0].Fullname, specialties[1].Fullname)
    }

    // Filter out incomplete specialty rows — add more field checks here if needed
    const valid_specialties = specialties.filter((s) => s['FROM DATE'] && s['END DATE'])
    if (valid_specialties.length === 0) {
      skipped_registrations.push(registration_number as string)
      continue
    }

    const doctor = await trx.insertInto('health_workers')
      .values(asNames({
        first_names: specialties[0].Fullname as string,
        preferred_name: specialties[0].Fullname as string,
        surname: specialties[0].Surname as string,
      }))
      .returning('id')
      .executeTakeFirstOrThrow()

    const licence = await trx.insertInto('health_worker_licence_numbers')
      .values({
        health_worker_id: doctor.id,
        licence_number: registration_number as string,
        regulatory_agency_id: trx
          .selectFrom('regulatory_agencies')
          .select('id')
          .where('acronym', '=', 'HPCSA'),
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    for (const specialty of valid_specialties) {
      await trx.insertInto('health_worker_licences')
        .values({
          health_worker_licence_number_id: licence.id,
          profession: 'MEDICAL PRACTITIONER',
          specialty: specialty['SPECIALITY'] as string,
          start_date: specialty['FROM DATE'] as string,
          expiry_date: specialty['END DATE'] as string,
          subspecialty: (specialty['SUB SPECIALITY'] as string) || null,
        })
        .returning('id')
        .executeTakeFirstOrThrow()
    }
  }

  if (skipped_registrations.length > 0) {
    console.log(`Skipped ${skipped_registrations.length} doctors with missing fields:`, skipped_registrations)
  }
})
