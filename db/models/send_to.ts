import {
  HasStringId,
  Location,
  Organization,
  Sendable,
  TrxOrDb,
} from '../../types.ts'
import { sql } from 'kysely'

export async function nearest(
  trx: TrxOrDb,
  location: Location,
): Promise<HasStringId<Organization>[]> {
  const result = await sql<HasStringId<Organization>>`
      SELECT *,
             ST_Distance(
                  location,
                  ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
              ) AS distance,
              ST_X(location::geometry) as longitude,
              ST_Y(location::geometry) as latitude
        FROM "Location"
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
       LIMIT 3
  `.execute(trx)

  return result.rows
}


export async function forPatientIntake(
  trx: TrxOrDb,
  _patient_id: string,
  location: Location,
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
    }),
  )
  const otherSendables: Sendable[] = [
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
      key: 'health_worker/nurse_c',
      name: 'Nurse C',
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
        entity_id: 'nurse_c',
        online: false,
      },
    },
    {
      key: 'health_worker/nurse_d',
      name: 'Nurse D',
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
        entity_id: 'nurse_d',
        online: false,
      },
    },
    {
      key: 'health_worker/nurse_e',
      name: 'Nurse E',
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
        entity_id: 'nurse_e',
        online: false,
      },
    },
    {
      key: 'facility/another_facility_a',
      name: 'Another Facility A',
      description: {
        text: '5 More London Place, Tooley St, London SE1 2BY, United Kingdom',
        href: '5 More London Place, Tooley St, London SE1 2BY, United Kingdom',
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
  return [
    ...otherSendables,
    ...nearestFacilitySendables,
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
