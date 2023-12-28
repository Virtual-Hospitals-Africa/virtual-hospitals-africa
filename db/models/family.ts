import { sql } from 'kysely'
import {
  GuardianRelation,
  PatientFamily,
  PatientGuardian,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'

let allGuardianRelations: GuardianRelation[] | null = null
export async function getAllGuardianRelationships(
  trx: TrxOrDb
): Promise<GuardianRelation[]> {
  if (allGuardianRelations) return allGuardianRelations
  return (allGuardianRelations = await trx
    .selectFrom('guardian_relations')
    .selectAll()
    .execute())
}

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
    .where('dependent.id', '=', patient_id)
    .select(({ eb, and }) => [
      'patient_guardians.id as relation_id',
      'guardian_relations.guardian as family_relation',
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
          ])
        )
        .then(sql`guardian_relations.female_guardian`)
        .when(
          and([
            eb('guardian.gender', '=', 'male'),
            eb('guardian_relations.male_guardian', 'is not', null),
          ])
        )
        .then(sql`guardian_relations.male_guardian`)
        .else('guardian_relations.guardian')
        .end()
        .as('family_relation_gendered'),
    ])
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
      'dependent.gender as patient_gender',
      eb
        .case()
        .when(
          and([
            eb('dependent.gender', '=', 'female'),
            eb('guardian_relations.female_dependent', 'is not', null),
          ])
        )
        .then(sql`guardian_relations.female_dependent`)
        .when(
          and([
            eb('dependent.gender', '=', 'male'),
            eb('guardian_relations.male_dependent', 'is not', null),
          ])
        )
        .then(sql`guardian_relations.male_dependent`)
        .else('guardian_relations.guardian')
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

export async function upsert(
  trx: TrxOrDb,
  patient_id: number,
  patientFamily: PatientFamily
): Promise<void> {
  const existing_family = await get(trx, { patient_id })

  const exisitngIds = (
    existing_family?.dependents?.map((c) => c.relation_id) ?? []
  ).concat(existing_family?.guardians?.map((c) => c.relation_id) ?? [])

  const familyIds = (
    patientFamily?.dependents?.map((c) => c.relation_id) ?? []
  ).concat(patientFamily?.guardians?.map((c) => c.relation_id!))
  const ids_to_remove = exisitngIds
    ?.filter((id) => !familyIds.includes(id))
    .map((id) => id!)

  const removing_relations =
    ids_to_remove.length &&
    trx
      .deleteFrom('patient_guardians')
      .where('id', 'in', ids_to_remove)
      .execute()

  for (const guardian of patientFamily.guardians?.filter(
    (c) => c.relation_id
  ) || []) {
    const values = {
      guardian_relation: guardian.family_relation,
      guardian_patient_id: guardian.patient_id,
      dependent_patient_id: patient_id,
    } as PatientGuardian
    const matchingGuardian = existing_family?.guardians!.find(
      (c) => c.relation_id === guardian.relation_id
    )
    assert(matchingGuardian, 'Referenced a non-existent guardian')

    await trx
      .updateTable('patient_guardians')
      .set(values)
      .where('id', '=', guardian.relation_id!)
      .executeTakeFirstOrThrow()
  }

  for (const dependent of patientFamily.dependents?.filter(
    (c) => c.relation_id
  ) || []) {
    const values = {
      guardian_relation: dependent.family_relation,
      guardian_patient_id: patient_id,
      dependent_patient_id: dependent.patient_id,
    } as PatientGuardian
    const matchingDependent = existing_family?.dependents!.find(
      (c) => c.relation_id === dependent.relation_id
    )
    assert(matchingDependent, 'Referenced a non-existent dependent')

    await trx
      .updateTable('patient_guardians')
      .set(values)
      .where('id', '=', dependent.relation_id!)
      .executeTakeFirstOrThrow()
  }

  const new_guardians = patientFamily?.guardians
    ?.filter((c) => !c.relation_id)
    .map(
      (guardian) =>
        ({
          guardian_relation: guardian.family_relation,
          guardian_patient_id: guardian.patient_id,
          dependent_patient_id: patient_id,
        } as PatientGuardian)
    )

  const new_dependents = patientFamily?.dependents
    ?.filter((c) => !c.relation_id)
    .map(
      (dependent) =>
        ({
          guardian_relation: dependent.family_relation,
          guardian_patient_id: patient_id,
          dependent_patient_id: dependent.patient_id,
        } as PatientGuardian)
    )

  const new_relations = (new_guardians ?? []).concat(new_dependents ?? [])

  const adding_relations =
    new_relations.length &&
    trx.insertInto('patient_guardians').values(new_relations).execute()

  await Promise.all([removing_relations, adding_relations])
}
