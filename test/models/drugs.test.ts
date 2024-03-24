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
    distinct_trade_names: [],
    medications: [
      {
        form: 'TABLET, COATED',
        form_route: 'TABLET, COATED; ORAL',
        manufacturers: [
          {
            applicant_name: 'AUROBINDO PHARMA LIMITED',
            strength_numerators: [
              300,
            ],
            trade_name: 'ABACAVIR',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          300,
        ],
        strength_summary: '300MG',
      },
    ],
    name: 'ABACAVIR',
  },
  {
    distinct_trade_names: [
      'ABAMAT TABLETS',
      'ZIAGEN',
    ],
    medications: [
      {
        form: 'TABLET, COATED',
        form_route: 'TABLET, COATED; ORAL',
        manufacturers: [
          {
            applicant_name: 'STRIDES ARCOLAB LTD',
            strength_numerators: [
              300,
            ],
            trade_name: 'ABACAVIR SULPHATE',
          },
          {
            applicant_name: 'CIPLA LTD',
            strength_numerators: [
              300,
            ],
            trade_name: 'ABACAVIR SULPHATE',
          },
          {
            applicant_name: 'MYLAN LABORATORIES LIMITED',
            strength_numerators: [
              300,
            ],
            trade_name: 'ABAMAT TABLETS',
          },
          {
            applicant_name: 'GLAXOSMITHKLINE S.A (PTY) LTD',
            strength_numerators: [
              300,
            ],
            trade_name: 'ZIAGEN',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          300,
        ],
        strength_summary: '300MG',
      },
      {
        form: 'SOLUTION',
        form_route: 'SOLUTION',
        manufacturers: [
          {
            applicant_name: 'HETERO LABS LTD',
            strength_numerators: [
              20,
            ],
            trade_name: 'ABACAVIR SULPHATE',
          },
          {
            applicant_name: 'GLAXO-WELLCOME ZIMBABWE PVT LTD',
            strength_numerators: [
              20,
            ],
            trade_name: 'ZIAGEN',
          },
        ],
        routes: [
          'INJECTION',
          'ORAL',
          'INHALATION',
          'TOPICAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: true,
        strength_denominator_unit: 'ML',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          20,
        ],
        strength_summary: '20MG/ML',
      },
      {
        form: 'TABLET',
        form_route: 'TABLET; ORAL',
        manufacturers: [
          {
            applicant_name: 'HETERO LABS LTD',
            strength_numerators: [
              300,
            ],
            trade_name: 'ABACAVIR SULPHATE',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          300,
        ],
        strength_summary: '300MG',
      },
    ],
    name: 'ABACAVIR SULPHATE',
  },
  {
    distinct_trade_names: [
      'ABAMUNE L BABY',
      'KIVEXA',
    ],
    medications: [
      {
        form: 'CAPSULE',
        form_route: 'CAPSULE; ORAL',
        manufacturers: [
          {
            applicant_name: 'CIPLA LTD',
            strength_numerators: [
              30,
              60,
            ],
            trade_name: 'ABAMUNE L BABY',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'CAPSULE',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          30,
          60,
        ],
        strength_summary: '30, 60MG',
      },
      {
        form: 'TABLET',
        form_route: 'TABLET; ORAL',
        manufacturers: [
          {
            applicant_name: 'GLAXOSMITHKLINE S.A (PTY) LTD',
            strength_numerators: [
              300,
              600,
            ],
            trade_name: 'KIVEXA',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          300,
          600,
        ],
        strength_summary: '300, 600MG',
      },
    ],
    name: 'ABACAVIR; LAMIVUDINE',
  },
  {
    distinct_trade_names: [
      'ABACAVIR SULPHATE; LAMIVUDINE',
    ],
    medications: [
      {
        form: 'TABLET',
        form_route: 'TABLET; ORAL',
        manufacturers: [
          {
            applicant_name: 'MYLAN LABORATORIES LIMITED',
            strength_numerators: [
              30,
              60,
            ],
            trade_name: 'ABACAVIR SULFATE; LAMIVUDINE',
          },
          {
            applicant_name: 'MYLAN LABORATORIES LIMITED',
            strength_numerators: [
              60,
              120,
            ],
            trade_name: 'ABACAVIR SULFATE; LAMIVUDINE',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          30,
          60,
          120,
        ],
        strength_summary: '30, 60, 120MG',
      },
      {
        form: 'TABLET, COATED',
        form_route: 'TABLET, COATED; ORAL',
        manufacturers: [
          {
            applicant_name: 'AUROBINDO PHARMA LIMITED',
            strength_numerators: [
              300,
              600,
            ],
            trade_name: 'ABACAVIR SULFATE; LAMIVUDINE',
          },
          {
            applicant_name: 'AUROBINDO PHARMA LIMITED',
            strength_numerators: [
              30,
              60,
            ],
            trade_name: 'ABACAVIR SULFATE; LAMIVUDINE',
          },
          {
            applicant_name: 'CIPLA LTD',
            strength_numerators: [
              300,
              600,
            ],
            trade_name: 'ABACAVIR SULPHATE; LAMIVUDINE',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          30,
          60,
          300,
          600,
        ],
        strength_summary: '30, 60, 300, 600MG',
      },
      {
        form: 'TABLET',
        form_route: 'TABLET',
        manufacturers: [
          {
            applicant_name: 'SUN PHARMACEUTICAL INDUSTRIES LIMITED',
            strength_numerators: [
              300,
              600,
            ],
            trade_name: 'ABACAVIR SULPHATE; LAMIVUDINE',
          },
        ],
        routes: [
          'ORAL',
          'RECTAL',
          'VAGINAL',
          'SUBLINGUAL',
          'BUCCAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          300,
          600,
        ],
        strength_summary: '300, 600MG',
      },
    ],
    name: 'ABACAVIR SULFATE; LAMIVUDINE',
  },
  {
    distinct_trade_names: [],
    medications: [
      {
        form: 'TABLET',
        form_route: 'TABLET; ORAL',
        manufacturers: [
          {
            applicant_name: 'MYLAN LABORATORIES LIMITED',
            strength_numerators: [
              30,
              60,
            ],
            trade_name: 'ABACAVIR SULPHATE; LAMIVUDINE',
          },
          {
            applicant_name: 'MYLAN LABORATORIES LIMITED',
            strength_numerators: [
              300,
              600,
            ],
            trade_name: 'ABACAVIR SULPHATE; LAMIVUDINE',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          30,
          60,
          300,
          600,
        ],
        strength_summary: '30, 60, 300, 600MG',
      },
      {
        form: 'TABLET, COATED',
        form_route: 'TABLET, COATED; ORAL',
        manufacturers: [
          {
            applicant_name: 'HETERO LABS LTD',
            strength_numerators: [
              300,
              600,
            ],
            trade_name: 'ABACAVIR SULPHATE; LAMIVUDINE',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          300,
          600,
        ],
        strength_summary: '300, 600MG',
      },
    ],
    name: 'ABACAVIR SULPHATE; LAMIVUDINE',
  },
  {
    distinct_trade_names: [],
    medications: [
      {
        form: 'TABLET, COATED',
        form_route: 'TABLET, COATED; ORAL',
        manufacturers: [
          {
            applicant_name: 'CIPLA LTD',
            strength_numerators: [
              50,
              300,
              600,
            ],
            trade_name: 'ABACAVIR; DOLUTEGRAVIR; LAMIVUDINE',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          50,
          300,
          600,
        ],
        strength_summary: '50, 300, 600MG',
      },
    ],
    name: 'ABACAVIR; DOLUTEGRAVIR; LAMIVUDINE',
  },
  {
    distinct_trade_names: [],
    medications: [
      {
        form: 'TABLET',
        form_route: 'TABLET; ORAL',
        manufacturers: [
          {
            applicant_name: 'MYLAN LABORATORIES LIMITED',
            strength_numerators: [
              150,
              300,
              300,
            ],
            trade_name: 'ABACAVIR SULPHATE; LAMIVUDINE; ZIDOVUDINE',
          },
        ],
        routes: [
          'ORAL',
        ],
        strength_denominator: 1,
        strength_denominator_is_units: false,
        strength_denominator_unit: 'TABLET',
        strength_numerator_unit: 'MG',
        strength_numerators: [
          150,
          300,
        ],
        strength_summary: '150, 300MG',
      },
    ],
    name: 'ABACAVIR SULPHATE; LAMIVUDINE; ZIDOVUDINE',
  },
]
