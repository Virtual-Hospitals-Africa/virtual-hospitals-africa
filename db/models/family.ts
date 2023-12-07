import { sql } from 'kysely'
import { GuardianRelation, PatientGuardian, TrxOrDb } from '../../types.ts'

let allGuardianRelations: GuardianRelation[] | null = null
export async function getAllGuardianRelationships(
  trx: TrxOrDb,
): Promise<GuardianRelation[]> {
  if (allGuardianRelations) return allGuardianRelations
  return allGuardianRelations = await trx
    .selectFrom('guardian_relations')
    .selectAll()
    .execute()
}

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
) {
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
      'guardian.id as patient_id',
      'guardian.name as patient_name',
      'guardian.phone_number as patient_phone_number',
      eb.case()
        .when(and([
          eb('guardian.gender', '=', 'female'),
          eb('guardian_relations.female_guardian', 'is not', null),
        ])).then(sql`guardian_relations.female_guardian`)
        .when(and([
          eb('guardian.gender', '=', 'male'),
          eb('guardian_relations.male_guardian', 'is not', null),
        ])).then(sql`guardian_relations.male_guardian`)
        .else('guardian_relations.guardian').end().as(
          'family_relation_gendered',
        ),
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
      eb.case()
        .when(and([
          eb('dependent.gender', '=', 'female'),
          eb('guardian_relations.female_dependent', 'is not', null),
        ])).then(sql`guardian_relations.female_dependent`)
        .when(and([
          eb('dependent.gender', '=', 'male'),
          eb('guardian_relations.male_dependent', 'is not', null),
        ])).then(sql`guardian_relations.male_dependent`)
        .else('guardian_relations.guardian').end().as(
          'family_relation_gendered',
        ),
    ])
    .execute()

  return {
    guardians: await gettingGuardians,
    dependents: await gettingDependents,
  }
}
