import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, jsonArrayFromColumn } from '../helpers.ts'

// Yield the tree of sub_diagnoses
// We need not do this recursively, as we know the maximum depth of the tree
export function tree(trx: TrxOrDb) {
  return trx.selectFrom('icd10_diagnoses as scoped')
    .selectAll('scoped')
    .select([
      'scoped.code as id',
      'scoped.description as name',
    ])
    .select((eb_parent0) => [
      jsonArrayFrom(
        eb_parent0
          .selectFrom('icd10_diagnoses as sd0')
          .whereRef('sd0.parent_code', '=', 'scoped.code')
          .selectAll('sd0')
          .select((eb_sd0) => [
            jsonArrayFrom(
              eb_sd0
                .selectFrom('icd10_diagnoses as sd1')
                .whereRef('sd1.parent_code', '=', 'sd0.code')
                .selectAll('sd1')
                .select((eb_sd1) => [
                  jsonArrayFrom(
                    eb_sd1
                      .selectFrom('icd10_diagnoses as sd2')
                      .whereRef('sd2.parent_code', '=', 'sd1.code')
                      .selectAll('sd2')
                      .select((eb_sd2) => [
                        jsonArrayFrom(
                          eb_sd2
                            .selectFrom('icd10_diagnoses as sd3')
                            .whereRef('sd3.parent_code', '=', 'sd2.code')
                            .selectAll('sd3'),
                        ).as('sub_diagnoses'),
                      ]),
                  ).as('sub_diagnoses'),
                ]),
            ).as('sub_diagnoses'),
          ]),
      ).as('sub_diagnoses'),
    ])
}

function searchBaseQuery(
  trx: TrxOrDb,
  { term, code_range }: {
    term: string
    code_range?: string | string[]
  },
) {
  return trx.with('matches', (qb) => {
    const matches_query = qb.selectFrom('icd10_diagnoses')
      .select('code')
      .where(
        sql<boolean>`(
          description % ${term} OR
          description ilike ${'%' + term + '%'}
        )`,
      )
      .unionAll(
        qb.selectFrom('icd10_diagnoses_includes')
          .select('code')
          .where(
            sql<boolean>`(
              note % ${term} OR
              note ilike ${'%' + term + '%'}
            )`,
          ),
      ).distinct()

    if (!code_range) {
      return matches_query
    }
    const code_range_array = Array.isArray(code_range)
      ? code_range
      : [code_range]

    assert(code_range_array.length)

    return matches_query.where(
      (eb) =>
        eb.or(
          code_range_array.map((code_range) => {
            const [category] = code_range.split('.')
            const category_equality_clause = eb('category', '=', category)
            return code_range.length === 3
              ? category_equality_clause
              // redundant to also check by category, but category is indexed
              : eb.and([
                category_equality_clause,
                sql<boolean>`LEFT(code, ${code_range.length}) = ${code_range}`,
              ])
          }),
        ),
    )
  })
}

export function searchTree(
  trx: TrxOrDb,
  { term, code_range, limit = 20 }: {
    term: string
    code_range?: string | string[]
    limit?: number
  },
) {
  const matching_parents = searchBaseQuery(trx, { term, code_range })
    .with('has_parent_in_matches', (qb) =>
      qb.selectFrom('matches')
        .innerJoin(
          'icd10_diagnoses as children',
          'children.code',
          'matches.code',
        )
        .innerJoin(
          'matches as parents',
          'parents.code',
          'children.parent_code',
        )
        .select('children.code')
        .distinct())
    // We can omit children whose parents match as the children will appear in the tree
    // as sub_diagnoses of the parent
    .selectFrom('matches')
    .leftJoin(
      'has_parent_in_matches',
      'has_parent_in_matches.code',
      'matches.code',
    )
    .where('has_parent_in_matches.code', 'is', null)
    .select('matches.code')
    .distinct()

  const with_includes = tree(trx)
    .where('scoped.code', 'in', matching_parents)
    .select(
      sql<number>`
        similarity(description, ${term})
      `.as('similarity'),
    ).select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('icd10_diagnoses_includes')
          .whereRef('icd10_diagnoses_includes.code', '=', 'scoped.code')
          .select('icd10_diagnoses_includes.note')
          .select(sql<number>`
            similarity(description, ${term})
          `.as('similarity')),
      ).as('includes'),
    ])
    .as('with_includes')

  return trx.selectFrom(with_includes)
    .selectAll('with_includes')
    .select([
      sql<number>`MAX((with_includes.includes->>'similarity')::numeric)`.as(
        'max_includes_similarity',
      ),
    ])
    .orderBy('similarity', 'desc')
    .limit(limit)
    .execute()
}

