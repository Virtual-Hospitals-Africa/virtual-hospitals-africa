import { InsertObject, sql, UpdateObject } from 'kysely'
import { Coordinates, IdSelection, InsertShapeLiteral, Maybe, RenderedPatient, RenderedPatientCompletedRegistration, TrxOrDb } from '../../types.ts'
import { isoDate, jsonBuildNullableObject, literalLocation, longFormattedDate } from '../helpers.ts'
import { DB } from '../../db.d.ts'
import { base } from './_base.ts'
import { asMaybeNames, asNames, NameInputs } from '../../util/asNames.ts'
import { SERVER_COUNTRY } from './countries.ts'
import { assert } from 'std/assert/assert.ts'
import { completedRegistration } from '../../shared/patient_registration.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS } from '../../shared/vitals.ts'
import { nowInvalidRecords } from './patient_records_base.ts'

export const avatar_url_sql = sql<string | null>`
  CASE WHEN patients.avatar_media_id IS NOT NULL
    THEN concat('/app/patients/', patients.id::text, '/avatar')
    ELSE NULL
  END
`

export const description_sql = sql<string | null>`
  CASE
    WHEN patients.sex IS NULL THEN NULL
    WHEN patients.gender IS NULL THEN NULL
    WHEN patients.date_of_birth IS NULL THEN NULL
    WHEN (
      (patients.sex = 'female' AND patients.gender = 'woman') OR
      (patients.sex = 'male' AND patients.gender = 'man')
    ) THEN patients.sex || ' • ' || TO_CHAR(patients.date_of_birth, 'FMDD FMMonth YYYY')
    ELSE patients.sex || ' • ' || patients.gender || ' • ' || TO_CHAR(patients.date_of_birth, 'FMDD FMMonth YYYY')
  END
`

const dob_formatted = longFormattedDate('patients.date_of_birth').as(
  'dob_formatted',
)

function baseQuery(trx: TrxOrDb) {
  return trx.selectFrom('patients')
    .leftJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .select((eb) => [
      'patients.id',
      'patients.name',
      'patients.sex',
      'patients.gender',
      'patients.preferred_language_code_iso_639_2_b',
      dob_formatted,
      isoDate(eb.ref('patients.date_of_birth')).as('date_of_birth'),
      description_sql.as('description'),
      'patient_age.age_display',
      'patient_age.age_days',
      sql<number | null>`patient_age.age_years::integer`.as('age_years'),
      'patients.national_id_number',
      'patients.completed_registration',
      avatar_url_sql.as('avatar_url'),
      jsonBuildNullableObject(eb.ref('patients.name'), {
        name: eb.ref('patients.name').$notNull(),
        first_names: eb.ref('patients.first_names').$notNull(),
        surname: eb.ref('patients.surname').$notNull(),
        preferred_name: eb.ref('patients.preferred_name').$notNull(),
      }).as('names'),
      // TODO make its own function?
      eb.selectFrom('patient_records')
        .innerJoin(
          'patient_measurements',
          'patient_records.id',
          'patient_measurements.id',
        )
        .where(
          'patient_records.patient_id',
          '=',
          eb.ref('patients.id'),
        )
        .where(
          'patient_records.specific_snomed_concept_id',
          '=',
          VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
        )
        .where(
          'patient_records.id',
          'not in',
          nowInvalidRecords(trx),
        )
        .orderBy('patient_records.created_at', 'desc')
        .select('patient_measurements.value')
        .limit(1)
        .as('most_recent_height_cm_measurement'),
    ])
    .orderBy(
      'name',
      'asc',
    )
}

type PatientUpsert =
  & Omit<Partial<InsertShapeLiteral<InsertObject<DB, 'patients'>>>, 'location'>
  & NameInputs
  & {
    location?: Coordinates
  }

export const patients = base({
  top_level_table: 'patients',
  baseQuery,
  formatResult: (x: RenderedPatient): RenderedPatient => x,
  handleSearch(
    qb,
    { search, has_name, include_incomplete_registration }: {
      search?: Maybe<string>
      has_name?: boolean
      include_incomplete_registration?: boolean
    },
  ) {
    if (has_name) {
      qb = qb.where('patients.name', 'is not', null)
    }
    if (search) {
      qb = qb.where('patients.name', 'ilike', `%${search}%`)
    }
    if (!include_incomplete_registration) {
      qb = qb.where(
        'patients.completed_registration',
        '=',
        true,
      )
    }
    return qb
  },
  async insert(
    trx: TrxOrDb,
    { conversation_state, country, location, ...to_insert }:
      & Omit<
        InsertShapeLiteral<InsertObject<DB, 'patients'>>,
        'id' | 'phone_number' | 'country' | 'location'
      >
      & {
        country?: string
        phone_number?: string
        conversation_state?: string
        location?: Coordinates
      },
  ) {
    const patient = await trx
      .insertInto('patients')
      .values({
        ...to_insert,
        ...asMaybeNames(to_insert),
        country: country || SERVER_COUNTRY,
        location: location && literalLocation(location),
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    if (conversation_state) {
      assert(Deno.env.get('IS_TEST'))
      assert(to_insert.phone_number)
      await trx.insertInto('patient_chatbot_users')
        .values({
          entity_id: patient.id,
          phone_number: to_insert.phone_number,
          conversation_state,
          data: '{}',
        })
        .execute()
    }

    return patient
  },
  upsert(
    trx: TrxOrDb,
    patient: PatientUpsert,
  ) {
    const to_upsert: InsertObject<DB, 'patients'> = {
      ...patient,
      ...asNames(patient),
      country: patient.country || SERVER_COUNTRY,
      location: patient.location && literalLocation(patient.location),
    }
    return trx
      .insertInto('patients')
      .values(to_upsert)
      .onConflict((oc) => oc.column('phone_number').doUpdateSet(to_upsert))
      .onConflict((oc) => oc.column('id').doUpdateSet(to_upsert))
      .returningAll()
      .executeTakeFirstOrThrow()
  },
  update(
    trx: TrxOrDb,
    { id, name, first_names, surname, preferred_name, location, ...patient }:
      & Partial<PatientUpsert>
      & {
        id: string
      },
  ) {
    const to_update: UpdateObject<DB, 'patients'> = {
      ...patient,
      ...asMaybeNames({ name, first_names, surname, preferred_name }),
      location: location && literalLocation(location),
    }

    return trx.updateTable('patients')
      .where('id', '=', id)
      .set(to_update)
      .returningAll()
      .executeTakeFirstOrThrow()
  },
  getAvatar(trx: TrxOrDb, opts: { patient_id: string }) {
    return trx
      .selectFrom('media')
      .innerJoin('patients', 'patients.avatar_media_id', 'media.id')
      .select(['media.mime_type', 'media.binary_data'])
      .where('patients.id', '=', opts.patient_id)
      .executeTakeFirst()
  },
  async getPreferredLanguage(
    trx: TrxOrDb,
    patient_id: string,
  ) {
    const patient = await trx.selectFrom('patients')
      .where('id', '=', patient_id)
      .select([
        'preferred_language_code_iso_639_2_b',
      ])
      .executeTakeFirst()

    return patient?.preferred_language_code_iso_639_2_b || null
  },
  async getByIdCompletedRegistration(
    trx: TrxOrDb,
    patient_id: string | IdSelection,
  ): Promise<undefined | RenderedPatientCompletedRegistration> {
    const patient = await patients.getById(trx, patient_id)
    assert(completedRegistration(patient))
    return patient
  },
})
