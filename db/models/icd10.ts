import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { RenderedICD10DiagnosisTreeWithOptionalIncludes, TrxOrDbOrQueryCreator } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { base, identity } from './_base.ts'

function name(table_name: string) {
  return sql<
    string
  >`${sql.ref(table_name)}.description || ' (' || ${sql.ref(table_name)}.code || ')'`.as('name')
}

// Yield the tree of sub_diagnoses
// We need not do this recursively, as we know the maximum depth of the tree
function tree(trx: TrxOrDbOrQueryCreator) {
  return trx.with(
    'icd10_diagnoses_tree',
    (qb) =>
      qb.selectFrom('icd10_diagnoses as icd10_diagnoses_tree')
        .selectAll('icd10_diagnoses_tree')
        .select([
          'icd10_diagnoses_tree.code as id',
          name('icd10_diagnoses_tree'),
        ])
        .select((eb_parent0) => [
          jsonArrayFrom(
            eb_parent0
              .selectFrom('icd10_diagnoses as sd0')
              .whereRef('sd0.parent_code', '=', 'icd10_diagnoses_tree.code')
              .selectAll('sd0')
              .select(name('sd0'))
              .select((eb_sd0) => [
                jsonArrayFrom(
                  eb_sd0
                    .selectFrom('icd10_diagnoses as sd1')
                    .whereRef('sd1.parent_code', '=', 'sd0.code')
                    .selectAll('sd1')
                    .select(name('sd1'))
                    .select((eb_sd1) => [
                      jsonArrayFrom(
                        eb_sd1
                          .selectFrom('icd10_diagnoses as sd2')
                          .whereRef('sd2.parent_code', '=', 'sd1.code')
                          .selectAll('sd2')
                          .select(name('sd2'))
                          .select((eb_sd2) => [
                            jsonArrayFrom(
                              eb_sd2
                                .selectFrom('icd10_diagnoses as sd3')
                                .whereRef('sd3.parent_code', '=', 'sd2.code')
                                .selectAll('sd3')
                                .select(name('sd3')),
                            ).as('sub_diagnoses'),
                          ]),
                      ).as('sub_diagnoses'),
                    ]),
                ).as('sub_diagnoses'),
              ]),
          ).as('sub_diagnoses'),
        ]),
  )
}

function searchBaseQuery(
  trx: TrxOrDbOrQueryCreator,
  { search, code_range }: {
    search?: string
    code_range?: string | string[]
  },
) {
  return trx.with('raw_matches', (qb) =>
    qb.selectFrom('icd10_diagnoses')
      .select('code')
      .where(
        sql<boolean>`(
          description @@ plainto_tsquery(${search})
        )`,
      )
      .unionAll(
        qb.selectFrom('icd10_diagnoses_includes')
          .select('code')
          .where(
            sql<boolean>`(
              note @@ plainto_tsquery(${search})
            )`,
          ),
      )).with('matches', (qb) => {
      const matches_query = qb
        .selectFrom('icd10_diagnoses')
        .where(
          'icd10_diagnoses.code',
          'in',
          qb.selectFrom('raw_matches').select('code'),
        )
        .select('icd10_diagnoses.code')

      if (!code_range) {
        return matches_query
      }
      const code_range_array = Array.isArray(code_range) ? code_range : [code_range]

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
                  sql<
                    boolean
                  >`LEFT(code, ${code_range.length}) = ${code_range}`,
                ])
            }),
          ),
      )
    })
}

