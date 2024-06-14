import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  //add a column to the whatsapp_received table to distinguish between patient and pharmacist
  //add a constraint to the column to only allow 'patient' or 'pharmacist' as values

  return await db.schema.alterTable('whatsapp_messages_received')
    .addColumn(
      'chatbot_name',
      'varchar(255)',
      (col) =>
        col.notNull().defaultTo('patient')
          .check(sql`chatbot_name = 'patient' OR chatbot_name = 'pharmacist'`),
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('whatsapp_messages_received').dropColumn(
    'chatbot_name',
  ).execute()
}
