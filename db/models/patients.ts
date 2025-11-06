import { sql } from 'kysely'
import {
  Coordinates,
  InsertShape,
  Maybe,
  RenderedPatient,
  TrxOrDb,
  UpdateShape,
} from '../../types.ts'
import {
  isoDate,
  jsonBuildNullableObject,
  literalLocation,
  longFormattedDate,
} from '../helpers.ts'
import { Patients } from '../../db.d.ts'
import { base } from './_base.ts'
import { asMaybeNames, asNames, NameInputs } from './asNames.ts'
import { SERVER_COUNTRY } from './countries.ts'

export const avatar_url_sql = sql<string | null>`
  CASE WHEN patients.avatar_media_id IS NOT NULL
    THEN concat('/app/patients/', patients.id::text, '/avatar')
    ELSE NULL
  END
`

export const description_sql = sql<string | null>`
  CASE 
    WHEN NOT patients.completed_registration THEN NULL
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

const baseQuery = (trx: TrxOrDb) =>
  trx.selectFrom('patients')
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
    ])
    .orderBy(
      'name',
      'asc',
    )

export function createFromChatbot(
  trx: TrxOrDb,
  to_insert: {
    name: string
    phone_number: string
    country: string
  },
) {
  return trx
    .insertInto('patients')
    .values(to_insert)
    .returningAll()
    .executeTakeFirstOrThrow()
}

type PatientUpsert =
  & Omit<Partial<InsertShape<Patients>>, 'location'>
  & NameInputs
  & {
    location?: Coordinates
  }

export function upsert(
  trx: TrxOrDb,
  patient: PatientUpsert,
) {
  const to_upsert: InsertShape<Patients> = {
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
}

export function update(
  trx: TrxOrDb,
  { id, name, first_names, surname, preferred_name, location, ...patient }:
    & Partial<PatientUpsert>
    & {
      id: string
    },
) {
  const to_update: UpdateShape<Patients> = {
    ...patient,
    location: location && literalLocation(location),
  }
  const names = asMaybeNames({ name, first_names, surname, preferred_name })
  if (names) {
    Object.assign(to_update, names)
  }

  return trx.updateTable('patients')
    .where('id', '=', id)
    .set(to_update)
    .returningAll()
    .executeTakeFirstOrThrow()
}

const model = base({
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
})

export const getById = model.getById
export const getByIds = model.getByIds
export const search = model.search
