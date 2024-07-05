import { Sendable, TrxOrDb } from '../../types.ts'

// deno-lint-ignore require-await
export async function forPatient(
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
        href: '/another-device',
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
        href: '/search',
      },
    },
  ]
}
