import { getAllProviderAvailability } from '../../shared/scheduling/getProviderAvailability.ts'
import {
  Location,
  Sendable,
  SendToFormSubmission,
  TrxOrDb,
} from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import capitalize from '../../util/capitalize.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { getApprovedProviders, nearest } from './organizations.ts'
import { sql } from 'kysely'
import { getMany } from './providers.ts'

export async function getLocationByOrganizationId(
  trx: TrxOrDb,
  organizationId: string,
) {
  const result = await trx
    .selectFrom('Location')
    .select([
      sql<number>`("near"::json->>'longitude')::float`.as('longitude'),
      sql<number>`("near"::json->>'latitude')::float`.as('latitude'),
    ])
    .where('organizationId', '=', organizationId)
    .executeTakeFirst()

  if (!result) {
    throw new Error(
      `No location data found for organizationId: ${organizationId}`,
    )
  }
  return result
}

export async function forPatientIntake(
  trx: TrxOrDb,
  _patient_id: string,
  location: Location,
  organization_id: string,
  opts: { exclude_health_worker_id?: string } = {},
): Promise<Sendable[]> {
  const nearestFacilities = await nearest(trx, location)
  const nearestFacilitySendables: Sendable[] = nearestFacilities.map(
    (facility) => ({
      key: `facility/${facility.id}`,
      name: facility.name,
      description: {
        text: facility.address || '',
      },
      image: {
        type: 'icon',
        icon: 'BuildingOffice2Icon',
      },
      status: 'Accepting patients',
      to: {
        type: 'entity',
        entity_type: 'facility',
        entity_id: facility.id,
        online: true,
      },
      textarea: 'reason_for_escalation',
    }),
  )

  const employees = await getApprovedProviders(
    trx,
    organization_id,
    {
      exclude_health_worker_id: opts.exclude_health_worker_id,
    },
  )

  console.log('employees', employees)

  const provider_ids = employees.map((employee) => employee.employee_id)

  console.log('provider_ids', provider_ids)

  const providers = await getMany(trx, { provider_ids })

  console.log('providers', providers)
  const provider_availability = await getAllProviderAvailability(providers)

  console.log('provider_availability', provider_availability)

  const nurse_information: Sendable[] = employees.map(
    (employee) => ({
      key: 'health_worker/' + employee.name,
      name: employee.name,
      description: {
        text: capitalize(
          employee.specialty
            ? `${employee.specialty} ${employee.profession}`
            : employee.profession,
        ),
      },
      image: {
        type: 'avatar',
        url: employee.avatar_url,
      },
      status: 'Unavailable until tomorrow at 9:00am',
      to: {
        type: 'entity',
        entity_type: 'health_worker',
        entity_id: employee.employee_id,
        online: !!employee.online,
      },
      request_type_options: [
        'request_review',
        'make_appointment',
        'declare_emergency',
      ],
      textarea: 'additional_details',
    }),
  )

  return [
    ...nurse_information,
    ...nearestFacilitySendables,
    {
      key: 'waiting_room',
      name: 'Waiting Room',
      image: {
        type: 'icon',
        icon: 'ClockIcon',
      },
      status: 'To be seen by the next available practitioner',
      to: {
        type: 'action',
        action: 'waiting_room',
      },
    },
    {
      key: 'device',
      name: 'Device via Bluetooth',
      image: {
        type: 'icon',
        icon: 'BluetoothIcon',
      },
      status: 'Connect with trusted devices of known colleagues',
      to: {
        type: 'action',
        action: 'device',
      },
    },
    {
      key: 'search',
      name: 'Search',
      image: {
        type: 'icon',
        icon: 'MagnifyingGlassIcon',
      },
      status:
        'Nurses, Doctors, Hospitals, Clinics, Virtual Organizations, Specialists, Laboratories, Pharmacies',
      to: {
        type: 'action',
        action: 'search',
      },
    },
  ]
}

// deno-lint-ignore require-await
export async function forPatientEncounter(
  _trx: TrxOrDb,
  _patient_id: string,
): Promise<Sendable[]> {
  return [
    {
      key: 'health_worker/nurse_a',
      name: 'Nurse A',
      description: {
        text: 'Primary Care Nurse',
      },
      image: {
        type: 'avatar',
        url:
          'https://images.unsplash.com/photo-1564564295391-7f24f26f568b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      status: 'Unavailable until tomorrow at 9:00am',
      to: {
        type: 'entity',
        entity_type: 'health_worker',
        entity_id: 'nurse_a',
        online: false,
      },
    },
    {
      key: 'health_worker/nurse_b',
      name: 'Nurse B',
      description: {
        text: 'Primary Care Nurse',
      },
      image: {
        type: 'avatar',
        url:
          'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      status: 'Seeing a patient until 3:30pm',
      to: {
        type: 'entity',
        entity_type: 'health_worker',
        entity_id: 'nurse_b',
        online: true,
      },
    },
    {
      key: 'facility/another_facility_a',
      name: 'Another Facility A',
      description: {
        text: '5 More London Place, Tooley St, London SE1 2BY, United Kingdom',
        parenthetical: 'address',
      },
      image: {
        type: 'icon',
        icon: 'BuildingOffice2Icon',
      },
      status: 'Accepting patients',
      to: {
        type: 'entity',
        entity_type: 'facility',
        entity_id: 'another_facility_a',
        online: true,
        reopens: 'Reopens 9:00am',
      },
    },
    {
      key: 'waiting_room',
      name: 'Waiting Room',
      image: {
        type: 'icon',
        icon: 'ClockIcon',
      },
      status: 'To be seen by the next available practitioner',
      to: {
        type: 'action',
        action: 'waiting_room',
      },
    },
    {
      key: 'device',
      name: 'Device via Bluetooth',
      image: {
        type: 'icon',
        icon: 'DevicePhoneMobileIcon',
      },
      status: 'Connect with trusted devices of known colleagues',
      to: {
        type: 'action',
        action: 'device',
      },
    },
    {
      key: 'search',
      name: 'Search',
      image: {
        type: 'icon',
        icon: 'MagnifyingGlassIcon',
      },
      status:
        'Nurses, Doctors, Hospitals, Clinics, Virtual Organizations, Specialists, Laboratories, Pharmacies',
      to: {
        type: 'action',
        action: 'search',
      },
    },
  ]
}

export function assertIs(
  send_to: unknown,
): asserts send_to is SendToFormSubmission {
  assertOr400(isObjectLike(send_to))
  if (send_to.action) {
    assertOr400(
      typeof send_to.action === 'string',
      'send_to.action must be a string',
    )
    assertOr400(
      !send_to.entity,
      'send_to.entity must not be present when send_to.action is present',
    )
  }
  if (send_to.entity) {
    assertOr400(isObjectLike(send_to.entity))
    assertOr400(
      typeof send_to.entity.id === 'string',
      'send_to.entity.id must be a string',
    )
    assertOr400(
      typeof send_to.entity.type === 'string',
      'send_to.entity.type must be a string',
    )
    assertOr400(
      !send_to.action,
      'send_to.action must not be present when send_to.entity is present',
    )
  }
}
