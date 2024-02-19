import { describe } from 'std/testing/bdd.ts'
import { search } from '../../db/models/icd10.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'

describe('db/models/icd10.ts', { sanitizeResources: false }, () => {
  describe('search', () => {
    itUsesTrxAnd(
      'can return sane results, even with a misspelling',
      async (trx) => {
        const results = await search(trx, {
          term: 'wrist woound',
        })
        assertEquals(results, [
          {
            category: 'M25',
            code: 'M25.13',
            description: 'Fistula, wrist',
            general: false,
            id: 'M25.13',
            includes: null,
            name: 'Fistula, wrist',
            parent_code: 'M25.1',
            rank: 0.7123179275482191,
            sub_diagnoses: [
              {
                category: 'M25',
                code: 'M25.131',
                description: 'Fistula, right wrist',
                general: false,
                includes: null,
                parent_code: 'M25.13',
                sub_diagnoses: [],
              },
              {
                category: 'M25',
                code: 'M25.132',
                description: 'Fistula, left wrist',
                general: false,
                includes: null,
                parent_code: 'M25.13',
                sub_diagnoses: [],
              },
              {
                category: 'M25',
                code: 'M25.139',
                description: 'Fistula, unspecified wrist',
                general: true,
                includes: null,
                parent_code: 'M25.13',
                sub_diagnoses: [],
              },
            ],
          },
          {
            category: 'M25',
            code: 'M25.53',
            description: 'Pain in wrist',
            general: false,
            id: 'M25.53',
            includes: null,
            name: 'Pain in wrist',
            parent_code: 'M25.5',
            rank: 0.7123179275482191,
            sub_diagnoses: [
              {
                category: 'M25',
                code: 'M25.531',
                description: 'Pain in right wrist',
                general: false,
                includes: null,
                parent_code: 'M25.53',
                sub_diagnoses: [],
              },
              {
                category: 'M25',
                code: 'M25.532',
                description: 'Pain in left wrist',
                general: false,
                includes: null,
                parent_code: 'M25.53',
                sub_diagnoses: [],
              },
              {
                category: 'M25',
                code: 'M25.539',
                description: 'Pain in unspecified wrist',
                general: true,
                includes: null,
                parent_code: 'M25.53',
                sub_diagnoses: [],
              },
            ],
          },
          {
            category: 'S61',
            code: 'S61.5',
            description: 'Open wound of wrist',
            general: false,
            id: 'S61.5',
            includes: null,
            name: 'Open wound of wrist',
            parent_code: 'S61',
            rank: 0.7123179275482191,
            sub_diagnoses: [
              {
                category: 'S61',
                code: 'S61.50',
                description: 'Unspecified open wound of wrist',
                general: true,
                includes: null,
                parent_code: 'S61.5',
                sub_diagnoses: [
                  {
                    category: 'S61',
                    code: 'S61.501',
                    description: 'Unspecified open wound of right wrist',
                    general: true,
                    includes: null,
                    parent_code: 'S61.50',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.502',
                    description: 'Unspecified open wound of left wrist',
                    general: true,
                    includes: null,
                    parent_code: 'S61.50',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.509',
                    description: 'Unspecified open wound of unspecified wrist',
                    general: true,
                    includes: null,
                    parent_code: 'S61.50',
                    sub_diagnoses: [],
                  },
                ],
              },
              {
                category: 'S61',
                code: 'S61.51',
                description: 'Laceration without foreign body of wrist',
                general: false,
                includes: null,
                parent_code: 'S61.5',
                sub_diagnoses: [
                  {
                    category: 'S61',
                    code: 'S61.511',
                    description:
                      'Laceration without foreign body of right wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.51',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.512',
                    description:
                      'Laceration without foreign body of left wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.51',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.519',
                    description:
                      'Laceration without foreign body of unspecified wrist',
                    general: true,
                    includes: null,
                    parent_code: 'S61.51',
                    sub_diagnoses: [],
                  },
                ],
              },
              {
                category: 'S61',
                code: 'S61.52',
                description: 'Laceration with foreign body of wrist',
                general: false,
                includes: null,
                parent_code: 'S61.5',
                sub_diagnoses: [
                  {
                    category: 'S61',
                    code: 'S61.521',
                    description: 'Laceration with foreign body of right wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.52',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.522',
                    description: 'Laceration with foreign body of left wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.52',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.529',
                    description:
                      'Laceration with foreign body of unspecified wrist',
                    general: true,
                    includes: null,
                    parent_code: 'S61.52',
                    sub_diagnoses: [],
                  },
                ],
              },
              {
                category: 'S61',
                code: 'S61.53',
                description: 'Puncture wound without foreign body of wrist',
                general: false,
                includes: null,
                parent_code: 'S61.5',
                sub_diagnoses: [
                  {
                    category: 'S61',
                    code: 'S61.531',
                    description:
                      'Puncture wound without foreign body of right wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.53',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.532',
                    description:
                      'Puncture wound without foreign body of left wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.53',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.539',
                    description:
                      'Puncture wound without foreign body of unspecified wrist',
                    general: true,
                    includes: null,
                    parent_code: 'S61.53',
                    sub_diagnoses: [],
                  },
                ],
              },
              {
                category: 'S61',
                code: 'S61.54',
                description: 'Puncture wound with foreign body of wrist',
                general: false,
                includes: null,
                parent_code: 'S61.5',
                sub_diagnoses: [
                  {
                    category: 'S61',
                    code: 'S61.541',
                    description:
                      'Puncture wound with foreign body of right wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.54',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.542',
                    description:
                      'Puncture wound with foreign body of left wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.54',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.549',
                    description:
                      'Puncture wound with foreign body of unspecified wrist',
                    general: true,
                    includes: null,
                    parent_code: 'S61.54',
                    sub_diagnoses: [],
                  },
                ],
              },
              {
                category: 'S61',
                code: 'S61.55',
                description: 'Open bite of wrist',
                general: false,
                includes: 'Bite of wrist NOS',
                parent_code: 'S61.5',
                sub_diagnoses: [
                  {
                    category: 'S61',
                    code: 'S61.551',
                    description: 'Open bite of right wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.55',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.552',
                    description: 'Open bite of left wrist',
                    general: false,
                    includes: null,
                    parent_code: 'S61.55',
                    sub_diagnoses: [],
                  },
                  {
                    category: 'S61',
                    code: 'S61.559',
                    description: 'Open bite of unspecified wrist',
                    general: true,
                    includes: null,
                    parent_code: 'S61.55',
                    sub_diagnoses: [],
                  },
                ],
              },
            ],
          },
        ])
      },
    )

    itUsesTrxAnd(
      'can return results with a code_start',
      async (trx) => {
        const results_starting_with_r = await search(trx, {
          term: 'Drug',
          code_start: 'R',
        })
        assertEquals(results_starting_with_r.length, 10)
        assertEquals(
          results_starting_with_r[0].name,
          'Drug induced retention of urine',
        )
        assertEquals(results_starting_with_r[1].name, 'Drug induced fever')

        const results_starting_with_any = await search(trx, {
          term: 'Drug',
        })

        assertNotEquals(
          results_starting_with_any.length,
          results_starting_with_r.length,
        )
      },
    )
  })
})
