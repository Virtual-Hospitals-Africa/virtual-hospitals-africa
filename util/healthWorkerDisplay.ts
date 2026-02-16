import { assert } from 'std/assert/assert.ts'
import { AppUser, HealthWorkerDisplay, HealthWorkerOrganization, Maybe, RenderedEmployee, RenderedHealthWorker } from '../types.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { organizationOf } from '../shared/employees.ts'

export function employeeDisplay(
  employee: RenderedEmployee,
): HealthWorkerDisplay {
  const organization_employment = organizationOf(employee)
  return healthWorkerDisplay(employee, organization_employment)
}

export function healthWorkerDisplay(
  health_worker: RenderedHealthWorker,
  organization_employment: HealthWorkerOrganization,
): HealthWorkerDisplay {
  const is_doctor = !!health_worker.ever_licensed_as_doctor
  const { role, is_admin } = organization_employment
  const { specialty, subspecialty } = organization_employment.active_licences[0] || { specialty: null, subspecialty: null }

  console.log('mmw', organization_employment.active_licences)
  if (role === 'nurse') {
    assert(specialty, 'nurse has specialty')
  }
  if (role === 'doctor') {
    assert(specialty, 'doctor has specialty')
  }

  return healthWorkerDisplayInner({
    is_doctor,
    is_admin,
    role,
    specialty,
    subspecialty,
    health_worker_name: health_worker.name,
    avatar_url: health_worker.avatar_url,
  })
}

export function healthWorkerDisplayInner({
  health_worker_name,
  is_doctor,
  is_admin,
  role,
  specialty,
  // subspecialty,
  avatar_url = null,
}: {
  health_worker_name: string
  is_doctor: boolean
  is_admin: boolean
  role: string | null
  specialty: Maybe<string>
  subspecialty: Maybe<string>
  avatar_url: Maybe<string>
}): HealthWorkerDisplay {
  // Doctors are special. They're named Dr. and the Administrator label goes after, not before
  if (is_doctor) {
    assert(specialty, 'is_doctor has specialty')
    assert(role === 'doctor')
    return {
      avatar_url,
      display_name: 'Dr. ' + health_worker_name,
      description: is_admin ? `${specialty}, Administrator` : specialty,
    }
  }

  if (is_admin) {
    if (!role) {
      return {
        avatar_url,
        display_name: health_worker_name,
        description: 'Administrator',
      }
    }

    // Another special case. They probably just made themselves a receptionist to enable intaking patients
    if (role === 'receptionist') {
      return {
        avatar_url,
        display_name: health_worker_name,
        description: 'Administrator',
      }
    }
    assertEquals(role, 'nurse')
    assert(specialty)

    // For nurses, administrator goes in front
    return {
      avatar_url,
      display_name: health_worker_name,
      description: `Administrator, ${specialty} nurse`,
    }
  }

  assert(role)
  assertNotEquals(role, 'doctor')

  if (role === 'receptionist') {
    assert(!specialty)
    return {
      avatar_url,
      display_name: health_worker_name,
      description: 'Receptionist',
    }
  }

  assertEquals(role, 'nurse')
  assert(specialty)

  return {
    avatar_url,
    display_name: health_worker_name,
    description: `${specialty} nurse`,
  }
}

export function appUserDisplay(
  { health_worker_name, app_user, specialty, subspecialty, avatar_url }: {
    health_worker_name: string
    app_user: AppUser
    specialty: Maybe<string>
    subspecialty: Maybe<string>
    avatar_url: Maybe<string>
  },
) {
  switch (app_user) {
    case 'admin':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: false,
        is_admin: true,
        role: null,
        specialty,
        subspecialty,
        avatar_url,
      })
    case 'doctor':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: true,
        is_admin: false,
        role: 'doctor',
        specialty,
        subspecialty,
        avatar_url,
      })
    case 'nurse':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: false,
        is_admin: false,
        role: 'nurse',
        specialty,
        subspecialty,
        avatar_url,
      })
    case 'receptionist':
      return healthWorkerDisplayInner({
        health_worker_name,
        is_doctor: false,
        is_admin: false,
        role: 'receptionist',
        specialty,
        subspecialty,
        avatar_url,
      })
    default: {
      throw new Error(`Unknown app user ${app_user}`)
    }
  }
}
