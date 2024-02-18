import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import sortBy from '../../util/sortBy.ts'
import natural from 'natural'

export async function search(
  trx: TrxOrDb,
  { term, code_start }: {
    term: string
    code_start?: string | string[]
  },
) {
  const query = trx.with('matches', (qb) => {
    const matches_query = qb.selectFrom('icd10_diagnosis')
      .selectAll()
      .where(
        sql<boolean>`(
          icd10_diagnosis.description % ${term} OR
          icd10_diagnosis.description ilike ${term + '%'} OR
          icd10_diagnosis.includes % ${term} OR
          icd10_diagnosis.includes ilike ${term + '%'}
        )`,
      )

    // return matches_query
    if (!code_start) {
      return matches_query
    }
    const code_start_array = Array.isArray(code_start)
      ? code_start
      : [code_start]

    return matches_query.where(
      (eb) =>
        eb.or(
          code_start_array.map((code_start) =>
            sql<
              boolean
            >`LEFT(icd10_diagnosis.code, ${code_start.length}) = ${code_start}`
          ),
        ),
    )
  })
    .with('has_parent_in_matches', (qb) =>
      qb.selectFrom('matches as children')
        .innerJoin(
          'matches as parents',
          'parents.code',
          'children.parent_code',
        )
        .select('children.code')
        .distinct())
    .with('parents', (qb) =>
      qb.selectFrom('matches')
        .leftJoin(
          'has_parent_in_matches',
          'has_parent_in_matches.code',
          'matches.code',
        )
        .where('has_parent_in_matches.code', 'is', null)
        .selectAll('matches'))
    .selectFrom('parents')
    .selectAll('parents')
    .select([
      'code as id',
      'description as name',
      sql<number>`0`.as('rank'),
    ])
    // Yield the tree of sub_diagnoses
    // We need not do this recursively, as we know the maximum depth of the tree
    .select((eb_parent0) => [
      jsonArrayFrom(
        eb_parent0
          .selectFrom('icd10_diagnosis as c0')
          .whereRef('c0.parent_code', '=', 'parents.code')
          .selectAll('c0')
          .select((eb_c0) => [
            jsonArrayFrom(
              eb_c0
                .selectFrom('icd10_diagnosis as c1')
                .whereRef('c1.parent_code', '=', 'c0.code')
                .selectAll('c1')
                .select((eb_c1) => [
                  jsonArrayFrom(
                    eb_c1
                      .selectFrom('icd10_diagnosis as c2')
                      .whereRef('c2.parent_code', '=', 'c1.code')
                      .selectAll('c2')
                      .select((eb_c2) => [
                        jsonArrayFrom(
                          eb_c2
                            .selectFrom('icd10_diagnosis as c3')
                            .whereRef('c3.parent_code', '=', 'c2.code')
                            .selectAll('c3'),
                        ).as('sub_diagnoses'),
                      ]),
                  ).as('sub_diagnoses'),
                ]),
            ).as('sub_diagnoses'),
          ]),
      ).as('sub_diagnoses'),
    ])

  const tfidf = new natural.TfIdf()

  const results = await query.execute()

  for (const result of results) {
    tfidf.addDocument(result.description)
  }

  tfidf.tfidfs(term, (i, rank) => {
    results[i].rank = rank
  })

  return sortBy(results, (result) => -result.rank)
}
