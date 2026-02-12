import type { RenderedOrganizationMedication, TrxOrDb } from '../../types.ts'
import { concat, jsonArrayFrom, jsonBuildObject, literalNumber, literalString } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { medication_availabilities, type MedicationAvailabilityOpts } from './medication_availabilities.ts'

export const medication_organizations = base({
  verbose: true,
  top_level_table: 'medications',
  baseQuery(
    trx: TrxOrDb,
    { organization_id, ...opts }: Omit<MedicationAvailabilityOpts, 'country'> & {
      organization_id: string
    },
  ) {
    return medication_availabilities.baseQuery(trx, opts)
      .select((eb) => [
        literalString(organization_id).as('organization_id'),
        jsonArrayFrom(
          eb.selectFrom('medication_doses')
            .leftJoin('organization_consumables', (join) =>
              join.onRef(
                'medication_doses.id',
                '=',
                'organization_consumables.consumable_id',
              )
                .on(
                  'organization_consumables.organization_id',
                  '=',
                  organization_id,
                ))
            .whereRef('medication_doses.medication_id', '=', 'medications.id')
            .select((eb_medication_doses) => [
              'medication_doses.id as medication_dose_id',
              eb_medication_doses.fn.coalesce('organization_consumables.quantity_on_hand', literalNumber(0)).as('quantity_on_hand'),
              jsonBuildObject({
                add: concat(
                  `/app/organizations/${organization_id}/inventory/add_medication_dose?medication_dose_id=`,
                  eb_medication_doses.ref('medication_doses.id'),
                ),
                history: concat(`/app/organizations/${organization_id}/inventory/history?consumable_id=`, eb_medication_doses.ref('medication_doses.id')),
              }).as('actions'),
            ]),
        ).as('organization_doses'),
      ])
      .where(
        'medication_availabilities.country',
        '=',
        trx.selectFrom('organizations')
          .where('organizations.id', '=', organization_id)
          .select('country'),
      )
  },
  formatResult: identity<RenderedOrganizationMedication>,
})
