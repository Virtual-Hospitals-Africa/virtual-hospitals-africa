import { assert } from 'std/assert/assert.ts'
import { Profession } from '../db.d.ts'
import {
  AppUser,
  HealthWorkerDisplay,
  HealthWorkerOrganization,
  Maybe,
  RenderedPatientEncounterEmployee,
} from '../types.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'

/*
  TODO multiple specialties
  TODO in the data model have a concept of your employment at an organization
    Independent of your profession
*/
export function patientEncounterEmployeeDisplay(
  patient_encounter_employee: RenderedPatientEncounterEmployee,
): HealthWorkerDisplay {
  return healthWorkerDisplayInner({
    health_worker_name: patient_encounter_employee.name,
    is_doctor: patient_encounter_employee.profession === 'doctor',
    is_admin: patient_encounter_employee.profession === 'admin',
    provider_profession: patient_encounter_employee.profession !== 'admin'
      ? patient_encounter_employee.profession
      : undefined,
    specialty: patient_encounter_employee.specialty,
  })
}

export function healthWorkerDisplay(
  health_worker_name: string,
  organization_employment: HealthWorkerOrganization,
): HealthWorkerDisplay {
  let is_doctor = false
  let is_admin = false
  let provider_profession: Profession | undefined
  let specialty: Maybe<string>

  for (const role of organization_employment.roles) {
    if (!role) continue
    switch (role.profession) {
      case 'receptionist': {
        assert(!specialty)
        assert(!role.specialty)
        assert(!provider_profession)
        provider_profession = role.profession
        break
      }
      case 'doctor': {
        is_doctor = true
        assert(!specialty)
        assert(!provider_profession)
        provider_profession = role.profession
        specialty = role.specialty
        break
      }
      case 'nurse': {
        assert(!specialty)
        assert(!provider_profession)
        provider_profession = role.profession
        specialty = role.specialty
        break
      }
      case 'admin': {
        assert(!role.specialty)
        is_admin = true
        break
      }
      default: {
        throw new Error(`Unrecognized profession ${String(role.profession)}`)
      }
    }
  }

  return healthWorkerDisplayInner({
    health_worker_name,
    is_doctor,
    is_admin,
    provider_profession,
    specialty,
  })
}

export function healthWorkerDisplayInner({
  health_worker_name,
  is_doctor,
  is_admin,
  provider_profession,
  specialty,
}: {
  health_worker_name: string
  is_doctor: boolean
  is_admin: boolean
  provider_profession: Profession | undefined
  specialty: Maybe<string>
}) {
  // Doctors are special. They're named Dr. and the Administrator label goes after, not before
  if (is_doctor) {
    assert(specialty)
    assert(provider_profession === 'doctor')
    return {
      display_name: 'Dr. ' + health_worker_name,
      description: is_admin ? `${specialty}, Administrator` : specialty,
    }
  }

  if (is_admin) {
    if (!provider_profession) {
      return {
        display_name: health_worker_name,
        description: 'Administrator',
      }
    }

    // Another special case. They probably just made themselves a receptionist to enable intaking patients
    if (provider_profession === 'receptionist') {
      return {
        display_name: health_worker_name,
        description: 'Administrator',
      }
    }
    assertEquals(provider_profession, 'nurse')
    assert(specialty)

    // For nurses, administrator goes in front
    return {
      display_name: health_worker_name,
      description: `Administrator, ${specialty} nurse`,
    }
  }

  assert(provider_profession)
  assertNotEquals(provider_profession, 'doctor')

  if (provider_profession === 'receptionist') {
    assert(!specialty)
    return {
      display_name: health_worker_name,
      description: 'Receptionist',
    }
  }

  assertEquals(provider_profession, 'nurse')
  assert(specialty)

  return {
    display_name: health_worker_name,
    description: `${specialty} nurse`,
  }
}

export function appUserDisplay(
  { health_worker_name, app_user, specialty }: {
    health_worker_name: string
    app_user: AppUser
    specialty: Maybe<string>
  },
) {
  switch (app_user) {
    case 'regulator': {
      return {
        display_name: health_worker_name,
        description: 'Regulator',
      }
    }
    case 'admin':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: false,
        is_admin: true,
        provider_profession: undefined,
        specialty,
      })
    case 'doctor':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: true,
        is_admin: false,
        provider_profession: 'doctor',
        specialty,
      })
    case 'nurse':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: false,
        is_admin: false,
        provider_profession: 'nurse',
        specialty,
      })
    case 'receptionist':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: false,
        is_admin: false,
        provider_profession: 'receptionist',
        specialty,
      })
  }
}
