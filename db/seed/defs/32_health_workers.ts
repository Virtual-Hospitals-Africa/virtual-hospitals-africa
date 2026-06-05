import { define } from '../define.ts'
import { parseJSONSync } from '../../../util/parseJSON.ts'
import { groupBy } from '../../../util/groupBy.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { asNames } from '../../../util/asNames.ts'

// adjust file path as needed - this is the path on testing local machine
const doctors_file_path = '/Users/liuh/Downloads/hpcsa_doctors_2026-05-22.json'
const doctor_specialties = parseJSONSync(doctors_file_path)

const doctors = groupBy(doctor_specialties, 'Registration')

export default define(['health_workers', 'health_worker_licence_numbers', 'health_worker_licences'], async (trx) => {
  for (const [registration_number, specialties] of doctors) {
    console.log({ specialties })
    if (specialties.length > 1) {
      assertEquals(specialties[0].Surname, specialties[1].Surname)
      assertEquals(specialties[0].Fullname, specialties[1].Fullname)
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

    for (const specialty of specialties) {
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
    console.log({ licence })
  }
})
