//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('drugs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('generic_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()

  await db.schema
    .createTable('medications')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('form', 'varchar(255)', (col) => col.notNull())
    .addColumn('strengths', 'varchar(255)', (col) => col.notNull())
    .addColumn('strength_units', 'varchar(255)', (col) => col.notNull())
    .addColumn('drug_id', 'integer', (col) =>
      col.notNull().references('drugs.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()

  await db.schema
    .createTable('manufactured_medication')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('trade_name', 'varchar(1024)', (col) => col.notNull())
    .addColumn('applicant_name', 'varchar(1024)', (col) => col.notNull())
    .addColumn('manufacturer_name', 'varchar(2048)', (col) => col.notNull())
    .addColumn('strengths', 'varchar(255)', (col) => col.notNull())
    .addColumn('medication_id', 'integer', (col) =>
      col.notNull().references('medications.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    // .addCheckConstraint(
    //   'manufactured_medication_strengths_check',
    //   sql`strengths IN (SELECT strengths FROM medications WHERE medication_id = medications.id)`
    // )
    .execute()

  await db.schema
    .createTable('patient_condition_medications')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('patient_id', 'integer', (col) =>
      col.notNull().references('patients.id').onDelete('cascade')
    )
    .addColumn('condition_key_id', 'varchar(255)', (col) =>
      col.references('conditions.key_id').onDelete('cascade')
    )
    .addColumn('medication_id', 'integer', (col) =>
      col.references('medications.id').onDelete('cascade')
    )
    .addColumn('manufactured_medication_id', 'integer', (col) =>
      col.references('manufactured_medication.id').onDelete('cascade')
    )
    .addColumn('dosage', 'varchar(255)')
    .addColumn('intake_frequency', 'varchar(255)')
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date')
    .addCheckConstraint(
      'patient_condition_medications_med_id_check',
      sql`manufactured_medication_id IS NOT NULL OR medication_id IS NOT NULL`
    )
    .addCheckConstraint(
      'end_date_after_start_date_if_present_check',
      sql`end_date > start_date OR start_date IS NOT NULL`
    )
    .execute()

  await addUpdatedAtTrigger(db, 'drugs')
  await addUpdatedAtTrigger(db, 'medications')
  await addUpdatedAtTrigger(db, 'manufactured_medication')
  await addUpdatedAtTrigger(db, 'patient_condition_medications')
  await seedDataFromJSON(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_condition_medications').execute()
  await db.schema.dropTable('manufactured_medication').execute()
  await db.schema.dropTable('medications').execute()
  await db.schema.dropTable('drugs').execute()
}

async function seedDataFromJSON(db: Kysely<any>) {
  const data: [
    {
      trade_name: string
      generic_name: string
      forms: string
      strength: string
      category: string
      registration_no: string
      applicant_name: string
      manufacturers: string
    }
  ] = await parseJSON('./db/resources/list_of_medications.json')

  const drugs = uniqueArray(data.map((c) => ({ generic_name: c.generic_name })))

  for (const drug of drugs) {
    const drugId = await db
      .insertInto('drugs')
      .values({
        generic_name: drug.generic_name,
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    const medications = uniqueArray(
      data
        .filter((d) => d.generic_name === drug.generic_name)
        .flatMap((m) =>
          (m.forms.match(/[,;]/) ? m.forms.split(/[,;]/) : [m.forms]).map(
            (form) => ({
              form: form.trim(),
              strengths: JSON.stringify(
                getStrentghUnitAndValues(m.strength, form.trim())[0].values
              ),
              strength_units:
                getStrentghUnitAndValues(m.strength, form.trim())[0].unit ?? '',
              manufactured_medication: uniqueArray(
                data
                  .filter(
                    (d) =>
                      d.generic_name === drug.generic_name &&
                      d.forms.includes(form)
                  )
                  .map((d) => ({
                    strengths: d.strength,
                    trade_name: d.trade_name,
                    applicant_name: d.applicant_name,
                    manufacturer_name: d.manufacturers,
                  }))
              ),
            })
          )
        )
    )

    for (const medication of medications) {
      const medicationId = await db
        .insertInto('medications')
        .values({
          drug_id: drugId.id,
          form: medication.form,
          strengths: medication.strengths,
          strength_units: medication.strength_units,
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      for (const manufacturer of medication.manufactured_medication) {
        await db
          .insertInto('manufactured_medication')
          .values({
            strengths: manufacturer.strengths,
            trade_name: manufacturer.trade_name,
            applicant_name: manufacturer.applicant_name,
            manufacturer_name: manufacturer.manufacturer_name,
            medication_id: medicationId.id,
          })
          .executeTakeFirstOrThrow()
      }
    }
  }
}

function uniqueArray(arr: any) {
  return arr.reduce((acc: any, current: any) => {
    const x = acc.find(
      (item: any) => JSON.stringify(item) === JSON.stringify(current)
    )
    if (!x) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])
}

//TODO: if form is syrup take ml instead of mg
function getStrentghUnitAndValues(str: string, form: string) {
  const textRegex = /[a-zA-Z]+/g
  let values = str.includes(';') ? str.split(';') : [str]
  let result = []

  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    let unit = value.match(textRegex)?.[0]

    //200;150 ;300 mg
    //if value is 200 it will keep looping until find the string value
    if (!unit) {
      let nextItem = i + 1
      while (!unit && nextItem < values.length) {
        if (values[nextItem].match(textRegex))
          unit = values[nextItem].match(textRegex)?.[0]
        nextItem++
      }
      if (!unit) unit = 'undefined'
    }

    const numericValue = parseFloat(value)

    const existingUnit = result.find(
      (item) => item.unit === unit!.toUpperCase()
    )
    if (existingUnit) {
      existingUnit.values.push(numericValue)
    } else {
      result.push({ unit: unit!.toUpperCase(), values: [numericValue] })
    }
  }

  // console.log(str)
  // console.log(form)
  // console.log(result)
  return result
}
