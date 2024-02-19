import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import sortBy from '../../util/sortBy.ts'
// import natural from 'natural'

// Yield the tree of sub_diagnoses
// We need not do this recursively, as we know the maximum depth of the tree
export function tree(trx: TrxOrDb) {
  return trx.selectFrom('icd10_diagnosis as tree')
    .selectAll('tree')
    .select([
      'tree.code as id',
      'tree.description as name',
    ])
    .select((eb_parent0) => [
      jsonArrayFrom(
        eb_parent0
          .selectFrom('icd10_diagnosis as c0')
          .whereRef('c0.parent_code', '=', 'tree.code')
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
}

export async function search(
  trx: TrxOrDb,
  { term, code_start }: {
    term: string
    code_start?: string | string[]
  },
) {
  const matching_parents = trx.with('matches', (qb) => {
    const matches_query = qb.selectFrom('icd10_diagnosis')
      .selectAll()
      .where(
        sql<boolean>`(
          icd10_diagnosis.description % ${term} OR
          icd10_diagnosis.description ilike ${'%' + term + '%'} OR
          icd10_diagnosis.includes % ${term} OR
          icd10_diagnosis.includes ilike ${'%' + term + '%'}
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
    // We can omit children whose parents match as the children will appear in the tree
    // as sub_diagnoses of the parent
    .with('has_parent_in_matches', (qb) =>
      qb.selectFrom('matches as children')
        .innerJoin(
          'matches as parents',
          'parents.code',
          'children.parent_code',
        )
        .select('children.code')
        .distinct())
    .selectFrom('matches')
    .leftJoin(
      'has_parent_in_matches',
      'has_parent_in_matches.code',
      'matches.code',
    )
    .where('has_parent_in_matches.code', 'is', null)
    .select('matches.code')
    .distinct()

  const results = await tree(trx)
    .where('tree.code', 'in', matching_parents)
    .select(
      sql<
        number
      >`similarity(tree.description || ' ' || coalesce(tree.includes, ''), ${term})`
        .as(
          'rank',
        ),
    )
    .orderBy('rank', 'desc')
    .limit(20)
    .execute()

  // const tfidf = new natural.TfIdf()

  // for (const result of results) {
  //   const document = result.includes
  //     ? result.description + ' ' + result.includes
  //     : result.description
  //   tfidf.addDocument(document)
  // }

  // tfidf.tfidfs(term, (i, rank) => {
  //   Object.assign(results[i], {natural_rank: rank})
  // })

  return sortBy(results, (result) => -result.rank).slice(0, 20)
}

export function searchSymptoms(
  trx: TrxOrDb,
  term: string,
) {
  return search(trx, { term, code_start: 'R' })
}
