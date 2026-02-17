import { sql } from 'kysely'
import { HasStringId, PatientNearestOrganization, TrxOrDbOrQueryCreator } from '../../types.ts'
import { getWalkingDistance } from '../../external-clients/google-maps.ts'
import { nearest_organizations } from './nearest_organizations.ts'
import { jsonBuildObject } from '../helpers.ts'
import { pMap } from '../../util/inParallel.ts'

export const patient_nearest_facilities = {
  async nearestFacilities(
    trx: TrxOrDbOrQueryCreator,
    patient_id: string,
  ) {
    const { location } = await trx.selectFrom('patients')
      .where('id', '=', patient_id)
      .where('location', 'is not', null)
      .select([
        jsonBuildObject({
          longitude: sql<number>`ST_X(location::geometry)`,
          latitude: sql<number>`ST_Y(location::geometry)`,
        }).as('location'),
      ])
      .executeTakeFirstOrThrow()

    const { results: nearest_facilities } = await nearest_organizations.search(
      trx,
      {
        location,
      },
      {
        rows_per_page: 20,
      },
    )

    return pMap(
      nearest_facilities,
      async (
        organization,
      ): Promise<HasStringId<PatientNearestOrganization>> => {
        const walking_distance = await getWalkingDistance({
          origin: {
            longitude: location.longitude,
            latitude: location.latitude,
          },
          destination: {
            longitude: organization.location.longitude,
            latitude: organization.location.latitude,
          },
        })
        return { ...organization, walking_distance }
      },
    )
  },
}
