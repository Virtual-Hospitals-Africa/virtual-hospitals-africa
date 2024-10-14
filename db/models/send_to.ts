import { z } from 'zod'
import { Location, Maybe, Sendable, TrxOrDb } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { getApprovedProviders, nearestHospitals } from './organizations.ts'
import { promiseProps } from '../../util/promiseProps.ts'

export async function forPatientIntake(
  trx: TrxOrDb,
  _patient_id: string,
  location: Location | null,
  organization_id: string,
  opts: { exclude_health_worker_id?: string } = {},
): Promise<Sendable[]> {
  const { nearestFacilities, employees } = await promiseProps({
    nearestFacilities: location
      ? nearestHospitals(trx, location)
      : Promise.resolve([]),
    employees: getApprovedProviders(
      trx,
      organization_id,
      {
        exclude_health_worker_id: opts.exclude_health_worker_id,
      },
    ),
  })
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

  // const provider_availability = await getAllProviderAvailability(trx, providers)

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
    {
      key: 'health_worker/' + 'tester',
      name: 'tester',
      description: {
        text: 'ABC',
      },
      image: {
        type: 'icon',
        icon: 'ClockIcon',
      },
      status: 'Unavailable until tomorrow at 9:00am',
      to: {
        type: 'entity',
        entity_type: 'health_worker',
        entity_id: '4890f04d-099d-4330-be5d-fc3265aaf2bd', // put employment.health_worker_id
        online: false,
      },
      request_type_options: [
        'request_review',
        'make_appointment',
        'declare_emergency',
      ],
      textarea: 'additional_details',
    },
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

export async function forPatientEncounter(
  trx: TrxOrDb,
  _patient_id: string,
  location: Maybe<Location>,
  organization_id: string,
  opts: { exclude_health_worker_id?: string } = {},
): Promise<Sendable[]> {
  const { nearestFacilities, employees } = await promiseProps({
    nearestFacilities: location
      ? nearestHospitals(trx, location)
      : Promise.resolve([]),
    employees: getApprovedProviders(
      trx,
      organization_id,
      {
        exclude_health_worker_id: opts.exclude_health_worker_id,
      },
    ),
  })

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
    {
      key: 'health_worker/' + 'tester',
      name: 'tester',
      description: {
        text: 'ABC',
      },
      image: {
        type: 'icon',
        icon: 'ClockIcon',
      },
      status: 'Unavailable until tomorrow at 9:00am',
      to: {
        type: 'entity',
        entity_type: 'health_worker',
        entity_id: '4890f04d-099d-4330-be5d-fc3265aaf2bd', // put employment.health_worker_id
        online: false,
      },
      request_type_options: [
        'request_review',
        'make_appointment',
        'declare_emergency',
      ],
      textarea: 'additional_details',
    },
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

export const SendToSchema = z.object({
  action: z.string().optional(),
  entity: z.object({
    id: z.string().uuid(),
    type: z.string(),
  }).optional(),
}).refine(
  (data) => !data.action && data.entity,
  {
    message: 'Cannot send to both an action and an entity',
    path: ['action'],
  },
)

/**
 * [
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
 */
