import { it } from 'std/testing/bdd.ts'
import { MedicineParser } from '../../backend/recommended_doses/MedicineParser.ts'

it('works', () => {
  const parsed = MedicineParser.parse({
    'PUBLICATION': 'Primary Healthcare',
    'LEVEL OF CARE': 'PHC',
    'CHAPTER NUMBER': '6',
    'CHAPTER NAME': 'Obstetrics and gynaecology',
    'SECTION NUMBER': '6.4.2',
    'STG/DISORDER GROUP': 'Hypertensive disorders in pregnancy',
    'DISORDER NUMBER': '6.4.2.1',
    'DISORDER': 'Chronic hypertension',
    'ICD10 CODE': 'O10.0',
    'MEDICINE NAME (International Nonproprietary Name)': 'Methyldopa',
    'DOSAGE FORM': 'Tablet/Capsule',
    'DOSE': '250 mg',
    'DOSING INTERVAL': '250 mg 8 hourly, max dose 750mg 8  hourly',
    'DURATION OF TREATMENT': null,
    'ROUTE OF ADMINISTRATION': 'Oral',
    'DDD': '1g',
    'ATC': 'C02AB01',
    'AWaRe categorisation of antibiotics': 'n/a',
    'VEN': null,
    'ACUTE/CHRONIC': 'Chronic',
    'ADULT/ CHILDREN': 'Adult',
    'PRESCRIBER': 'Doctor',
  })
  console.log({ parsed })
})
