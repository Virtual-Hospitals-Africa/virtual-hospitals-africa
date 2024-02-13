import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'

// export function search(
//   trx: TrxOrDb,
//   search: string,
// ) {
//   return trx
//     .selectFrom('icd10_diagnosis')
//     .innerJoin(
//       'icd10_category',
//       'icd10_diagnosis.category',
//       'icd10_category.category',
//     )
//     .innerJoin('icd10_section', 'icd10_category.section', 'icd10_section.section')
//     .selectAll('icd10_diagnosis')
//     .select([
//       sql<number>`similarity(icd10_diagnosis.description, ${search})`.as('rank'),
//     ])
//     .where(sql<boolean>`icd10_diagnosis.description % ${search}`)
//     .where(sql<boolean>`left(icd10_section.section, 1) = 'R'`)
//     .orderBy('rank', 'desc')
//     .execute()
// }

export function search(
  trx: TrxOrDb,
  search: string,
) {
  console.log(
    trx.selectFrom('icd10_diagnosis')
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
      .select([
        sql<number>`similarity(icd10_diagnosis.description, ${search})`.as(
          'rank',
        ),
      ])
      .where(sql<boolean>`
        icd10_diagnosis.description % ${search} OR
        icd10_diagnosis.includes % ${search}
      `)
      .where(sql<boolean>`left(icd10_section.section, 1) = 'R'`)
      .orderBy('rank', 'desc')
      .compile().sql,
  )

  return trx.with('matches', (qb) =>
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
      .select([
        sql<number>`similarity(icd10_diagnosis.description, ${search})`.as(
          'rank',
        ),
      ])
      .where(sql<boolean>`(
        icd10_diagnosis.description % ${search} OR
        icd10_diagnosis.includes % ${search}
      )`)
      .where(sql<boolean>`(left(icd10_section.section, 1) = 'R')`)
      .orderBy('rank', 'desc'))
    .selectFrom('matches')
    .selectAll()
    .execute()
}
