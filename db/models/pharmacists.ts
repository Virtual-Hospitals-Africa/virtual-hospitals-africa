import { assert } from 'std/assert/assert.ts'
import { REGULATORY_AGENCIES } from '../../shared/regulatory_agencies.ts'
import { TrxOrDb } from '../../types.ts'
import isKeyOf from '../../util/isKeyOf.ts'
import { employees } from './employees.ts'
import { health_worker_licences } from './health_worker_licences.ts'
import findMatching from '../../util/findMatching.ts'
import { SERVER_COUNTRY } from './countries.ts'

const country = SERVER_COUNTRY
assert(isKeyOf(country, REGULATORY_AGENCIES))
const agency = findMatching(REGULATORY_AGENCIES[country], { concerning_role: 'pharmacist' })

export const pharmacists = {
  agency,
  getByLicence(trx: TrxOrDb, licence_number: string) {
    return employees.getById(
      trx,
      health_worker_licences.healthWorkerIdByLicenceNumber(
        trx,
        {
          country,
          licence_number,
          regulatory_agency_acronym: agency.acronym,
          status: 'all',
        },
      ),
    )
  },
}
