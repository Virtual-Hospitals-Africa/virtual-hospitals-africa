import { sql } from 'kysely'
import {
  FamilyRelation,
  FamilyRelationInsert,
  FamilyUpsert,
  GuardianRelationName,
  Patient,
  PatientFamily,
  PatientGuardian,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import {
  insertMany as insertManyPatients,
  upsert as upsertPatient,
} from './patients.ts'
import partition from '../../util/partition.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { GUARDIAN_RELATIONS } from '../../shared/family.ts'
import memoize from '../../util/memoize.ts'
import * as patient_age from './patient_age.ts'

export function addGuardian(
  trx: TrxOrDb,
  guardian: PatientGuardian
): Promise<{ id: number }> {
  return trx
    .insertInto('patient_guardians')
    .values(guardian)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function get(
  trx: TrxOrDb,
  { patient_id }: { patient_id: number }
): Promise<PatientFamily> {
  const gettingGuardians = trx
    .selectFrom('patient_guardians')
    .innerJoin(
      'guardian_relations',
      'patient_guardians.guardian_relation',
      'guardian_relations.guardian'
    )
    .innerJoin(
      'patients as guardian',
      'patient_guardians.guardian_patient_id',
      'guardian.id'
    )
    .innerJoin(
      'patients as dependent',
      'patient_guardians.dependent_patient_id',
      'dependent.id'
    )
    .leftJoin('patient_kin as kin', (join) =>
      join
        .on('kin.patient_id', '=', patient_id)
        .onRef('kin.next_of_kin_patient_id', '=', 'guardian.id')
    )
    .where('dependent.id', '=', patient_id)
    .select(({ eb, and }) => [
      'patient_guardians.id as relation_id',
      'guardian_relations.guardian as family_relation',
      'guardian_relations.guardian as guardian_relation',
      'guardian.id as patient_id',
      'guardian.name as patient_name',
      'guardian.gender as patient_gender',
      'guardian.phone_number as patient_phone_number',
      eb('kin.next_of_kin_patient_id', 'is not', null).as('next_of_kin'),
      eb
        .case()
        .when(
          and([
            eb('guardian.gender', '=', 'female'),
            eb('guardian_relations.female_guardian', 'is not', null),
          ])
        )
        .then(eb.ref('guardian_relations.female_guardian'))
        .when(
          and([
            eb('guardian.gender', '=', 'male'),
            eb('guardian_relations.male_guardian', 'is not', null),
          ])
        )
        .then(eb.ref('guardian_relations.male_guardian'))
        .else(sql<string>`guardian_relations.guardian::text`)
        .end()
        .as('family_relation_gendered'),
    ])
    .orderBy('family_relation_gendered desc')
    .execute()

  const gettingDependents = trx
    .selectFrom('patient_guardians')
    .innerJoin(
      'guardian_relations',
      'patient_guardians.guardian_relation',
      'guardian_relations.guardian'
    )
    .innerJoin(
      'patients as guardian',
      'patient_guardians.guardian_patient_id',
      'guardian.id'
    )
    .innerJoin(
      'patients as dependent',
      'patient_guardians.dependent_patient_id',
      'dependent.id'
    )
    .where('guardian.id', '=', patient_id)
    .select(({ eb, and }) => [
      'patient_guardians.id as relation_id',
      'dependent.id as patient_id',
      'dependent.name as patient_name',
      'dependent.phone_number as patient_phone_number',
      'guardian_relations.dependent as family_relation',
      'guardian_relations.guardian as guardian_relation',
      'dependent.gender as patient_gender',
      eb
        .case()
        .when(
          and([
            eb('dependent.gender', '=', 'female'),
            eb('guardian_relations.female_dependent', 'is not', null),
          ])
        )
        .then(eb.ref('guardian_relations.female_dependent'))
        .when(
          and([
            eb('dependent.gender', '=', 'male'),
            eb('guardian_relations.male_dependent', 'is not', null),
          ])
        )
        .then(eb.ref('guardian_relations.male_dependent'))
        .else(eb.ref('guardian_relations.dependent'))
        .end()
        .as('family_relation_gendered'),
    ])
    .execute()

  const gettingOtherNextOfKin = trx
    .selectFrom('patient_kin')
    .innerJoin(
      'patients as kin',
      'patient_kin.next_of_kin_patient_id',
      'kin.id'
    )
    .leftJoin('patient_guardians', (join) =>
      join
        .onRef(
          'patient_guardians.dependent_patient_id',
          '=',
          'patient_kin.patient_id'
        )
        .onRef(
          'patient_guardians.guardian_patient_id',
          '=',
          'patient_kin.next_of_kin_patient_id'
        )
    )
    .where('patient_kin.patient_id', '=', patient_id)
    .where('patient_guardians.id', 'is', null)
    .select([
      'patient_kin.id as id',
      'patient_kin.relationship as relation',
      'kin.id as patient_id',
      'kin.name as patient_name',
      'kin.phone_number as patient_phone_number',
      'kin.gender as patient_gender',
    ])
    .executeTakeFirst()

  const patient_family = await trx
    .selectFrom('patient_family')
    .selectAll()
    .where('patient_id', '=', patient_id)
    .executeTakeFirst()

  return {
    marital_status: patient_family?.marital_status,
    religion: patient_family?.religion,
    home_satisfaction: patient_family?.home_satisfaction,
    spiritual_satisfaction: patient_family?.spiritual_satisfaction,
    social_satisfaction: patient_family?.social_satisfaction,
    family_type: patient_family?.family_type,
    patient_cohabitation: patient_family?.patient_cohabitation,
    guardians: await gettingGuardians,
    dependents: await gettingDependents,
    other_next_of_kin: await gettingOtherNextOfKin,
  }
}

const inverseGuardianRelation = memoize((family_relation_gendered: string) => {
  for (const relation of GUARDIAN_RELATIONS) {
    if (relation.male_guardian === family_relation_gendered) {
      return {
        guardian_relation: relation.guardian,
        gender: 'male' as const,
      }
    }
    if (relation.female_guardian === family_relation_gendered) {
      return {
        guardian_relation: relation.guardian,
        gender: 'female' as const,
      }
    }
    if (relation.guardian === family_relation_gendered) {
      return {
        guardian_relation: relation.guardian,
      }
    }
  }
  throw new Error(`Invalid family relation: ${family_relation_gendered}`)
})

const inverseDependentRelation = memoize((family_relation_gendered: string) => {
  for (const relation of GUARDIAN_RELATIONS) {
    if (relation.male_dependent === family_relation_gendered) {
      return {
        guardian_relation: relation.guardian,
        gender: 'male' as const,
      }
    }
    if (relation.female_dependent === family_relation_gendered) {
      return {
        guardian_relation: relation.guardian,
        gender: 'female' as const,
      }
    }
    if (relation.dependent === family_relation_gendered) {
      return {
        guardian_relation: relation.guardian,
      }
    }
  }
  throw new Error(`Invalid family relation: ${family_relation_gendered}`)
})

function hasPatientId(
  relation: FamilyRelationInsert
): relation is FamilyRelationInsert & { patient_id: number } {
  return !!relation.patient_id
}

// Upsert family relations. Relations are unique to a patient.
// First, we kick off all the patient updates and inserts.
// Then for relations, we handle 3 cases:
// 1. Remove: The relation exists in the db as given by its patient_id, but not in the upsert
// 2. Update: The relation exists in the db as given by its patient_id and the upsert
// 3. Insert: The relation doesn't exist in the db as given by its patient_id
//   a. The patient already exists
//   b. The patient is new
export async function upsert(
  trx: TrxOrDb,
  patient_id: number,
  family_to_upsert: FamilyUpsert
): Promise<void> {
  const total_next_of_kin =
    family_to_upsert.guardians.filter((c) => c.next_of_kin).length +
    Number(!!family_to_upsert.other_next_of_kin)
  assertOr400(total_next_of_kin <= 1, 'Cannot have more than one next of kin')

  const age = await patient_age.get(trx, { patient_id: patient_id })
  const age_number = (age?.age_unit === 'year' ? age?.age_number : 0) ?? 0
  if (age_number <= 18 && family_to_upsert.family_type) {
    assertOr400(
      (['2 married parents', 'Same-sex marriage'].includes(
        family_to_upsert.family_type
      ) && family_to_upsert.guardians.length >= 2) || 
      !(['2 married parents', 'Same-sex marriage'].includes(
        family_to_upsert.family_type
      )),
      'Please include the patient parents as guardians'
    )

    assertOr400(
      (family_to_upsert.family_type === 'Single Parent' &&
        family_to_upsert.guardians.length >= 1) || family_to_upsert.family_type !== 'Single Parent',
      'Please include patient parent as a guardian'
    )
  }

  const [existing_guardians, new_guardians] = partition(
    family_to_upsert.guardians,
    hasPatientId
  )
  const [existing_dependents, new_dependents] = partition(
    family_to_upsert.dependents,
    hasPatientId
  )
  const other_kin = family_to_upsert.other_next_of_kin

  // Update patients that already exist
  const updating_existing_patients: Promise<unknown>[] = []

  // For those relations we're upserting with existing patients, update the existing patient records.
  // Keep track of the guardian relations by patient ids so we can update the relations later
  const guardian_upserts_with_patient_ids = new Map<
    number,
    GuardianRelationName
  >()
  const dependent_upserts_with_patient_ids = new Map<
    number,
    GuardianRelationName
  >()
  for (const guardian of existing_guardians) {
    assertOr400(
      !guardian_upserts_with_patient_ids.has(guardian.patient_id) &&
        !dependent_upserts_with_patient_ids.has(guardian.patient_id),
      `Cannot have two relations to the same patient: ${guardian.patient_name}`
    )
    const relation = inverseGuardianRelation(guardian.family_relation_gendered)
    guardian_upserts_with_patient_ids.set(
      guardian.patient_id,
      relation.guardian_relation
    )
    updating_existing_patients.push(
      upsertPatient(trx, {
        id: guardian.patient_id,
        name: guardian.patient_name,
        phone_number: guardian.patient_phone_number,
        gender: relation.gender,
      })
    )
  }
  for (const dependent of existing_dependents) {
    assertOr400(
      !guardian_upserts_with_patient_ids.has(dependent.patient_id) &&
        !dependent_upserts_with_patient_ids.has(dependent.patient_id),
      `Cannot have two relations to the same patient: ${dependent.patient_name}`
    )
    const relation = inverseDependentRelation(
      dependent.family_relation_gendered
    )
    dependent_upserts_with_patient_ids.set(
      dependent.patient_id,
      relation.guardian_relation
    )
    updating_existing_patients.push(
      upsertPatient(trx, {
        id: dependent.patient_id,
        name: dependent.patient_name,
        phone_number: dependent.patient_phone_number,
        gender: relation.gender,
      })
    )
  }
  if (other_kin && other_kin.patient_id) {
    updating_existing_patients.push(
      upsertPatient(trx, {
        id: other_kin.patient_id!,
        name: other_kin.patient_name,
        phone_number: other_kin.patient_phone_number,
      })
    )
  }
  // Insert patients that don't already exist. For each family relation keep track of the index and the calculated relation
  // so we can look them up later. After the insertion resolves, the db will give us back the patients in the same order, so
  // we can use the index to look up the patient
  const inserted = new Map<
    FamilyRelationInsert,
    [number, GuardianRelationName]
  >()
  const to_insert: Partial<Patient>[] = []
  for (const guardian of new_guardians) {
    const relation = inverseGuardianRelation(guardian.family_relation_gendered)
    const index =
      to_insert.push({
        name: guardian.patient_name,
        phone_number: guardian.patient_phone_number,
        gender: relation.gender,
      }) - 1
    inserted.set(guardian, [index, relation.guardian_relation])
  }
  for (const dependent of new_dependents) {
    const relation = inverseDependentRelation(
      dependent.family_relation_gendered
    )
    const index =
      to_insert.push({
        name: dependent.patient_name,
        phone_number: dependent.patient_phone_number,
        gender: relation.gender,
      }) - 1
    inserted.set(dependent, [index, relation.guardian_relation])
  }
  if (other_kin && !other_kin.patient_id) {
    const index =
      to_insert.push({
        name: other_kin.patient_name,
        phone_number: other_kin.patient_phone_number,
      }) - 1
    // deno-lint-ignore no-explicit-any
    inserted.set(other_kin, [index, other_kin.family_relation_gendered as any])
  }
  const inserting_new_patients = to_insert.length
    ? insertManyPatients(trx, to_insert)
    : Promise.resolve([])

  // At this point, we've kicked off all the patient updates and inserts.
  // We await them later, but to adjust the relations, we need the existing family.
  const existing_family = await get(trx, { patient_id })

  // Use the existing family to find those eligible for update & removal
  const [guardians_to_update, guardians_to_remove] = partition(
    existing_family.guardians,
    ({ patient_id }) => guardian_upserts_with_patient_ids.has(patient_id)
  )
  const [dependents_to_update, dependents_to_remove] = partition(
    existing_family.dependents,
    ({ patient_id }) => dependent_upserts_with_patient_ids.has(patient_id)
  )

  // 1. Remove: The relation exists in the db as given by its patient_id, but not in the upsert
  const to_remove = (guardians_to_remove as FamilyRelation[])
    .concat(dependents_to_remove)
    .map(({ relation_id }) => relation_id)
  const removing_relations =
    to_remove.length &&
    trx.deleteFrom('patient_guardians').where('id', 'in', to_remove).execute()

  // 2. Update: The relation exists in the db as given by its patient_id and the upsert
  const updated_guardian_patient_ids = new Set<number>()
  const updating_relations: Promise<unknown>[] = []
  for (const guardian_relation_in_db of guardians_to_update) {
    const guardian_relation = guardian_upserts_with_patient_ids.get(
      guardian_relation_in_db.patient_id
    )!
    const values: PatientGuardian = {
      guardian_relation,
      guardian_patient_id: guardian_relation_in_db.patient_id,
      dependent_patient_id: patient_id,
    }
    updating_relations.push(
      trx
        .updateTable('patient_guardians')
        .set(values)
        .where('id', '=', guardian_relation_in_db.relation_id)
        .executeTakeFirstOrThrow()
    )
    updated_guardian_patient_ids.add(guardian_relation_in_db.patient_id)
  }
  const updated_dependent_patient_ids = new Set<number>()
  for (const dependent_relation_in_db of dependents_to_update) {
    const guardian_relation = dependent_upserts_with_patient_ids.get(
      dependent_relation_in_db.patient_id
    )!
    const values: PatientGuardian = {
      guardian_relation,
      guardian_patient_id: patient_id,
      dependent_patient_id: dependent_relation_in_db.patient_id,
    }
    updating_relations.push(
      trx
        .updateTable('patient_guardians')
        .set(values)
        .where('id', '=', dependent_relation_in_db.relation_id)
        .executeTakeFirstOrThrow()
    )
    updated_dependent_patient_ids.add(dependent_relation_in_db.patient_id)
  }

  // 3. Insert: The relation doesn't exist in the db as given by its patient_id
  const new_patients = await inserting_new_patients

  const new_guardians_to_insert: PatientGuardian[] = family_to_upsert.guardians
    .filter(
      (guardian) =>
        !guardian.patient_id ||
        !updated_guardian_patient_ids.has(guardian.patient_id)
    )
    .map((guardian) => {
      let guardian_patient_id: number
      let guardian_relation: GuardianRelationName
      // a. The patient already exists
      if (guardian.patient_id) {
        guardian_patient_id = guardian.patient_id
        guardian_relation = guardian_upserts_with_patient_ids.get(
          guardian.patient_id
        )!
        // b. The patient is new
      } else {
        const [index, guardian_relation_calculated] = inserted.get(guardian)!
        const new_patient = new_patients[index]
        assert(new_patient.id)
        guardian_patient_id = new_patient.id
        guardian_relation = guardian_relation_calculated
      }
      return {
        guardian_relation,
        guardian_patient_id,
        dependent_patient_id: patient_id,
      }
    })

  let upsert_kin: Promise<unknown> = Promise.resolve()
  let removing_kin: Promise<unknown> = Promise.resolve()
  const new_kin = family_to_upsert.guardians.find((c) => c.next_of_kin)
  const existing_kin = existing_family.guardians.find((c) => c.next_of_kin)
  if (new_kin || existing_kin || other_kin) {
    const new_kin =
      family_to_upsert.guardians.find((c) => c.next_of_kin) ?? other_kin
    const existingKin =
      existing_family.guardians.find((c) => c.next_of_kin) ??
      existing_family.other_next_of_kin

    // kins is removed
    if (existingKin && !new_kin) {
      removing_kin = trx
        .deleteFrom('patient_kin')
        .where('patient_id', '=', patient_id)
        .execute()
    } else {
      assert(new_kin)
      let next_of_kin_patient_id: number
      if (new_kin?.patient_id) {
        next_of_kin_patient_id = new_kin.patient_id
      } else {
        const [index] = inserted.get(new_kin)!
        const new_patient = new_patients[index]
        assert(new_patient.id)
        next_of_kin_patient_id = new_patient.id
      }

      if (new_kin && !existingKin) {
        upsert_kin = trx
          .insertInto('patient_kin')
          .values({
            patient_id,
            next_of_kin_patient_id: next_of_kin_patient_id,
            relationship: new_kin.family_relation_gendered,
          })
          .returning('id')
          .executeTakeFirstOrThrow()
      } else {
        upsert_kin = trx
          .updateTable('patient_kin')
          .set({
            next_of_kin_patient_id: next_of_kin_patient_id,
            relationship: new_kin.family_relation_gendered,
          })
          .where('patient_id', '=', patient_id)
          .executeTakeFirstOrThrow()
      }
    }
  }

  const new_dependents_to_insert: PatientGuardian[] =
    family_to_upsert.dependents
      .filter(
        (dependent) =>
          !dependent.patient_id ||
          !updated_dependent_patient_ids.has(dependent.patient_id)
      )
      .map((dependent) => {
        let dependent_patient_id: number
        let guardian_relation: GuardianRelationName
        // a. The patient already exists
        if (dependent.patient_id) {
          dependent_patient_id = dependent.patient_id
          guardian_relation = dependent_upserts_with_patient_ids.get(
            dependent.patient_id
          )!
          // b. The patient is new
        } else {
          const [index, guardian_relation_calculated] = inserted.get(dependent)!
          const new_patient = new_patients[index]
          assert(new_patient.id)
          dependent_patient_id = new_patient.id
          guardian_relation = guardian_relation_calculated
        }
        return {
          guardian_relation,
          guardian_patient_id: patient_id,
          dependent_patient_id,
        }
      })

  const new_relations = new_guardians_to_insert.concat(new_dependents_to_insert)

  const adding_relations =
    new_relations.length &&
    trx.insertInto('patient_guardians').values(new_relations).execute()

  const familyValues = {
    patient_id: patient_id,
    home_satisfaction: family_to_upsert.home_satisfaction ?? null,
    spiritual_satisfaction: family_to_upsert.spiritual_satisfaction ?? null,
    social_satisfaction: family_to_upsert.social_satisfaction ?? null,
    religion: family_to_upsert.religion ?? null,
    family_type: family_to_upsert.family_type ?? null,
    marital_status: family_to_upsert?.marital_status ?? null,
    patient_cohabitation: family_to_upsert.patient_cohabitation ?? null,
  }
  const family_form_upsert = trx
    .insertInto('patient_family')
    .values(familyValues)
    .onConflict((oc) => oc.column('patient_id').doUpdateSet(familyValues))
    .returningAll()
    .executeTakeFirstOrThrow()

  await Promise.all([
    removing_relations,
    adding_relations,
    family_form_upsert,
    ...updating_relations,
    removing_kin,
    upsert_kin,
  ])
}
