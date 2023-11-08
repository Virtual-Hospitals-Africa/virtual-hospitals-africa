import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import {
  Address,
  Gender,
  Location,
  Maybe,
  OnboardingPatient,
  Patient,
  PatientConversationState,
  PatientState,
  PatientWithMedicalRecord,
  RenderedPatient,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import haveNames from '../../util/haveNames.ts'
import { getWalkingDistance } from '../../external-clients/google.ts'
import omit from '../../util/omit.ts'
import compact from '../../util/compact.ts'

const baseSelect = (trx: TrxOrDb) =>
  trx
    .selectFrom('patients')
    .leftJoin('facilities', 'facilities.id', 'patients.nearest_facility_id')
    .select([
      'patients.id',
      'patients.name',
      'patients.phone_number',
      'patients.location',
      'patients.gender',
      sql<string | null>`TO_CHAR(patients.date_of_birth, 'FMDD FMMonth YYYY')`
        .as('dob_formatted'),
      'patients.national_id_number',
      'patients.conversation_state',
      'patients.created_at',
      'patients.updated_at',
      'patients.completed_onboarding',
      sql<string | null>`concat('/app/patients/', patients.id::text)`.as(
        'href',
      ),
      sql<
        string | null
      >`CASE WHEN patients.avatar_media_id IS NOT NULL THEN concat('/app/patients/', patients.id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
      'facilities.name as nearest_facility',
      sql<null>`NULL`.as('last_visited'),
    ])

const selectWithName = (trx: TrxOrDb) =>
  baseSelect(trx).where('patients.name', 'is not', null)

export function getByPhoneNumber(
  trx: TrxOrDb,
  query: { phone_number: string },
): Promise<
  Maybe<ReturnedSqlRow<RenderedPatient>>
> {
  return baseSelect(trx)
    .where('phone_number', '=', query.phone_number)
    .executeTakeFirst()
}

// export function getAddress(
//   trx: TrxOrDb,
//   query: { street: string, suburb_id: number, ward_id: number, },
// ): Promise<
//   Maybe<ReturnedSqlRow<Address>>
// > {
//   return trx
//   .selectFrom('address')
//     .selectAll()
//     .where('street', '=', query.street)
//     .where('suburb_id', '=', query.suburb_id)
//     .where('ward_id', '=', query.ward_id)
//     .executeTakeFirst()
// }

export type UpsertablePatient = {
  id?: number
  conversation_state?: PatientConversationState
  phone_number?: string
  gender?: Maybe<Gender>
  date_of_birth?: Maybe<string>
  national_id_number?: Maybe<string>
  primary_doctor_id?: Maybe<number>
  location?: Maybe<Location>
  avatar_media_id?: number
  address_id?: number
  // country_id?: Maybe<number>
  // province_id?: Maybe<number>
  // district_id?: Maybe<number>
  // ward_id?: Maybe<number>
  // suburb_id?: Maybe<number>
  // street?: Maybe<string>
  completed_onboarding?: boolean
  name?: Maybe<string>
  first_name?: Maybe<string>
  middle_names?: Maybe<string>
  last_name?: Maybe<string>
}

export type UpsertableAddress = {
  street?: Maybe<string>
  suburb_id?: Maybe<number>
  ward_id?: Maybe<number>
  district_id?: Maybe<number>
  province_id?: Maybe<number>
  country_id?: Maybe<number>
}

const omitNames = omit<
  UpsertablePatient,
  'first_name' | 'middle_names' | 'last_name'
>(['first_name', 'middle_names', 'last_name'])


export function upsertAddress(
  trx: TrxOrDb,
  address: UpsertableAddress,
): Promise<ReturnedSqlRow<Address>> {
  return trx
    .insertInto('address')
    .values({
      street: address.street,
      suburb_id: address.suburb_id,
      ward_id: address.ward_id,
      district_id: address.district_id,
      province_id: address.province_id,
      country_id: address.country_id
    })
    .onConflict((oc) => oc.columns(['street', 'suburb_id', 'ward_id']).doNothing())
    .returningAll()
    .executeTakeFirstOrThrow() || (
      trx.selectFrom('address')
        .where((eb) => eb.and({
          street: address.street,
          suburb_id: address.suburb_id,
          ward_id: address.ward_id
        })
      ).selectAll().executeTakeFirstOrThrow()
    )
}

export function upsert(
  trx: TrxOrDb,
  patient: UpsertablePatient,
): Promise<ReturnedSqlRow<Patient>> {
  const toInsert = {
    ...omitNames(patient), // to do: update patient upsert
    location: patient.location
      ? sql`ST_SetSRID(ST_MakePoint(${patient.location.longitude}, ${patient.location.latitude})::geography, 4326)` as unknown as Location
      : null,
  }
  if ('first_name' in patient) {
    assert(!toInsert.name, 'Cannot set both name and first_name')
    toInsert.name = compact(
      [patient.first_name, patient.middle_names, patient.last_name],
    ).join(' ')
  }

  return trx
    .insertInto('patients')
    .values({
      ...toInsert,
      conversation_state: toInsert.conversation_state || 'initial_message',
      completed_onboarding: toInsert.completed_onboarding || false,
    })
    .onConflict((oc) => oc.column('phone_number').doUpdateSet(toInsert))
    .onConflict((oc) => oc.column('id').doUpdateSet(toInsert))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function remove(trx: TrxOrDb, opts: { phone_number: string }) {
  return trx
    .deleteFrom('patients')
    .where('phone_number', '=', opts.phone_number)
    .executeTakeFirst()
}

export function getOnboarding(
  trx: TrxOrDb,
  opts: {
    id: number
  },
): Promise<OnboardingPatient> {
  return trx
    .selectFrom('patients')
    .leftJoin('address', 'address.id', 'patients.address_id')
    .leftJoin('facilities', 'facilities.id', 'patients.nearest_facility_id')
    .select([
      'patients.id',
      'patients.name',
      'patients.phone_number',
      'patients.location',
      'patients.gender',
      sql<null | string>`TO_CHAR(patients.date_of_birth, 'YYYY-MM-DD')`.as(
        'date_of_birth',
      ),
      'patients.national_id_number',
      'address.country_id',
      'address.province_id',
      'address.district_id',
      'address.ward_id',
      'address.suburb_id',
      'address.street',
      'patients.completed_onboarding',
      sql<
        string | null
      >`CASE WHEN patients.avatar_media_id IS NOT NULL THEN concat('/app/patients/', patients.id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
      'patients.nearest_facility_id',
      'facilities.display_name as nearest_facility_display_name',
    ])
    .where('patients.id', '=', opts.id)
    .executeTakeFirstOrThrow()
}

// TODO: implement medical record functionality
// TODO: only show medical record if health worker has permission
export async function getWithMedicalRecords(
  trx: TrxOrDb,
  opts: {
    ids: number[]
    health_worker_id?: number
  },
): Promise<ReturnedSqlRow<PatientWithMedicalRecord>[]> {
  assert(opts.ids.length, 'Must select nonzero patients')
  const patients = await selectWithName(trx)
    .where('patients.id', 'in', opts.ids)
    .execute()

  assert(haveNames(patients))

  return patients.map((patient) => ({
    ...patient,
    medical_record: {
      allergies: [
        'chocolate',
        'bananas',
      ],
      history: {},
    },
  }))
}

export async function getAllWithNames(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedPatient[]> {
  let query = baseSelect(trx).where('patients.name', 'is not', null)

  if (search) query = query.where('patients.name', 'ilike', `%${search}%`)

  const patients = await query.execute()

  assert(haveNames(patients))

  return patients
}

export function getAvatar(trx: TrxOrDb, opts: { patient_id: number }) {
  return trx
    .selectFrom('media')
    .innerJoin('patients', 'patients.avatar_media_id', 'media.id')
    .select(['media.mime_type', 'media.binary_data'])
    .where('patients.id', '=', opts.patient_id)
    .executeTakeFirst()
}

export function hasDemographicInfo(
  patientState: PatientState,
): boolean {
  return (
    !!patientState.name &&
    !!patientState.gender &&
    !!patientState.dob_formatted &&
    !!patientState.national_id_number
  )
}

export async function nearestFacilities(
  trx: TrxOrDb,
  patient_id: number,
  currentLocation: Location,
) {
  const patient = await trx
    .selectFrom('patient_nearest_facilities')
    .selectAll()
    .where('patient_id', '=', patient_id)
    .executeTakeFirstOrThrow()

  assert(patient.nearest_facilities.length > 0)

  return Promise.all(
    patient.nearest_facilities.map(async (facility) => ({
      ...facility,
      walking_distance: await getWalkingDistance({
        origin: {
          longitude: currentLocation.longitude,
          latitude: currentLocation.latitude,
        },
        destination: {
          longitude: facility.longitude,
          latitude: facility.latitude,
        },
      }),
    })),
  )
}
