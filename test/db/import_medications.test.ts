import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { parseMedicationSouthAfrica, parseSouthAfricaIngredient, SouthAfricaMedicationRow } from '../../db/seed/defs/inventory_medication/south_africa.ts'
import { ParsedMedication } from '../../db/seed/defs/inventory_medication/shared.ts'
import { performLookups } from '../../db/seed/defs/inventory_medication/lookup.ts'
import db from '../../db/db.ts'

import { PRODUCT_CONTAINING_PRECISELY_NALBUPHINE_HYDROCHLORIDE_10_MILLIGRAM_1_MILLILITER_CONVENTIONAL_RELEASE_SOLUTION_FOR_INJECTION } from '../../shared/snomed_concepts.ts'
import pick from '../../util/pick.ts'
import { assertMatches } from '../../util/assertMatches.ts'

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
          { 'name': 'ADRENALINE', 'strength': { 'value': '12.5', 'units': 'UG' } },
          { 'name': 'LIDOCAINE HYDROCHLORIDE', 'strength': { 'value': '20', 'units': 'MG' } },
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
      { name: 'VALSARTAN', strength: { value: '320,0', units: 'MG' } },
      { name: 'HYDROCHLOROTHIAZIDE', strength: { value: '25,0', units: 'MG' } },
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
            { 'name': 'LIDOCAINE', 'strength': { 'value': '5', 'units': 'G' } },
            { 'name': 'CETRIMIDE', 'strength': { 'value': '0.15', 'units': 'G' } },
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

  it('determines that xylotox is a |Product containing only epinephrine and lidocaine (medicinal product)|', async () => {
    const [medication] = await performLookups(db, [xylotox_parsed], { write_failure_files: false })
    const medicinal_product = await db.selectFrom('snomed_inferred_canonical_name_and_category').selectAll().where('id', '=', medication.snomed_concept_id)
      .executeTakeFirst()
    assertEquals(medication, {
      'form': 'SOLUTION',
      'routes': ['INJECTION', 'ORAL', 'INHALATION', 'TOPICAL'],
      'doses': [
        {
          'value': '1',
          'description': 'ML',
          'ingredients': [
            {
              'name': 'ADRENALINE',
              'strength': { 'value': '12.5', 'units': 'UG' },
              'snomed_concept_id': '387362001',
            },
            {
              'name': 'LIDOCAINE HYDROCHLORIDE',
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
    })
    assertEquals(medicinal_product, {
      'id': '775788003',
      'description_id': '3731735019',
      'language_code': 'en',
      'name': 'Product containing only epinephrine and lidocaine',
      'category': 'medicinal product',
    })
  })

  it('can find medicinal products with exact dosages', async () => {
    const parsed = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1hS-uDRI2akXX3Cr19cgn5lhvqAaut7G6NjuxEHSbe9k4LGO3nTxq41iCZvSF1WFaar_7iBIS7kQkmV4zRxTzpSCJzrPZsChTsWOPFq3rNcvg',
      'applicantName': 'Ascendis Pharma (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1ji-IRjSHqcWN4wVgDCqLG3haydM-7NkRQc1s4_BJqomVqU6IaR1bn2NHwTBRkK-SnuwNMFRk7RK7pZtnFw_GOdOmELPmdqdT734foim0YGwQ',
      'application_no': '510361.36',
      'licence_no': '51/2.9/0361.360',
      'productName': 'NALBUPHINE HYDROCHLORIDE DIHYDRATE EQUIVALENT TO NALBUPHINE HYDROCHLORIDE ANHYDROUS 10,0 mg',
      'status': 'Registered',
      'expiryDate': '1900/01/01',
      'reg_date': '2022/09/20',
      'ingredient': 'Each 1,0 ml contains NALBUPHINE HYDROCHLORIDE DIHYDRATE EQUIVALENT TO NALBUPHINE HYDROCHLORIDE ANHYDROUS 10.0 mg',
      'therapeutic_area': null,
      'api': 'None',
    })

    const [medication] = await performLookups(db, [parsed], { write_failure_files: false })

    assertEquals(medication.routes, ['INJECTION'], 'Routes is inferred to be INJECTION based on the precise medciation we found')

    const medicinal_product = await db.selectFrom('snomed_inferred_canonical_name_and_category')
      .where('id', '=', medication.snomed_concept_id)
      .selectAll()
      .executeTakeFirst()

    assertEquals(medicinal_product, {
      ...pick(['id', 'name', 'category'])(
        PRODUCT_CONTAINING_PRECISELY_NALBUPHINE_HYDROCHLORIDE_10_MILLIGRAM_1_MILLILITER_CONVENTIONAL_RELEASE_SOLUTION_FOR_INJECTION,
      ),
      language_code: 'en',
      description_id: '3752306018',
    })
  })

  it('can find medicinal products with exact dosages', async () => {
    const parsed = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1gu9yg3CcnADvzOvfD0-cV47sVPHnSfj4iXAjcV8HyhBljC6h0-lj-3cf3uHxqmMFvXJiZvv9mW8vb_yJXn68wAlfMdP6kV51YKoqVPz7OTlg',
      'applicantName': 'Viatris Healthcare (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1gfQxIekkmmVlFTqLVKQD1MVjZiZaE9dDm0gVlfl5OKJtY3_-r169Tc7N2HqvpVYbks8RGe-rUJsDmhmYc1KGmMZxj-Mm4b4WIhXM9vcOGV6Q',
      'application_no': '380278',
      'licence_no': '38/5.1/0278',
      'productName': 'EPIPEN JUNIOR AUTO-INJECTOR',
      'status': 'Registered',
      'expiryDate': '1900/01/01',
      'reg_date': '2006/07/07',
      'ingredient': 'EACH 0,3 ml SOLUTION CONTAINS \nADRENALINE 0,15 mg',
      'therapeutic_area': null,
      'api': 'None',
    })

    console.log(parsed.doses[0])

    const [medication] = await performLookups(db, [parsed], { write_failure_files: false })

    console.log(medication)

    const medicinal_product = await db.selectFrom('snomed_inferred_canonical_name_and_category')
      .where('id', '=', medication.snomed_concept_id)
      .selectAll()
      .executeTakeFirst()

    assertEquals(medicinal_product?.name, 'Product containing only epinephrine')
  })

  it('can find albumin human', async () => {
    const parsed = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1jm3KWKo6meVLZSOJjPPPUWh1rOOVH27l5pIPI7-vedQ8nDpsfYfAqerkkjyBxU9EHkT17mgMJESm4DrbUXjuHyKq2JgqpcA1Wk_klOJ9yKvw',
      'applicantName': 'Octapharma South Africa (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1ivaAn--n-IEAOhO33r72SnTIxssKMeyp43jRgguEj_sOxY1AMXu9gUpiywtDVnvkdFZSoANuwk4c9ewWafPOdt_N4YZIZlqro2DKiKNsNXTw',
      'application_no': '360057',
      'licence_no': '36/30.3/0057',
      'productName': 'ALBUMIN HUMAN 20 % OCTAPHARMA',
      'status': 'Registered',
      'expiryDate': '1900/01/01',
      'reg_date': '2007/04/13',
      'ingredient': 'EACH 1000,0 ml SOLUTION CONTAINS \nALBUMIN 200,0 g',
      'therapeutic_area': null,
      'api': 'None',
    })

    const [medication] = await performLookups(db, [parsed], { write_failure_files: false })

    const medicinal_product = await db.selectFrom('snomed_inferred_canonical_name_and_category')
      .where('id', '=', medication.snomed_concept_id)
      .selectAll()
      .executeTakeFirst()

    assertEquals(medicinal_product?.name, 'Product containing only albumin human')
  })

  it('can parse an ingredient field with odd comma placement', () => {
    const parsed = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1hBYLhRL_D0XBZ4vL8VFCEVMVr8fnBmoLF414vRPTs4r9EjzKi6zOrDYM-NUxO9J3ctu35uOb6J9LCMvGP_pZdsHXkD7o8jY2hbb1Mn1WPq0g',
      'applicantName': 'Pharma Dynamics (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1jEpRubI2Q2ta-4iLzmXIMosLyMzNcKQW0t9yvWjxDQCGRo4LSXApw-rXz_T7jdEJql8yiWKjGQn67ft6Y6l9kv6hCohl_BjCOzSmLAoz_8-Q',
      'application_no': '580140',
      'licence_no': '58/18.8/0140',
      'productName': 'RUBY PLUS',
      'status': 'Registered',
      'expiryDate': '2030/10/21',
      'reg_date': '2025/10/21',
      'ingredient': 'EACH TABLET CONTAINS: DROSPIRENONE 3,0 mg ,ETHINYLESTRADIOL 0,03 mg, LEVOMEFOLATE CALCIUM 0,451 mg',
      'therapeutic_area': null,
      'api': 'DROSPIRENONE , ETHINYLESTRADIOL , LEVOMEFOLATE CALCIUM',
    })

    assertEquals(parsed.doses, [
      {
        'value': '1',
        'description': 'TABLET',
        'ingredients': [
          {
            'name': 'DROSPIRENONE',
            'strength': { 'value': '3.0', 'units': 'MG' },
          },
          {
            'name': 'ETHINYLESTRADIOL',
            'strength': { 'value': '0.03', 'units': 'MG' },
          },
          { 'name': 'LEVOMEFOLATE CALCIUM', 'strength': { 'value': '0.451', 'units': 'MG' } },
        ],
      },
    ])
  })

  it('can parse a partially incomplete equivalent to specification', () => {
    const { doses } = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1hTYPglcnwYTcgnvH4og0ySi5iR37LCuJQARazsMxUbTG3p6-9V9WdtRfIaE5DeH5ANMtQXdFql4wQdOHupx2WXHB6ZbO_ZgXW2U62KmLHfaQ',
      'applicantName': 'MC Pharma (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1h-WdHmw2OUKEWi1IIZpQ0gvkBncuDjF_2N3OJgolt1Zpv2CYrQ261UDAA7_MlhNcfH8B32Sjjojs5XYWoMzlDVPq8_6KZDKQc7pBmnDTmr6g',
      'application_no': '510188',
      'licence_no': '51/32.10/0188',
      'productName': 'DURAPHAT VARNISH 50mg/ml DENTAL SUSPENSION',
      'status': 'Registered',
      'expiryDate': '1900/01/01',
      'reg_date': '2022/09/20',
      'ingredient': 'Each 1 ml of suspension contains 50,0 MG SODIUM FLUORIDE EQUIVALENT TO FLUORIDE 22,6 m',
      'therapeutic_area': null,
      'api': 'None',
    })
    assertEquals(doses, [{
      'value': '1',
      'description': 'ML',
      'ingredients': [
        { 'name': 'SODIUM FLUORIDE', 'equivalent_to': 'FLUORIDE', 'strength': { 'value': '50.0', 'units': 'MG' } },
      ],
    }])
  })

  it('can parse a blister pack ingredient field which contains tablets of different dosages', () => {
    const { doses } = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1i8J53oIHc-vB5E-mgoQsQYmBX5mzUWRLUXFJ3w_dkwxkFKMGazdMibsM85_GPRgr3Sug1VjqXrCbd1dE5gGA8Tc3gfVSPp_bkPiDaF2Zy04A',
      'applicantName': 'Eurolab (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1hP-1Go7lD8OzXed3Wcaiwu8hl2Q2o__UXnOr5hUR86ORX75Ir-5Xrq3SEpQSg01oL1gUJ-3f3b_eUuHrVXmBKoVQRrT39s40fuiZTgPC8YJA',
      'application_no': '560064',
      'licence_no': '56/5.7.2/0064',
      'productName': 'APEMEZE COMBI PACK',
      'status': 'Registered',
      'expiryDate': '2028/11/14',
      'reg_date': '2023/11/14',
      'ingredient': 'EACH BLISTER PACK CONTAINS TWO CAPSULES, EACH CONTAINING APREPITANT 80,0 mg and ONE CAPSULE CONTAINING APREPITANT  125,0 mg',
      'therapeutic_area': null,
      'api': 'Aprepitant',
    })
    assertEquals(doses, [{
      'value': '1',
      'description': 'CAPSULE',
      'ingredients': [
        { 'name': 'APREPITANT', 'strength': { 'value': '80.0', 'units': 'MG' } },
      ],
    }, {
      'value': '1',
      'description': 'CAPSULE',
      'ingredients': [
        { 'name': 'APREPITANT', 'strength': { 'value': '125.0', 'units': 'MG' } },
      ],
    }])
  })

  it('can parse an ingredient field that does not start with the word "each"', () => {
    const parsed = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1hcfEuMkDMez2UcZjkYvSdvZxsGbSrm38Aox0e9X7FZ9HBp4ji01XXRvLKE2UHL6K-KIp5GsAiSLg2qQl5tC-l15BJt_KkPm6v9vA5MyKZpQg',
      'applicantName': 'Adcock Ingram Limited',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1gtH5avFLzJPDRbLZdW3ot5oqGcRFUujEFxIWJEExag5SzwKJujWRfz682ZhlHaOy1mowFZPo-5Kd2uUXdaeUgKMX2vFIFpq_cB_4PRFxgc1w',
      'application_no': 'F0008',
      'licence_no': 'F/2.8/8',
      'productName': 'PROPAIN',
      'status': 'Registered',
      'expiryDate': '1900-01-01',
      'reg_date': '1974-06-05',
      'ingredient': 'TABLET\nCAFFEINE 50 MG\nCODEINE PHOSPHATE 10 MG\nDIPHENHYDRAMINE HYDROCHLORIDE 5 MG\nPARACETAMOL 400 MG',
      'therapeutic_area': null,
      'api': 'None',
    })

    assertMatches(parsed.doses, [
      {
        'value': '1',
        'description': 'TABLET',
        'ingredients': [
          {
            'name': 'CAFFEINE',
            'strength': { 'value': '50', 'units': 'MG' },
          },
          {
            'name': 'CODEINE PHOSPHATE',
            'strength': { 'value': '10', 'units': 'MG' },
          },
          {
            'name': 'DIPHENHYDRAMINE HYDROCHLORIDE',
            'strength': { 'value': '5', 'units': 'MG' },
          },
          {
            'name': 'PARACETAMOL',
            'strength': { 'value': '400', 'units': 'MG' },
          },
        ],
      },
    ])
  })

  it('parses an ingredient field with a greater than character, interpreting this as just an exact strength', () => {
    const { doses } = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1jxvyUOyxIqVtPnl2oIhZsp_LfksKyyAHFNYDrOLms0k5vhfBelVBuw_fcaZy4BOvl32zAgfWI7cDpAF3mzCzlQZOciZDKE1d2zjo78N3440g',
      'applicantName': 'Aspen SA Operations (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1hhtElnsbvCO4OEvDznOtx3oerFQFh4kG_oZV3isecARJloF_r7HZ1PiYtZheM2zPAu-4IDWkkLPddp_R5ad9QOuhpf48nSonjINHSewyzkqg',
      'application_no': '59/30.2/0066',
      'licence_no': '59/30.2/0066',
      'productName': 'ROTAVIRUS VACCINE ASPEN',
      'status': 'Registered',
      'expiryDate': '2030/12/02',
      'reg_date': '2025/12/02',
      'ingredient':
        'EACH 2,0 ml DOSE CONTAINS: LIVE ATTENUATED BOVINE - HUMAN ROTAVIRUS REASSORTANT G1 ≥ 105.6 FFU REASSORTANT G2 ≥ 105.6 FFU REASSORTANT G3 ≥ 105.6 FFU REASSORTANT G4 ≥ 105.6 FFU REASSORTANT G9 ≥ 105.6 FFU',
      'therapeutic_area': null,
      'api': 'LIVE ATTENUATED BOVINE - HUMAN ROTAVIRUS REASSORTANT G1 , FFU REASSORTANT G2 , FFU REASSORTANT G3 , FFU REASSORTANT G4 , FFU REASSORTANT G9',
    })

    assertMatches(doses, [
      {
        'value': '2.0',
        'description': 'ML',
        'ingredients': [
          {
            'name': 'LIVE ATTENUATED BOVINE - HUMAN ROTAVIRUS REASSORTANT G1',
            'strength': { 'value': '105.6', 'units': 'FFU' },
          },
          {
            'name': 'REASSORTANT G2',
            'strength': { 'value': '105.6', 'units': 'FFU' },
          },
          {
            'name': 'REASSORTANT G3',
            'strength': { 'value': '105.6', 'units': 'FFU' },
          },
          {
            'name': 'REASSORTANT G4',
            'strength': { 'value': '105.6', 'units': 'FFU' },
          },
          {
            'name': 'REASSORTANT G9',
            'strength': { 'value': '105.6', 'units': 'FFU' },
          },
        ],
      },
    ])
  })

  it('can parse an ingredient field with an equivalent to with a different strength value', () => {
    const { doses } = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1go7Y68fvXddzOvxSlKPV-YHZI_gPVnvPRAU8ime5HeQ-7a-V1EqFoRSC4xkzdlu_LQKzQ5ToRCuW0ZPnu75NJAwjOF42KAsDepSG2MzHtI8A',
      'applicantName': 'Hetero Drugs South Africa (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1jdEruIL9Yf2nhTDC1F8HNfpYszoGSRxQPt5fzQqA3c6yRseu6UuTvjehitwHqFa4DdP6w1wXgRXr7wIcgwxh8v865JYFeHD6MmPewHn6vK0g',
      'application_no': '510202',
      'licence_no': '51/34/0202',
      'productName': 'ZOLTERO',
      'status': 'Registered',
      'expiryDate': '1900/01/01',
      'reg_date': '2022/08/30',
      'ingredient': 'Each vial with 5 ml concentrate contains 4 mg ZOLEDRONIC ACID (ANHYDROUS) EQUIVALENT TO ZOLEDRONIC ACID MONOHYDRATE 4,264 mg',
      'therapeutic_area': null,
      'api': 'None',
    })

    assertEquals(doses, [
      {
        'value': '5',
        'description': 'ML',
        'ingredients': [
          {
            'name': 'ZOLEDRONIC ACID (ANHYDROUS)',
            'strength': { 'value': '4', 'units': 'MG' },
            'equivalent_to': { 'name': 'ZOLEDRONIC ACID MONOHYDRATE', 'strength': { 'value': '4.264', 'units': 'MG' } },
          },
        ],
      },
    ])
  })

  it('handles OF in the ingredient field', () => {
    const { doses } = parseMedicationSouthAfrica({
      'secureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1hjGuHz1LN2OpwAF5tQmzbOvA9ZKisd0e1vrIM44cO8zJZWMMXyt8tIwFhWp7wf2YGXKnE7qxfMiJGJWjhV_mNM_c7izKufQi-2MPNoUTyv2Q',
      'applicantName': 'Ranbaxy Pharmaceuticals (Pty) Ltd',
      'appSecureId': 'CfDJ8JZt5E2q6SJAoUYxRcwyi1jf1D-4IUBMBLKoiZnQctYIoFEg13RY3hzu6zwHWP5psvIX5UN4yM0i-Be_CA5MHElI2xVnQRBmgOd1OAN-uJ8sZBmQa0Rv4Bc88-ManFLunA',
      'application_no': '560531',
      'licence_no': '56/20.1.1/0531',
      'productName': 'TIZEG',
      'status': 'Registered',
      'expiryDate': '2028/11/14',
      'reg_date': '2023/11/14',
      'ingredient': 'EACH 10 ml CONTAINS 50,0 mg OF TIGECYCLINE',
      'therapeutic_area': null,
      'api': 'None',
    })
    console.log({ doses })
    assertEquals(doses, [
      {
        'value': '10',
        'description': 'ML',
        'ingredients': [
          { 'name': 'TIGECYCLINE', 'strength': { 'value': '50.0', 'units': 'MG' } },
        ],
      },
    ])
  })
})
