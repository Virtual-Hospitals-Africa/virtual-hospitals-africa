import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('conversation_state')
    .asEnum([
      'initial_message',
      'not_onboarded:welcome',
      'not_onboarded:make_appointment:enter_name',
      'not_onboarded:make_appointment:enter_gender',
      'not_onboarded:make_appointment:enter_date_of_birth',
      'not_onboarded:make_appointment:enter_national_id_number',
      'not_onboarded:find_nearest_clinic:share_location',
      'onboarded:make_appointment:enter_appointment_reason',
      'onboarded:make_appointment:confirm_details',
      'onboarded:make_appointment:first_scheduling_option',
      'onboarded:make_appointment:other_scheduling_options',
      'onboarded:appointment_scheduled',
      'onboarded:cancel_appointment',
      'other_end_of_demo',
    ])
    .execute()

  return db.schema
    .createTable('patients')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('phone_number', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)')
    .addColumn('gender', 'varchar(50)')
    .addColumn('date_of_birth', 'varchar(50)')
    .addColumn('national_id_number', 'varchar(50)')
    .addColumn(
      'conversation_state',
      sql`conversation_state`,
      (column) => column.defaultTo('initial_message'),
    )
    .addUniqueConstraint('national_id_number', ['national_id_number'])
    .addUniqueConstraint('phone_number', ['phone_number'])
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patients').execute()
  await db.schema.dropType('conversation_state').execute()
}
