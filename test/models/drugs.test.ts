import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as drugs from '../../db/models/drugs.ts'
import deepOmit from '../../util/deepOmit.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/drugs.ts', { sanitizeResources: false }, () => {
  describe('search', () => {
    itUsesTrxAnd(
      'gets search results for drugs with their forms, strengths, and manufacturers',
      async (trx) => {
        const results = await drugs.search(trx, { search: 'abacavir' })
        console.log(JSON.stringify(
          deepOmit(results, [
            'id',
            'medication_id',
            'manufactured_medication_id',
          ]),
          null,
          2,
        ))
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
  })
})

const expected_results = [
  {
    'name': 'ABACAVIR',
    'distinct_trade_names': [],
    'medications': [
      {
        'form': 'TABLET, COATED',
        'form_route': 'TABLET, COATED; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          300,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '300MG',
        'manufacturers': [
          {
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABACAVIR',
            'applicant_name': 'AUROBINDO PHARMA LIMITED',
            'recalled_at': null,
          },
        ],
      },
    ],
    'fully_recalled': false,
  },
  {
    'name': 'ABACAVIR SULPHATE',
    'distinct_trade_names': [
      'ABAMAT TABLETS',
      'ZIAGEN',
    ],
    'medications': [
      {
        'form': 'SOLUTION',
        'form_route': 'SOLUTION',
        'routes': [
          'INJECTION',
          'ORAL',
          'INHALATION',
          'TOPICAL',
        ],
        'strength_numerators': [
          20,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'ML',
        'strength_denominator_is_units': true,
        'strength_summary': '20MG/ML',
        'manufacturers': [
          {
            'strength_numerators': [
              20,
            ],
            'trade_name': 'ABACAVIR SULPHATE',
            'applicant_name': 'HETERO LABS LTD',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              20,
            ],
            'trade_name': 'ZIAGEN',
            'applicant_name': 'GLAXO-WELLCOME ZIMBABWE PVT LTD',
            'recalled_at': null,
          },
        ],
      },
      {
        'form': 'TABLET, COATED',
        'form_route': 'TABLET, COATED; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          300,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '300MG',
        'manufacturers': [
          {
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABACAVIR SULPHATE',
            'applicant_name': 'CIPLA LTD',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABACAVIR SULPHATE',
            'applicant_name': 'STRIDES ARCOLAB LTD',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABAMAT TABLETS',
            'applicant_name': 'MYLAN LABORATORIES LIMITED',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ZIAGEN',
            'applicant_name': 'GLAXOSMITHKLINE S.A (PTY) LTD',
            'recalled_at': null,
          },
        ],
      },
      {
        'form': 'TABLET',
        'form_route': 'TABLET; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          300,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '300MG',
        'manufacturers': [
          {
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABACAVIR SULPHATE',
            'applicant_name': 'HETERO LABS LTD',
            'recalled_at': null,
          },
        ],
      },
    ],
    'fully_recalled': false,
  },
  {
    'name': 'ABACAVIR; LAMIVUDINE',
    'distinct_trade_names': [
      'ABAMUNE L BABY',
      'KIVEXA',
    ],
    'medications': [
      {
        'form': 'CAPSULE',
        'form_route': 'CAPSULE; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          30,
          60,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'CAPSULE',
        'strength_denominator_is_units': false,
        'strength_summary': '30, 60MG',
        'manufacturers': [
          {
            'strength_numerators': [
              30,
              60,
            ],
            'trade_name': 'ABAMUNE L BABY',
            'applicant_name': 'CIPLA LTD',
            'recalled_at': null,
          },
        ],
      },
      {
        'form': 'TABLET',
        'form_route': 'TABLET; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          300,
          600,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '300, 600MG',
        'manufacturers': [
          {
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'KIVEXA',
            'applicant_name': 'GLAXOSMITHKLINE S.A (PTY) LTD',
            'recalled_at': null,
          },
        ],
      },
    ],
    'fully_recalled': false,
  },
  {
    'name': 'ABACAVIR SULFATE; LAMIVUDINE',
    'distinct_trade_names': [
      'ABACAVIR SULPHATE; LAMIVUDINE',
    ],
    'medications': [
      {
        'form': 'TABLET',
        'form_route': 'TABLET',
        'routes': [
          'ORAL',
          'RECTAL',
          'VAGINAL',
          'SUBLINGUAL',
          'BUCCAL',
        ],
        'strength_numerators': [
          300,
          600,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '300, 600MG',
        'manufacturers': [
          {
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'applicant_name': 'SUN PHARMACEUTICAL INDUSTRIES LIMITED',
            'recalled_at': null,
          },
        ],
      },
      {
        'form': 'TABLET, COATED',
        'form_route': 'TABLET, COATED; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          30,
          60,
          300,
          600,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '30, 60, 300, 600MG',
        'manufacturers': [
          {
            'strength_numerators': [
              30,
              60,
            ],
            'trade_name': 'ABACAVIR SULFATE; LAMIVUDINE',
            'applicant_name': 'AUROBINDO PHARMA LIMITED',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULFATE; LAMIVUDINE',
            'applicant_name': 'AUROBINDO PHARMA LIMITED',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'applicant_name': 'CIPLA LTD',
            'recalled_at': null,
          },
        ],
      },
      {
        'form': 'TABLET',
        'form_route': 'TABLET; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          30,
          60,
          120,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '30, 60, 120MG',
        'manufacturers': [
          {
            'strength_numerators': [
              30,
              60,
            ],
            'trade_name': 'ABACAVIR SULFATE; LAMIVUDINE',
            'applicant_name': 'MYLAN LABORATORIES LIMITED',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              60,
              120,
            ],
            'trade_name': 'ABACAVIR SULFATE; LAMIVUDINE',
            'applicant_name': 'MYLAN LABORATORIES LIMITED',
            'recalled_at': null,
          },
        ],
      },
    ],
    'fully_recalled': false,
  },
  {
    'name': 'ABACAVIR SULPHATE; LAMIVUDINE',
    'distinct_trade_names': [],
    'medications': [
      {
        'form': 'TABLET, COATED',
        'form_route': 'TABLET, COATED; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          300,
          600,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '300, 600MG',
        'manufacturers': [
          {
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'applicant_name': 'HETERO LABS LTD',
            'recalled_at': null,
          },
        ],
      },
      {
        'form': 'TABLET',
        'form_route': 'TABLET; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          30,
          60,
          300,
          600,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '30, 60, 300, 600MG',
        'manufacturers': [
          {
            'strength_numerators': [
              30,
              60,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'applicant_name': 'MYLAN LABORATORIES LIMITED',
            'recalled_at': null,
          },
          {
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'applicant_name': 'MYLAN LABORATORIES LIMITED',
            'recalled_at': null,
          },
        ],
      },
    ],
    'fully_recalled': false,
  },
  {
    'name': 'ABACAVIR; DOLUTEGRAVIR; LAMIVUDINE',
    'distinct_trade_names': [],
    'medications': [
      {
        'form': 'TABLET, COATED',
        'form_route': 'TABLET, COATED; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          50,
          300,
          600,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '50, 300, 600MG',
        'manufacturers': [
          {
            'strength_numerators': [
              50,
              300,
              600,
            ],
            'trade_name': 'ABACAVIR; DOLUTEGRAVIR; LAMIVUDINE',
            'applicant_name': 'CIPLA LTD',
            'recalled_at': null,
          },
        ],
      },
    ],
    'fully_recalled': false,
  },
  {
    'name': 'ABACAVIR SULPHATE; LAMIVUDINE; ZIDOVUDINE',
    'distinct_trade_names': [],
    'medications': [
      {
        'form': 'TABLET',
        'form_route': 'TABLET; ORAL',
        'routes': [
          'ORAL',
        ],
        'strength_numerators': [
          150,
          300,
        ],
        'strength_numerator_unit': 'MG',
        'strength_denominator': 1,
        'strength_denominator_unit': 'TABLET',
        'strength_denominator_is_units': false,
        'strength_summary': '150, 300MG',
        'manufacturers': [
          {
            'strength_numerators': [
              150,
              300,
              300,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE; ZIDOVUDINE',
            'applicant_name': 'MYLAN LABORATORIES LIMITED',
            'recalled_at': null,
          },
        ],
      },
    ],
    'fully_recalled': false,
  },
]
