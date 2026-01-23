import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'organization_rooms',
    (qb) =>
      qb
        .addColumn('organization_id', 'uuid', (col) => col.notNull().references('organizations.id').onDelete('cascade'))
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addUniqueConstraint('organization_room_name', [
          'organization_id',
          'name',
        ]),
  )

  await createStandardTable(
    db,
    'organization_department_rooms',
    (qb) =>
      qb
        .addColumn('organization_department_id', 'uuid', (col) =>
          col.notNull().references('organization_departments.id').onDelete(
            'cascade',
          ))
        .addColumn('organization_room_id', 'uuid', (col) => col.notNull().references('organization_rooms.id').onDelete('cascade'))
        .addUniqueConstraint('department_room_unique', [
          'organization_department_id',
          'organization_room_id',
        ]),
  )

  await db.schema
    .createIndex('idx_organization_department_rooms_organization_room_id')
    .on('organization_department_rooms')
    .column('organization_room_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('organization_department_rooms').execute()
  await db.schema.dropTable('organization_rooms').execute()
}
