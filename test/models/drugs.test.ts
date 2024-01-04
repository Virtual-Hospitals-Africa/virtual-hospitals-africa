import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as drugs from '../../db/models/drugs.ts'
import deepOmit from '../../util/deepOmit.ts'

describe('db/models/drugs.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('search', () => {
    it('gets search results for drugs with their forms, strengths, and manufacturers', async () => {
      const results = await drugs.search(db, { search: 'abacavir' })
      assertEquals(
        deepOmit(results, [
          'drug_id',
          'medication_id',
          'manufactured_medication_id',
        ]),
        deepOmit(expected_results, [
          'drug_id',
          'medication_id',
          'manufactured_medication_id',
        ]),
      )
    })
  })
})

const expected_results = [
  {
    'drug_id': 2,
    'drug_generic_name': 'ABACAVIR',
    'distinct_trade_names': [],
    'medications': [
      {
        'medication_id': 2,
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
            'manufactured_medication_id': 2,
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABACAVIR',
            'manufacturer_name': 'AUROBINDO PHARMA LTD JEDCHERLA INDIA;',
          },
        ],
      },
    ],
  },
  {
    'drug_id': 3,
    'drug_generic_name': 'ABACAVIR SULFATE; LAMIVUDINE',
    'distinct_trade_names': [
      'ABACAVIR SULPHATE; LAMIVUDINE',
    ],
    'medications': [
      {
        'medication_id': 3,
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
            'manufactured_medication_id': 3,
            'strength_numerators': [
              30,
              60,
            ],
            'trade_name': 'ABACAVIR SULFATE; LAMIVUDINE',
            'manufacturer_name': 'MYLAN LABORATORIES LTD SINNAR INDIA;',
          },
          {
            'manufactured_medication_id': 10,
            'strength_numerators': [
              60,
              120,
            ],
            'trade_name': 'ABACAVIR SULFATE; LAMIVUDINE',
            'manufacturer_name': 'MYLAN LAB LTD MAHARASHTRA INDIA;',
          },
        ],
      },
      {
        'medication_id': 11,
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
            'manufactured_medication_id': 18,
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULFATE; LAMIVUDINE',
            'manufacturer_name': 'AUROBINDO PHARMA LIMITED HYDERABAD ;',
          },
          {
            'manufactured_medication_id': 24,
            'strength_numerators': [
              30,
              60,
            ],
            'trade_name': 'ABACAVIR SULFATE; LAMIVUDINE',
            'manufacturer_name': 'AURO BINDO PHARMA LTD  INDIA;',
          },
          {
            'manufactured_medication_id': 26,
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'manufacturer_name':
              'CIPLA LTD MAHAD INDIA;  CIPLA LIMITED (GOA UNIT VII) GOA INDIA;',
          },
        ],
      },
      {
        'medication_id': 22,
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
            'manufactured_medication_id': 36,
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'manufacturer_name':
              'SUN PHARMACEUTICAL INDUSTRIES LIMITED PAONTA SAHIB INDIA;',
          },
        ],
      },
    ],
  },
  {
    'drug_id': 4,
    'drug_generic_name': 'ABACAVIR SULPHATE',
    'distinct_trade_names': [
      'ABAMAT TABLETS',
      'ZIAGEN',
    ],
    'medications': [
      {
        'medication_id': 4,
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
            'manufactured_medication_id': 4,
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABACAVIR SULPHATE',
            'manufacturer_name': 'STRIDES ARCOLAB LTD BANGALOR INDIA;',
          },
          {
            'manufactured_medication_id': 11,
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABACAVIR SULPHATE',
            'manufacturer_name': 'CIPLA LTD MAHAD INDIA;',
          },
          {
            'manufactured_medication_id': 14,
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABAMAT TABLETS',
            'manufacturer_name':
              'MYLAN LABORATORIES LTD SINNAR INDIA;  MYLAN LABORATORIES LIMITED BAVLA INDIA;',
          },
          {
            'manufactured_medication_id': 19,
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ZIAGEN',
            'manufacturer_name':
              'GLAXO WELLCOME OPERATIONS HERTFORDSHIRE UK;  GLAXOSMITHKLINE PHARMACEUTICALS POZNAN POLAND;',
          },
        ],
      },
      {
        'medication_id': 15,
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
            'manufactured_medication_id': 27,
            'strength_numerators': [
              20,
            ],
            'trade_name': 'ABACAVIR SULPHATE',
            'manufacturer_name': 'HETERO DRUGS LTD JADCHERLA INDIA;',
          },
          {
            'manufactured_medication_id': 31,
            'strength_numerators': [
              20,
            ],
            'trade_name': 'ZIAGEN',
            'manufacturer_name': 'GLAXO WELLCOME OPERATIONS HERTFORDSHIRE UK;',
          },
        ],
      },
      {
        'medication_id': 23,
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
            'manufactured_medication_id': 39,
            'strength_numerators': [
              300,
            ],
            'trade_name': 'ABACAVIR SULPHATE',
            'manufacturer_name': 'HETERO DRUGS LTD JADCHERLA INDIA;',
          },
        ],
      },
    ],
  },
  {
    'drug_id': 5,
    'drug_generic_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
    'distinct_trade_names': [],
    'medications': [
      {
        'medication_id': 5,
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
            'manufactured_medication_id': 5,
            'strength_numerators': [
              30,
              60,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'manufacturer_name': 'MYLAN LABORATORIES LTD SINNAR INDIA;',
          },
          {
            'manufactured_medication_id': 12,
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'manufacturer_name':
              'MYLAN LABORATORIES LTD SINNAR INDIA;  MYLAN LABORATORIES LIMITED BAVLA INDIA;',
          },
        ],
      },
      {
        'medication_id': 12,
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
            'manufactured_medication_id': 20,
            'strength_numerators': [
              300,
              600,
            ],
            'trade_name': 'ABACAVIR SULPHATE; LAMIVUDINE',
            'manufacturer_name': 'HETERO LABS LTD, ANDHRA PRADESH INDIA;',
          },
        ],
      },
    ],
  },
]
