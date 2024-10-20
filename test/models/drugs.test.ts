import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as drugs from '../../db/models/drugs.ts'
import * as manufactured_medications from '../../db/models/manufactured_medications.ts'
import deepOmit from '../../util/deepOmit.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/drugs.ts', { sanitizeResources: false }, () => {
  describe('search', () => {
    itUsesTrxAnd(
      'gets search results for drugs with their forms, strengths, and manufacturers',
      async (trx) => {
        const results = await drugs.search(trx, { search: 'NIFEDIPINE' })
        assertEquals(
          deepOmit(results, [
            'id',
            'medication_id',
            'manufactured_medication_id',
          ]),
          deepOmit(expected_results, [
            'id',
            'medication_id',
            'manufactured_medication_id',
          ]),
        )
      },
    )

    itUsesTrxAnd(
      "returns search results for drugs even if some manufacturers were recalled as long as some weren't if include_recalled: false",
      async (trx) => {
        const results = await drugs.search(trx, { search: 'NIFEDIPINE' })
        assertEquals(results.length, 1)

        const NIFEDIPINE = results[0]

        const { id: regulator_id } = await trx
          .selectFrom('regulators')
          .select('id')
          .limit(1)
          .executeTakeFirstOrThrow()

        const recalled = await manufactured_medications.recall(trx, {
          manufactured_medication_id: NIFEDIPINE.medications[0].manufacturers[0]
            .manufactured_medication_id,
          regulator_id,
        })

        const after_recall_results = await drugs.search(trx, {
          search: 'NIFEDIPINE',
        })
        assertEquals(after_recall_results.length, 1)

        assertEquals(
          after_recall_results[0].medications[0].manufacturers.length,
          NIFEDIPINE.medications[0].manufacturers.length - 1,
        )

        await manufactured_medications.unrecall(trx, {
          id: recalled.id,
        })
      },
    )

    itUsesTrxAnd(
      'does not return a drug if all manufacturers were recalled when include_recalled: false',
      async (trx) => {
        const results = await drugs.search(trx, { search: 'NIFEDIPINE' })
        assertEquals(results.length, 1)

        const NIFEDIPINE = results[0]
        assertEquals(NIFEDIPINE.medications.length, 1)

        const { id: regulator_id } = await trx
          .selectFrom('regulators')
          .select('id')
          .limit(1)
          .executeTakeFirstOrThrow()

        const recalling = NIFEDIPINE.medications[0].manufacturers.map(
          (manufacturer) =>
            manufactured_medications.recall(trx, {
              manufactured_medication_id:
                manufacturer.manufactured_medication_id,
              regulator_id,
            }),
        )

        const recalled = await Promise.all(recalling)

        const after_recall_results = await drugs.search(trx, {
          search: 'NIFEDIPINE',
        })

        assertEquals(after_recall_results.length, 0)

        await Promise.all(
          recalled.map((recall) =>
            manufactured_medications.unrecall(trx, {
              id: recall.id,
            })
          ),
        )
      },
    )
  })
})

const expected_results = [
  {
    'all_recalled': false,
    'distinct_trade_names': [
      'ADALAT XL 20',
      'ADALAT XL 30',
      'ADALAT XL 60',
      'CALCIGARD RETARD',
      'NIFELAT',
    ],
    'medications': [
      {
        'form': 'TABLET, COATED',
        'form_route': 'TABLET, COATED; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'manufacturers': [
          {
            'strength_numerators': [
              20,
            ],
            'trade_name': 'ADALAT XL 20',
            'applicant_name': 'BAYER (PTY) LTD',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              30,
            ],
            'trade_name': 'ADALAT XL 30',
            'applicant_name': 'BAYER (PTY) LTD',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              60,
            ],
            'trade_name': 'ADALAT XL 60',
            'applicant_name': 'BAYER (PTY) LTD',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              20,
            ],
            'trade_name': 'CALCIGARD RETARD',
            'applicant_name': 'TORRENT PHARMACEUTICALS',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              10,
            ],
            'trade_name': 'NIFELAT',
            'applicant_name': 'REMEDICA LTD',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              20,
            ],
            'trade_name': 'NIFELAT',
            'applicant_name': 'REMEDICA LTD',
            'recalled_at': null,
          },
        ],
        'strength_numerators': [
          10,
          20,
          30,
          60,
        ],
        'strength_summary': '10, 20, 30, 60MG',
      },
    ],
    'name': 'NIFEDIPINE',
  },
]