export function searchFlat(
  trx: TrxOrDb,
  { term, code_range, limit = 20 }: {
    term: string
    code_range?: string | string[]
    limit?: number
  },
) {
  const with_includes = searchBaseQuery(trx, { term, code_range })
    .selectFrom('matches')
    .innerJoin(
      'icd10_diagnoses',
      'icd10_diagnoses.code',
      'matches.code',
    )
    .selectAll('icd10_diagnoses')
    .select(
      sql<number>`
        similarity(icd10_diagnoses.description, ${term})
      `.as('similarity'),
    )
    .select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('icd10_diagnoses_includes')
          .whereRef('icd10_diagnoses_includes.code', '=', 'matches.code')
          .select('icd10_diagnoses_includes.note')
          .select(sql<number>`
            similarity(note, ${term})
          `.as('similarity')),
      ).as('includes'),
    ]).as('with_includes')

  return trx.selectFrom(with_includes)
    .selectAll('with_includes')
    // Maximum similarity of the description or any of the includes notes
    .select([
      sql<number>`
        GREATEST(
          with_includes.similarity,
          (SELECT max((include->>'similarity')::real)
             FROM json_array_elements(includes) AS include)
        )
      `.as('best_similarity'),
    ])
    .orderBy('best_similarity', 'desc')
    .limit(limit)
    .execute()
}

// deno-fmt-ignore
const symptoms_chapter = [
  'R00', 'R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10', 'R11',
  'R12', 'R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'R20', 'R21', 'R22', 'R23',
  'R24', 'R25', 'R26', 'R27', 'R28', 'R29', 'R30', 'R31', 'R32', 'R33', 'R34', 'R35',
  'R36', 'R37', 'R38', 'R39', 'R40', 'R41', 'R42', 'R43', 'R44', 'R45', 'R46', 'R47',
  'R48', 'R49', 'R50', 'R51', 'R52', 'R53', 'R54', 'R55', 'R56', 'R57', 'R58', 'R59',
  'R60', 'R61', 'R62', 'R63', 'R64', 'R65', 'R66', 'R67', 'R68', 'R69'
]

const other_symptoms = [
  'G43',
  'G44',
  'G50.1',
  'G54.6',
  'G89',
  'H57.1',
  'H92.0',
  'K08.8',
  'K14.6',
  'K52.9',
  'K59',
  'K92.0',
  'K92.1',
  'M25.5',
  'M25.51',
  'M54',
  'M79.1',
  'M79.6',
  'N23',
  'N64.4',
  'N94.81',
  'T82.84',
  'T83.84',
  'T84.84',
  'T85.84',
]

const symptoms_code_ranges = [
  ...symptoms_chapter,
  ...other_symptoms,
]

export function searchSymptoms(
  trx: TrxOrDb,
  term: string,
) {
  return searchTree(trx, { term, code_range: symptoms_code_ranges })
}

export function byCode(trx: TrxOrDb, code: string) {
  return trx.selectFrom('icd10_diagnoses')
    .where('code', '=', code)
    .selectAll()
    .executeTakeFirst()
}

export function byCodeWithSimilarity(trx: TrxOrDb, code: string, term: string) {
  const with_includes = trx.selectFrom('icd10_diagnoses')
    .where('code', '=', code)
    .selectAll()
    .select(
      sql<number>`
        similarity(description, ${term})
      `.as('similarity'),
    ).select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('icd10_diagnoses_includes')
          .whereRef(
            'icd10_diagnoses_includes.code',
            '=',
            'icd10_diagnoses.code',
          )
          .select('icd10_diagnoses_includes.note')
          .select(sql<number>`
            similarity(note, ${term})
          `.as('similarity')),
      ).as('includes'),
    ]).as('with_includes')

  return trx.selectFrom(with_includes)
    .selectAll('with_includes')
    // Maximum similarity of the description or any of the includes notes
    .select([
      sql<number>`
        GREATEST(
          with_includes.similarity,
          (SELECT max((include->>'similarity')::real)
              FROM json_array_elements(includes) AS include)
        )
      `.as('best_similarity'),
    ])
    .executeTakeFirst()
}
