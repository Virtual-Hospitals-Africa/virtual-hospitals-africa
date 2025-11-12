import { sql } from 'kysely'
import { EmployeeInfo, Maybe, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, jsonArrayFromColumn } from '../helpers.ts'
import { avatar_url_sql } from './health_workers.ts'

export function getEmployeeInfo(
  trx: TrxOrDb,
  opts: {
    health_worker_id: string
    organization_id: string
  },
): Promise<Maybe<EmployeeInfo>> {
  return trx.with('health_worker_at_organization', (qb) =>
    qb
      .selectFrom('employment')
      .where('employment.health_worker_id', '=', opts.health_worker_id)
      .where('employment.organization_id', '=', opts.organization_id)
      .select('health_worker_id')
      .distinct()).with('employee_info', (qb) =>
      qb
        .selectFrom('health_worker_at_organization')
        .innerJoin(
          'health_workers',
          'health_workers.id',
          'health_worker_at_organization.health_worker_id',
        )
        .innerJoin(
          'organizations',
          (join) => join.on('organizations.id', '=', opts.organization_id),
        )
        .leftJoin(
          'addresses as organization_address',
          'organizations.address_id',
          'organization_address.id',
        )
        .leftJoin(
          'employment as nurse_employment',
          (join) =>
            join
              .onRef(
                'nurse_employment.health_worker_id',
                '=',
                'health_workers.id',
              )
              .on('nurse_employment.profession', '=', 'nurse')
              .on(
                'nurse_employment.organization_id',
                '=',
                opts.organization_id,
              ),
        )
        .leftJoin(
          'nurse_registration_details',
          'nurse_registration_details.health_worker_id',
          'health_workers.id',
        )
        .leftJoin(
          'addresses',
          'addresses.id',
          'nurse_registration_details.address_id',
        )
        .select((eb) => [
          'health_workers.id as health_worker_id',
          sql<
            Maybe<string>
          >`TO_CHAR(nurse_registration_details.date_of_birth, 'FMDD FMMonth YYYY')`
            .as('date_of_birth'),
          sql<
            Maybe<string>
          >`TO_CHAR(nurse_registration_details.date_of_first_practice, 'FMDD FMMonth YYYY')`
            .as('date_of_first_practice'),
          'nurse_registration_details.sex',
          'nurse_registration_details.gender',
          'nurse_registration_details.mobile_number',
          'nurse_registration_details.national_id_number',
          'nurse_registration_details.ncz_registration_number',
          'nurse_employment.specialty',
          'health_workers.email',
          'health_workers.name',
          avatar_url_sql.as('avatar_url'),
          'addresses.formatted as address',
          'organizations.id as organization_id',
          'organizations.name as organization_name',
          'organization_address.formatted as organization_address',
          jsonArrayFromColumn(
            'profession',
            eb
              .selectFrom('employment')
              .where(
                'health_worker_id',
                '=',
                opts.health_worker_id,
              )
              .where('organization_id', '=', opts.organization_id)
              .select(['employment.profession']),
          ).as('professions'),
          ({ eb, and }) =>
            and([
              eb('nurse_employment.id', 'is not', null),
              eb('nurse_registration_details.id', 'is not', null),
              eb('nurse_registration_details.approved_by', 'is', null),
            ]).as('registration_pending_approval'),
          ({ eb, and }) =>
            and([
              eb('nurse_employment.id', 'is not', null),
              eb('nurse_registration_details.id', 'is', null),
            ]).as('registration_needed'),
          ({ eb, or }) =>
            or([
              eb('nurse_employment.id', 'is', null),
              eb('nurse_registration_details.approved_by', 'is not', null),
            ]).as('registration_completed'),
          jsonArrayFrom(
            eb.selectFrom('nurse_registration_details as nd_1').whereRef(
              'nd_1.id',
              '=',
              'nurse_registration_details.id',
            ).where(
              'nurse_registration_details.national_id_media_id',
              'is not',
              null,
            )
              .select([
                sql<string>`'National ID'`.as('name'),
                sql<
                  string
                >`concat('/app/organizations/', organizations.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.national_id_media_id::text)`
                  .as('href'),
              ])
              .union(
                eb.selectFrom('nurse_registration_details as nd_1').whereRef(
                  'nd_1.id',
                  '=',
                  'nurse_registration_details.id',
                ).where(
                  'nurse_registration_details.face_picture_media_id',
                  'is not',
                  null,
                )
                  .select([
                    sql<string>`'Face Picture'`.as('name'),
                    sql<
                      string
                    >`concat('/app/organizations/', organizations.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.face_picture_media_id::text)`
                      .as('href'),
                  ]),
              )
              .union(
                eb.selectFrom('nurse_registration_details as nd_1').whereRef(
                  'nd_1.id',
                  '=',
                  'nurse_registration_details.id',
                ).where(
                  'nurse_registration_details.ncz_registration_card_media_id',
                  'is not',
                  null,
                )
                  .select([
                    sql<string>`'Registration Card'`.as('name'),
                    sql<
                      string
                    >`concat('/app/organizations/', organizations.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.ncz_registration_card_media_id::text)`
                      .as('href'),
                  ]),
              )
              .union(
                eb.selectFrom('nurse_registration_details as nd_1').whereRef(
                  'nd_1.id',
                  '=',
                  'nurse_registration_details.id',
                ).where(
                  'nurse_registration_details.nurse_practicing_cert_media_id',
                  'is not',
                  null,
                )
                  .select([
                    sql<string>`'Nurse Practicing Certificate'`.as('name'),
                    sql<
                      string
                    >`concat('/app/organizations/', organizations.id::text, '/employees/', health_workers.id, '/media/', nurse_registration_details.nurse_practicing_cert_media_id::text)`
                      .as('href'),
                  ]),
              )
              .orderBy('name'),
          ).as('documents'),
        ]))
    .selectFrom('employee_info')
    .selectAll()
    .executeTakeFirst()
}
