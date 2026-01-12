import { assert } from 'std/assert/assert.ts'
import { Profession } from '../db.d.ts'
import { AppUser, EmployedHealthWorker, HealthWorkerDisplay, HealthWorkerOrganization, Maybe, RenderedEmployee } from '../types.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { organizationOf } from '../shared/employees.ts'

/*
  TODO multiple specialties
  TODO in the data model have a concept of your employment at an organization
    Independent of your profession
*/
export function employeeDisplay(
  employee: RenderedEmployee,
): HealthWorkerDisplay {
  const organization_employment = organizationOf(employee)
  return healthWorkerDisplay(employee, organization_employment)
}

export function healthWorkerDisplay(
  health_worker: EmployedHealthWorker,
  organization_employment: HealthWorkerOrganization,
): HealthWorkerDisplay {
  const is_doctor = organization_employment.profession === 'doctor'
  const is_admin = organization_employment.is_admin
  const provider_profession = organization_employment.profession
  const specialty = organization_employment.specialty

  if (provider_profession === 'nurse') {
    assert(specialty, 'nurse has specialty')
  }
  if (provider_profession === 'doctor') {
    assert(specialty, 'doctor has specialty')
  }

  return healthWorkerDisplayInner({
    is_doctor,
    is_admin,
    provider_profession,
    specialty,
    health_worker_name: health_worker.name,
    avatar_url: health_worker.avatar_url,
  })
}

export function healthWorkerDisplayInner({
  health_worker_name,
  is_doctor,
  is_admin,
  provider_profession,
  specialty,
  avatar_url = null,
}: {
  health_worker_name: string
  is_doctor: boolean
  is_admin: boolean
  provider_profession: Profession | null
  specialty: Maybe<string>
  avatar_url: Maybe<string>
}): HealthWorkerDisplay {
  // Doctors are special. They're named Dr. and the Administrator label goes after, not before
  if (is_doctor) {
    assert(specialty, 'is_doctor has specialty')
    assert(provider_profession === 'doctor')
    return {
      avatar_url,
      display_name: 'Dr. ' + health_worker_name,
      description: is_admin ? `${specialty}, Administrator` : specialty,
    }
  }

  if (is_admin) {
    if (!provider_profession) {
      return {
        avatar_url,
        display_name: health_worker_name,
        description: 'Administrator',
      }
    }

    // Another special case. They probably just made themselves a receptionist to enable intaking patients
    if (provider_profession === 'receptionist') {
      return {
        avatar_url,
        display_name: health_worker_name,
        description: 'Administrator',
      }
    }
    assertEquals(provider_profession, 'nurse')
    assert(specialty)

    // For nurses, administrator goes in front
    return {
      avatar_url,
      display_name: health_worker_name,
      description: `Administrator, ${specialty} nurse`,
    }
  }

  assert(provider_profession)
  assertNotEquals(provider_profession, 'doctor')

  if (provider_profession === 'receptionist') {
    assert(!specialty)
    return {
      avatar_url,
      display_name: health_worker_name,
      description: 'Receptionist',
    }
  }

  assertEquals(provider_profession, 'nurse')
  assert(specialty)

  return {
    avatar_url,
    display_name: health_worker_name,
    description: `${specialty} nurse`,
  }
}

export function appUserDisplay(
  { health_worker_name, app_user, specialty, avatar_url }: {
    health_worker_name: string
    app_user: AppUser
    specialty: Maybe<string>
    avatar_url: Maybe<string>
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
        provider_profession: null,
        specialty,
        avatar_url,
      })
    case 'doctor':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: true,
        is_admin: false,
        provider_profession: 'doctor',
        specialty,
        avatar_url,
      })
    case 'nurse':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: false,
        is_admin: false,
        provider_profession: 'nurse',
        specialty,
        avatar_url,
      })
    case 'receptionist':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: false,
        is_admin: false,
        provider_profession: 'receptionist',
        specialty,
        avatar_url,
      })
  }
}
