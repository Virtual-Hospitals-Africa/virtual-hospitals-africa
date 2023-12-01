import { Maybe, Medication, TrxOrDb } from '../../types.ts'

export async function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
  }
): Promise<Medication[]> {
  const query = trx
    .selectFrom('medications')
    .select([
      'medications.key_id',
      'medications.trade_name',
      'medications.generic_name',
      'medications.forms',
      'medications.strength',
      'medications.category',
      'medications.registration_no',
      'medications.applicant_name',
      'medications.manufacturers',
    ])
    .where('generic_name', 'ilike', `%${opts.search}%`)
  const medications = await query.execute()
  return medications
}

export const MedicinesFrequencyList = [
  'ac/ before meals',
  'am / morning',
  'bd / 2 times daily',
  'nocte / every night',
  'od / once a day',
  'pm / afternoon or evening',
  'q15 / every 15 minutes',
  'q30/ every 30 minutes',
  'q1h / every hour',
  'q2h / every 2 hours',
  'q4h / every 4 hours',
  'q6h / every 6 hours',
  'q8h / every 8 hours',
  'qd / every day',
  'qid / 4 times a day',
  'qod / alternate days',
  'qs / sufficient enough quantity',
  'mane / morning',
  'qmane/ every morning',
  'qn/ every night',
  'stat / immediately, now',
  'tds/ 3 times a day',
  'q24h/ every 24 hours',
  'q30h / every 30 hours',
  'q48h / every 48 hours',
  'q72h / every 72 hours',
  'hs / at bedtime  ',
  'qhs / daily at bedtime',
  'qw / once a week',
  'bw / twice a week',
  'tw / three times a week',
  'qm / once a month',
  'bm / twice a month',
  'tm / three times a month',
  'prn / when necessary',
]