function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  { search, code_range }: { search?: string; code_range?: string | string[] },
) {
  const base = searchBaseQuery(trx, { search, code_range })

  const parents = base.with(
    'with_ancestors',
    (qb) =>
      qb.selectFrom('matches as descendant_matches')
        .innerJoin(
          'icd10_diagnoses as descendants',
          'descendants.code',
          'descendant_matches.code',
        )
        .leftJoin(
          'icd10_diagnoses as ancestors0',
          'ancestors0.code',
          'descendants.parent_code',
        )
        .leftJoin(
          'icd10_diagnoses as ancestors1',
          'ancestors1.code',
          'ancestors0.parent_code',
        )
        .leftJoin(
          'icd10_diagnoses as ancestors2',
          'ancestors2.code',
          'ancestors1.parent_code',
        )
        .leftJoin(
          'icd10_diagnoses as ancestors3',
          'ancestors3.code',
          'ancestors2.parent_code',
        )
        .select([
          'descendants.code as code',
          'ancestors0.code as ancestor0',
          'ancestors1.code as ancestor1',
          'ancestors2.code as ancestor2',
          'ancestors3.code as ancestor3',
        ]),
  ).with('has_parent_in_matches', (qb) =>
    qb.selectFrom('with_ancestors')
      .innerJoin(
        'matches',
        (join) =>
          join.on((eb) =>
            eb.or([
              eb('matches.code', '=', eb.ref('with_ancestors.ancestor0')),
              eb('matches.code', '=', eb.ref('with_ancestors.ancestor1')),
              eb('matches.code', '=', eb.ref('with_ancestors.ancestor2')),
              eb('matches.code', '=', eb.ref('with_ancestors.ancestor3')),
            ])
          ),
      )
      .select('with_ancestors.code'))
    .selectFrom('matches')
    .leftJoin(
      'has_parent_in_matches',
      'has_parent_in_matches.code',
      'matches.code',
    )
    .where('has_parent_in_matches.code', 'is', null)
    .select('matches.code')

  const with_includes = tree(trx)
    .selectFrom('icd10_diagnoses_tree')
    .where('icd10_diagnoses_tree.code', 'in', parents)
    .selectAll('icd10_diagnoses_tree')
    .select(
      sql<number>`
      similarity(description, ${search})
    `.as('similarity'),
    ).select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('icd10_diagnoses_includes')
          .whereRef(
            'icd10_diagnoses_includes.code',
            '=',
            'icd10_diagnoses_tree.code',
          )
          .select('icd10_diagnoses_includes.note')
          .select(sql<number>`
          similarity(note, ${search})
        `.as('similarity')),
      ).as('includes'),
    ])
    .as('with_includes')

  return trx.selectFrom(with_includes)
    .selectAll('with_includes')
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
}

const code_regex = /^[A-Z][A-Z0-9][A-Z0-9]\.?\d?\d?\d?\d?$/

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

export const icd10 = base({
  verbose: true,
  // deno-lint-ignore no-explicit-any
  top_level_table: 'icd10_diagnoses' as any,
  baseQuery,
  formatResult: identity,
  searchTree(
    trx: TrxOrDbOrQueryCreator,
    { search, code_range, limit = 20 }: {
      search: string
      code_range?: string | string[]
      limit?: number
    },
  ): Promise<RenderedICD10DiagnosisTreeWithOptionalIncludes[]> {
    if (code_regex.test(search)) {
      return tree(trx)
        .selectFrom('icd10_diagnoses_tree')
        .where('icd10_diagnoses_tree.code', '=', search)
        .selectAll('icd10_diagnoses_tree')
        .select((eb) => [
          jsonArrayFrom(
            eb.selectFrom('icd10_diagnoses_includes')
              .whereRef(
                'icd10_diagnoses_includes.code',
                '=',
                'icd10_diagnoses_tree.code',
              )
              .select('icd10_diagnoses_includes.note'),
          ).as('includes'),
        ])
        .execute()
    }

    return baseQuery(trx, { search, code_range }).limit(limit).execute()
  },
  searchFlat(
    trx: TrxOrDbOrQueryCreator,
    { search, code_range, limit = 20 }: {
      search: string
      code_range?: string | string[]
      limit?: number
    },
  ) {
    const with_includes = searchBaseQuery(trx, { search, code_range })
      .selectFrom('matches')
      .innerJoin(
        'icd10_diagnoses',
        'icd10_diagnoses.code',
        'matches.code',
      )
      .selectAll('icd10_diagnoses')
      .select(
        sql<number>`
        similarity(icd10_diagnoses.description, ${search})
      `.as('similarity'),
      )
      .select((eb) => [
        jsonArrayFrom(
          eb.selectFrom('icd10_diagnoses_includes')
            .whereRef('icd10_diagnoses_includes.code', '=', 'matches.code')
            .select('icd10_diagnoses_includes.note')
            .select(sql<number>`
            similarity(note, ${search})
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
  },
  searchSymptoms(
    trx: TrxOrDbOrQueryCreator,
    search: string,
  ) {
    return icd10.searchTree(trx, { search, code_range: symptoms_code_ranges })
  },
  byCode(trx: TrxOrDbOrQueryCreator, code: string) {
    return trx.selectFrom('icd10_diagnoses')
      .where('code', '=', code)
      .selectAll()
      .executeTakeFirst()
  },
  byCodeWithSimilarity(trx: TrxOrDbOrQueryCreator, code: string, search: string) {
    const with_includes = trx.selectFrom('icd10_diagnoses')
      .where('code', '=', code)
      .selectAll()
      .select(
        sql<number>`
        similarity(description, ${search})
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
            similarity(note, ${search})
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
  },
})
