import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'health_workers',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('first_names', 'varchar(255)', (col) => col.notNull())
        .addColumn('surname', 'varchar(255)', (col) => col.notNull())
        .addColumn('preferred_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('avatar_media_id', 'uuid', (col) => col.references('media.id').onDelete('set null'))
        .addCheckConstraint(
          'health_worker_name_matches_first_names_and_surname',
          sql`(
            (name = first_names || ' ' || surname) OR
            (name IS NULL AND first_names IS NULL AND surname IS NULL)
          )`,
        )
        .addCheckConstraint(
          'health_worker_name_and_preferred_name_nullability',
          sql`(
            (name IS NULL) = (preferred_name IS NULL)
          )`,
        ),
  )

  await db.schema
    .createIndex('idx_health_workers_avatar_media_id')
    .on('health_workers')
    .column('avatar_media_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('health_workers').execute()
}
