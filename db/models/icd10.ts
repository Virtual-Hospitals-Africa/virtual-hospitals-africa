import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'

// .select([
//   sql<number>`similarity(icd10_diagnosis.description, ${search})`.as(
//     'rank',
//   ),
// ])
// .orderBy('rank', 'desc')

export function search(
  trx: TrxOrDb,
  search: string,
) {
  const query = trx.with('matches', (qb) =>
    qb.selectFrom('icd10_diagnosis')
      .innerJoin(
        'icd10_category',
        'icd10_diagnosis.category',
        'icd10_category.category',
      )
      .innerJoin(
        'icd10_section',
        'icd10_category.section',
        'icd10_section.section',
      )
      .selectAll('icd10_diagnosis')
      .where(sql<boolean>`(
        icd10_diagnosis.description % ${search} OR
        icd10_diagnosis.includes % ${search}
      )`)
    )
    .with('has_parent_in_matches', qb => 
      qb.selectFrom('matches as children')
        .innerJoin(
          'matches as parents',
          'parents.code',
          'children.parent_code',
        )
        .select('children.code')
        .distinct()
    )
    .with('parents', qb => 
      qb.selectFrom('matches')
        .leftJoin('has_parent_in_matches', 'has_parent_in_matches.code', 'matches.code')
        .where('has_parent_in_matches.code', 'is', null)
        .selectAll('matches')
    )
    .selectFrom('parents')
    .selectAll()
  
  console.log(query.compile().sql)

  return query.execute()
}
