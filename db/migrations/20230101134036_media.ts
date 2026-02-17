import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'media',
    (qb) =>
      qb
        .addColumn('file_name', 'varchar(255)')
        .addColumn('mime_type', 'varchar(255)', (col) => col.notNull())
        .addColumn('binary_data', 'bytea', (col) => col.notNull()),
  )

  await createPointerTable(
    db,
    'media_images_or_videos',
    {
      references: 'media',
      primary_key_type: 'uuid',
    },
  )

  await createPointerTable(
    db,
    'media_images',
    {
      references: 'media_images_or_videos',
      primary_key_type: 'uuid',
    },
  )

  await createPointerTable(
    db,
    'media_videos',
    {
      references: 'media_images_or_videos',
      primary_key_type: 'uuid',
    },
  )

  await createPointerTable(
    db,
    'media_audios',
    {
      references: 'media',
      primary_key_type: 'uuid',
    },
  )

  await createPointerTable(
    db,
    'media_speeches',
    {
      references: 'media_audios',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn('language_code', 'varchar(3)', (col) => col.notNull().references('languages.iso_639_2_b')),
  )

  await db.schema
    .createIndex('idx_media_speeches_language_code')
    .on('media_speeches')
    .column('language_code')
    .execute()

  await createStandardTable(
    db,
    'speech_transcriptions',
    (qb) =>
      qb
        .addColumn('media_speech_id', 'uuid', (col) => col.notNull().references('media_speeches.id'))
        .addColumn('transcription', 'text')
        .addColumn('finished', 'boolean', (col) => col.notNull())
        .addColumn('model', 'varchar(255)', (col) => col.notNull()).addCheckConstraint(
          'transcription_present_when_finished',
          sql`(
        finished = (transcription is not null)
      )`,
        ),
  )

  await db.schema
    .createIndex('idx_speech_transcriptions_media_speech_id')
    .on('speech_transcriptions')
    .column('media_speech_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('speech_transcriptions').execute()
  await db.schema.dropTable('media_speeches').execute()
  await db.schema.dropTable('media_audios').execute()
  await db.schema.dropTable('media_videos').execute()
  await db.schema.dropTable('media_images').execute()
  await db.schema.dropTable('media_images_or_videos').execute()
  await db.schema.dropTable('media').execute()
}
