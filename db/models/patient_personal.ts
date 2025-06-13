import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'

export function getById(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return trx
    .selectFrom('patients')
    .select([
      'id',
      'name',
      'phone_number',
      'location',
      'gender',
      'ethnicity',
      sql<null | string>`TO_CHAR(date_of_birth, 'YYYY-MM-DD')`.as(
        'date_of_birth',
      ),
      'national_id_number',
      'completed_intake',
      'first_language',
      sql<
        string | null
      >`CASE WHEN avatar_media_id IS NOT NULL THEN concat('/app/patients/', id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
    ])
    .where('id', '=', patient_id)
    .executeTakeFirstOrThrow()
}
