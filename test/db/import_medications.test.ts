import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { parseMedicationSouthAfrica, parseSouthAfricaIngredient, SouthAfricaMedicationRow } from '../../db/seed/defs/inventory_medication/south_africa.ts'
import { ParsedMedication } from '../../db/seed/defs/inventory_medication/shared.ts'
import { performLookups } from '../../db/seed/defs/inventory_medication/lookup.ts'
import db from '../../db/db.ts'

describe('seed', () => {
  afterAll(() => db.destroy())

  const xylotox_row: SouthAfricaMedicationRow = {
    'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1inEJGjaWEUbmZ_YmkSS4ExBmQKh1QdXx7TJDbgundeR_RIjhcO0R-bMaXfDcKqP38RzFowDp9QppubyK1IYGV6DmwVbBI1j3TUTNqRLHfKYw',
    'applicantName': 'Adcock Ingram Limited',
    'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1igvAmebLTkdf3EsnaTXQctO_JB0hUrv7_BIrbUfvxs9I1DlLFkxlhM1Prjs07xqab5xD0Jlk149uvN9LiMvbuyHbq24At7Zb6FYOxh-cD4HQ',
    'application_no': 'P0170',
    'licence_no': 'P/4/170',
    'productName': 'XYLOTOX E80-A',
    'status': 'Registered',
    'expiryDate': '1900/01/01',
    'reg_date': '1982/02/07',
    'ingredient': 'EACH 1 ml SOLUTION CONTAINS :ADRENALINE 12,5 ug, LIDOCAINE HYDROCHLORIDE 20 mg',
    'therapeutic_area': null,
    'api': 'ADRENALINE, LIDOCAINE HYDROCHLORIDE',
  }

  const xylotox_parsed: ParsedMedication = {
    'form': 'SOLUTION',
    'routes': ['INJECTION', 'ORAL', 'INHALATION', 'TOPICAL'],
    'doses': [
      {
        'value': '1',
        'description': 'ML',
        'ingredients': [
          { 'name': 'ADRENALINE', 'equivalent_to': null, 'strength': { 'value': '12.5', 'units': 'UG' } },
          { 'name': 'LIDOCAINE HYDROCHLORIDE', 'equivalent_to': null, 'strength': { 'value': '20', 'units': 'MG' } },
        ],
      },
    ],
    'country': 'ZA',
    'trade_name': 'XYLOTOX E80-A',
    'registration_no': 'P/4/170',
    'applicant_name': 'Adcock Ingram Limited',
    'manufacturers': 'Adcock Ingram Limited',
  }

  it('parses multi-ingredient string with EQUIVALENT TO', () => {
    const parsed = parseSouthAfricaIngredient('AMLODIPINE BESILATE EQUIVALENT TO AMLODIPINE 10,0 MG VALSARTAN 320,0 MG HYDROCHLOROTHIAZIDE 25,0 MG')
    assertEquals(parsed, [
      { name: 'AMLODIPINE BESILATE', equivalent_to: 'AMLODIPINE', strength: { value: '10,0', units: 'MG' } },
      { name: 'VALSARTAN', equivalent_to: null, strength: { value: '320,0', units: 'MG' } },
      { name: 'HYDROCHLOROTHIAZIDE', equivalent_to: null, strength: { value: '25,0', units: 'MG' } },
    ])
  })

  it('ignores parentheticals', () => {
    const parsed = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1iLzzntxvJcZ4IXYKUVajx8gN_bLAQs8A404TGjnxKZJAOTer5k1h1SBgO3l0PZNF02V8fRf0IzII-ihawfCMoTbCRihVZfL_QEsHxVFfkBcw',
      'applicantName': 'THE DENTAL WAREHOUSE (PTY) LTD',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1jCa1J4gMt3ddBx__oQTkoY54xmmfG5K2B9D3R8WWJc-BzaRvYESpElF5hbheVdrBGTas8Mli3pue_KR6ru9SjLUARTFaL_jzl5F3lr2zfSCQ',
      'application_no': 'X0881',
      'licence_no': 'X0881',
      'productName': 'XYLONOR GEL',
      'status': 'Old Medicine',
      'expiryDate': '1998/10/14',
      'reg_date': '1993/10/14',
      'ingredient': 'Each 100 g  Gel contains: Lidocaine (lignocaine) 5g, Cetrimide 0,15 g',
      'therapeutic_area': null,
      'api': 'None',
    })
    assertEquals(parsed, {
      'form': 'GEL',
      'routes': ['TOPICAL'],
      'doses': [
        {
          'value': '100',
          'description': 'G',
          'ingredients': [
            { 'name': 'LIDOCAINE', 'equivalent_to': null, 'strength': { 'value': '5', 'units': 'G' } },
            { 'name': 'CETRIMIDE', 'equivalent_to': null, 'strength': { 'value': '0.15', 'units': 'G' } },
          ],
        },
      ],
      'country': 'ZA',
      'trade_name': 'XYLONOR GEL',
      'registration_no': 'X0881',
      'applicant_name': 'THE DENTAL WAREHOUSE (PTY) LTD',
      'manufacturers': 'THE DENTAL WAREHOUSE (PTY) LTD',
    })
  })

  it('parses xylotox', () => {
    assertEquals(parseMedicationSouthAfrica(xylotox_row), xylotox_parsed)
  })

  it.only('determines that xylotox is a |Product containing only epinephrine and lidocaine (medicinal product)|', async () => {
    const medication = await performLookups(db, [xylotox_parsed], { write_failure_files: false })
    const medicinal_product = await db.selectFrom('snomed_inferred_canonical_name_and_category').selectAll().where('id', '=', medication[0].snomed_concept_id)
      .executeTakeFirst()
    assertEquals(medication, [
      {
        'form': 'SOLUTION',
        'routes': ['INJECTION', 'ORAL', 'INHALATION', 'TOPICAL'],
        'doses': [
          {
            'value': '1',
            'description': 'ML',
            'ingredients': [
              {
                'name': 'ADRENALINE',
                'equivalent_to': null,
                'strength': { 'value': '12.5', 'units': 'UG' },
                'snomed_concept_id': '387362001',
              },
              {
                'name': 'LIDOCAINE HYDROCHLORIDE',
                'equivalent_to': null,
                'strength': { 'value': '20', 'units': 'MG' },
                'snomed_concept_id': '61773008',
              },
            ],
          },
        ],
        'country': 'ZA',
        'trade_name': 'XYLOTOX E80-A',
        'registration_no': 'P/4/170',
        'applicant_name': 'Adcock Ingram Limited',
        'manufacturers': 'Adcock Ingram Limited',
        'snomed_concept_id': '775788003',
      },
    ])
    assertEquals(medicinal_product, {
      'id': '775788003',
      'description_id': '3731735019',
      'language_code': 'en',
      'name': 'Product containing only epinephrine and lidocaine',
      'category': 'medicinal product',
    })
  })
})
