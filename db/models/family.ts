import {
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

export function addGuardian(
  trx: TrxOrDb,
  guardian: PatientGuardian,
): Promise<{ id: number }> {
  return trx
    .insertInto('patient_guardians')
    .values(guardian)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function get(
  trx: TrxOrDb,
  { patient_id }: { patient_id: number },
): Promise<PatientFamily> {
  const gettingGuardians = trx
    .selectFrom('patient_guardians')
    .innerJoin(
      'guardian_relations',
      'patient_guardians.guardian_relation',
      'guardian_relations.guardian',
    )
    .innerJoin(
      'patients as guardian',
      'patient_guardians.guardian_patient_id',
      'guardian.id',
    )
    .innerJoin(
      'patients as dependent',
      'patient_guardians.dependent_patient_id',
      'dependent.id',
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
      eb
        .case()
        .when(
          and([
            eb('guardian.gender', '=', 'female'),
            eb('guardian_relations.female_guardian', 'is not', null),
          ]),
        )
        .then(eb.ref('guardian_relations.female_guardian'))
        .when(
          and([
            eb('guardian.gender', '=', 'male'),
            eb('guardian_relations.male_guardian', 'is not', null),
          ]),
        )
        .then(eb.ref('guardian_relations.male_guardian'))
        .else(eb.ref('guardian_relations.guardian'))
        .end()
        .as('family_relation_gendered'),
    ])
    .execute()

  const gettingDependents = trx
    .selectFrom('patient_guardians')
    .innerJoin(
      'guardian_relations',
      'patient_guardians.guardian_relation',
      'guardian_relations.guardian',
    )
    .innerJoin(
      'patients as guardian',
      'patient_guardians.guardian_patient_id',
      'guardian.id',
    )
    .innerJoin(
      'patients as dependent',
      'patient_guardians.dependent_patient_id',
      'dependent.id',
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
          ]),
        )
        .then(eb.ref('guardian_relations.female_dependent'))
        .when(
          and([
            eb('dependent.gender', '=', 'male'),
            eb('guardian_relations.male_dependent', 'is not', null),
          ]),
        )
        .then(eb.ref('guardian_relations.male_dependent'))
        .else(eb.ref('guardian_relations.dependent'))
        .end()
        .as('family_relation_gendered'),
    ])
    .execute()

  return {
    marital_status: 'TODO',
    religion: 'TODO',
    guardians: await gettingGuardians,
    dependents: await gettingDependents,
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
  relation: FamilyRelationInsert,
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
  family_to_upsert: FamilyUpsert,
): Promise<void> {
  const [existing_guardians, new_guardians] = partition(
    family_to_upsert.guardians,
    hasPatientId,
  )
  const [existing_dependents, new_dependents] = partition(
    family_to_upsert.dependents,
    hasPatientId,
  )

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
      `Cannot have two relations to the same patient: ${guardian.patient_name}`,
    )
    const relation = inverseGuardianRelation(guardian.family_relation_gendered)
    guardian_upserts_with_patient_ids.set(
      guardian.patient_id,
      relation.guardian_relation,
    )
    updating_existing_patients.push(upsertPatient(trx, {
      id: guardian.patient_id,
      name: guardian.patient_name,
      phone_number: guardian.patient_phone_number,
      gender: relation.gender,
    }))
  }
  for (const dependent of existing_dependents) {
    assertOr400(
      !guardian_upserts_with_patient_ids.has(dependent.patient_id) &&
        !dependent_upserts_with_patient_ids.has(dependent.patient_id),
      `Cannot have two relations to the same patient: ${dependent.patient_name}`,
    )
    const relation = inverseDependentRelation(
      dependent.family_relation_gendered,
    )
    dependent_upserts_with_patient_ids.set(
      dependent.patient_id,
      relation.guardian_relation,
    )
    updating_existing_patients.push(
      upsertPatient(trx, {
        id: dependent.patient_id,
        name: dependent.patient_name,
        phone_number: dependent.patient_phone_number,
        gender: relation.gender,
      }),
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
    const index = to_insert.push({
      name: guardian.patient_name,
      phone_number: guardian.patient_phone_number,
      gender: relation.gender,
    }) - 1
    inserted.set(guardian, [index, relation.guardian_relation])
  }
  for (const dependent of new_dependents) {
    const relation = inverseDependentRelation(
      dependent.family_relation_gendered,
    )
    const index = to_insert.push({
      name: dependent.patient_name,
      phone_number: dependent.patient_phone_number,
      gender: relation.gender,
    }) - 1
    inserted.set(dependent, [index, relation.guardian_relation])
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
    ({ patient_id }) => guardian_upserts_with_patient_ids.has(patient_id),
  )
  const [dependents_to_update, dependents_to_remove] = partition(
    existing_family.dependents,
    ({ patient_id }) => dependent_upserts_with_patient_ids.has(patient_id),
  )

  // 1. Remove: The relation exists in the db as given by its patient_id, but not in the upsert
  const to_remove = guardians_to_remove.concat(dependents_to_remove).map((
    { relation_id },
  ) => relation_id)
  const removing_relations = to_remove.length &&
    trx
      .deleteFrom('patient_guardians')
      .where('id', 'in', to_remove)
      .execute()

  // 2. Update: The relation exists in the db as given by its patient_id and the upsert
  const updated_guardian_patient_ids = new Set<number>()
  const updating_relations: Promise<unknown>[] = []
  for (const guardian_relation_in_db of guardians_to_update) {
    const guardian_relation = guardian_upserts_with_patient_ids.get(
      guardian_relation_in_db.patient_id,
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
        .executeTakeFirstOrThrow(),
    )
    updated_guardian_patient_ids.add(guardian_relation_in_db.patient_id)
  }
  const updated_dependent_patient_ids = new Set<number>()
  for (const dependent_relation_in_db of dependents_to_update) {
    const guardian_relation = dependent_upserts_with_patient_ids.get(
      dependent_relation_in_db.patient_id,
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
        .executeTakeFirstOrThrow(),
    )
    updated_dependent_patient_ids.add(dependent_relation_in_db.patient_id)
  }

  // 3. Insert: The relation doesn't exist in the db as given by its patient_id
  const new_patients = await inserting_new_patients

  const new_guardians_to_insert: PatientGuardian[] = family_to_upsert.guardians
    .filter((guardian) =>
      !guardian.patient_id ||
      !updated_guardian_patient_ids.has(guardian.patient_id)
    )
    .map(
      (guardian) => {
        let guardian_patient_id: number
        let guardian_relation: GuardianRelationName
        // a. The patient already exists
        if (guardian.patient_id) {
          guardian_patient_id = guardian.patient_id
          guardian_relation = guardian_upserts_with_patient_ids.get(
            guardian.patient_id,
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
      },
    )

  const new_dependents_to_insert: PatientGuardian[] = family_to_upsert
    .dependents
    .filter((dependent) =>
      !dependent.patient_id ||
      !updated_dependent_patient_ids.has(dependent.patient_id)
    )
    .map(
      (dependent) => {
        let dependent_patient_id: number
        let guardian_relation: GuardianRelationName
        // a. The patient already exists
        if (dependent.patient_id) {
          dependent_patient_id = dependent.patient_id
          guardian_relation = dependent_upserts_with_patient_ids.get(
            dependent.patient_id,
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
      },
    )

  const new_relations = new_guardians_to_insert.concat(new_dependents_to_insert)

  const adding_relations = new_relations.length &&
    trx.insertInto('patient_guardians').values(new_relations).execute()

  await Promise.all([
    removing_relations,
    adding_relations,
    ...updating_relations,
  ])
}
