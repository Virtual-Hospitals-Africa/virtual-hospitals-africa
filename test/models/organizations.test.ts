import { describe } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as employment from '../../db/models/employment.ts'
import * as organizations from '../../db/models/organizations.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import { insertTestAddress, randomNationalId } from '../mocks.ts'
import omit from '../../util/omit.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { StatusError } from '../../util/assertOr.ts'
import { itUsesTrxAnd, withTestOrganizations } from '../web/utilities.ts'
import generateUUID from '../../util/uuid.ts'

describe('db/models/organizations.ts', { sanitizeResources: false }, () => {
  describe('getEmployees', () => {
    itUsesTrxAnd(
      'gets the employees of a organization, with or without invitees',
      (trx) =>
        withTestOrganizations(trx, { count: 2 }, async (organization_ids) => {
          const hw_at_organization1 = await health_workers.upsert(trx, {
            name: 'At Organization 1',
            email: `${generateUUID()}@worker.com`,
            avatar_url: 'avatar_url',
          })
          assert(hw_at_organization1)

          const hw_at_organization2 = await health_workers.upsert(trx, {
            name: 'At Organization 2',
            email: `${generateUUID()}@worker.com`,
            avatar_url: 'avatar_url',
          })
          assert(hw_at_organization2)

          const hw_other_organization = await health_workers.upsert(trx, {
            name: 'At Organization 3',
            email: `${generateUUID()}@worker.com`,
            avatar_url: 'avatar_url',
          })
          assert(hw_other_organization)

          await employment.add(trx, [
            {
              health_worker_id: hw_at_organization1.id,
              organization_id: organization_ids[0],
              profession: 'nurse',
            },
            {
              health_worker_id: hw_at_organization1.id,
              organization_id: organization_ids[0],
              profession: 'admin',
            },
            {
              health_worker_id: hw_at_organization2.id,
              organization_id: organization_ids[0],
              profession: 'doctor',
            },
            {
              health_worker_id: hw_at_organization2.id,
              organization_id: organization_ids[0],
              profession: 'admin',
            },
            {
              health_worker_id: hw_other_organization.id,
              organization_id: organization_ids[1],
              profession: 'doctor',
            },
          ])

          const [invited] = await employment.addInvitees(
            trx,
            organization_ids[0],
            [
              {
                email: `${generateUUID()}@test.com`,
                profession: 'doctor',
              },
            ],
          )

          const withInvitees = await organizations.getEmployeesAndInvitees(
            trx,
            organization_ids[0],
            {},
          )

          const hw_1 = withInvitees.find((hw) =>
            hw.health_worker_id === hw_at_organization1.id
          )
          assert(hw_1)
          assertEquals(omit(hw_1, ['professions']), {
            avatar_url: 'avatar_url',
            email: hw_at_organization1.email,
            display_name: 'At Organization 1',
            health_worker_id: hw_at_organization1.id,
            is_invitee: false,
            name: 'At Organization 1',
            registration_status: 'incomplete',
            actions: {
              view: `/app/organizations/${
                organization_ids[0]
              }/employees/${hw_at_organization1.id}`,
            },
            online: null,
          })
          assertEquals(hw_1.professions.length, 2)
          assertEquals(hw_1.professions[0].profession, 'admin')
          assertEquals(hw_1.professions[1].profession, 'nurse')

          const hw_2 = withInvitees.find((hw) =>
            hw.health_worker_id === hw_at_organization2.id
          )
          assert(hw_2)
          assertEquals(omit(hw_2, ['professions']), {
            avatar_url: 'avatar_url',
            email: hw_at_organization2.email,
            display_name: 'At Organization 2',
            health_worker_id: hw_at_organization2.id,
            is_invitee: false,
            name: 'At Organization 2',
            registration_status: 'incomplete',
            actions: {
              view: `/app/organizations/${
                organization_ids[0]
              }/employees/${hw_at_organization2.id}`,
            },
            online: null,
          })
          assertEquals(hw_2.professions.length, 2)
          assertEquals(hw_2.professions[0].profession, 'admin')
          assertEquals(hw_2.professions[1].profession, 'doctor')

          const invitedHw = withInvitees.find((hw) =>
            hw.email === invited.email
          )!
          assertEquals(omit(invitedHw, ['professions']), {
            avatar_url: null,
            email: invited.email,
            display_name: invited.email,
            health_worker_id: null,
            is_invitee: true,
            name: null,
            registration_status: 'incomplete',
            actions: {
              view: null,
            },
            online: null,
          })

          assertEquals(invitedHw.professions.length, 1)
          assertEquals(invitedHw.professions[0].profession, 'doctor')

          {
            const withoutInvitees = await organizations.getEmployees(
              trx,
              organization_ids[0],
            )

            const hw_1 = withoutInvitees.find((hw) =>
              hw.health_worker_id === hw_at_organization1.id
            )
            assert(hw_1)
            assertEquals(omit(hw_1, ['professions']), {
              avatar_url: 'avatar_url',
              email: hw_at_organization1.email,
              display_name: 'At Organization 1',
              health_worker_id: hw_at_organization1.id,
              is_invitee: false,
              name: 'At Organization 1',
              registration_status: 'incomplete',
              actions: {
                view: `/app/organizations/${
                  organization_ids[0]
                }/employees/${hw_at_organization1.id}`,
              },
              online: null,
            })
            assertEquals(hw_1.professions.length, 2)
            assertEquals(hw_1.professions[0].profession, 'admin')
            assertEquals(hw_1.professions[1].profession, 'nurse')

            const hw_2 = withoutInvitees.find((hw) =>
              hw.health_worker_id === hw_at_organization2.id
            )
            assert(hw_2)
            assertEquals(omit(hw_2, ['professions']), {
              avatar_url: 'avatar_url',
              email: hw_at_organization2.email,
              display_name: 'At Organization 2',
              health_worker_id: hw_at_organization2.id,
              is_invitee: false,
              name: 'At Organization 2',
              registration_status: 'incomplete',
              actions: {
                view: `/app/organizations/${
                  organization_ids[0]
                }/employees/${hw_at_organization2.id}`,
              },
              online: null,
            })
            assertEquals(hw_2.professions.length, 2)
            assertEquals(hw_2.professions[0].profession, 'admin')
            assertEquals(hw_2.professions[1].profession, 'doctor')

            assert(withoutInvitees.every((hw) => !hw.is_invitee))
          }
        }),
    )

    itUsesTrxAnd(
      'can get employees matching emails',
      (trx) =>
        withTestOrganizations(trx, { count: 2 }, async (organization_ids) => {
          const hw_at_organization1 = await health_workers.upsert(trx, {
            name: 'At Organization 1',
            email: `${generateUUID()}@worker.com`,
            avatar_url: 'avatar_url',
          })
          assert(hw_at_organization1)

          const hw_at_organization2 = await health_workers.upsert(trx, {
            name: 'At Organization 2',
            email: `${generateUUID()}@worker.com`,
            avatar_url: 'avatar_url',
          })
          assert(hw_at_organization2)

          const hw_other_organization = await health_workers.upsert(trx, {
            name: 'At Organization 3',
            email: `${generateUUID()}@worker.com`,
            avatar_url: 'avatar_url',
          })
          assert(hw_other_organization)

          await employment.add(trx, [
            {
              health_worker_id: hw_at_organization1.id,
              organization_id: organization_ids[0],
              profession: 'nurse',
            },
            {
              health_worker_id: hw_at_organization1.id,
              organization_id: organization_ids[0],
              profession: 'admin',
            },
            {
              health_worker_id: hw_at_organization2.id,
              organization_id: organization_ids[0],
              profession: 'doctor',
            },
            {
              health_worker_id: hw_at_organization2.id,
              organization_id: organization_ids[0],
              profession: 'admin',
            },
            {
              health_worker_id: hw_at_organization2.id,
              organization_id: organization_ids[1],
              profession: 'doctor',
            },
            {
              health_worker_id: hw_other_organization.id,
              organization_id: organization_ids[1],
              profession: 'doctor',
            },
          ])

          await employment.addInvitees(trx, organization_ids[0], [
            {
              email: `${generateUUID()}@test.com`,
              profession: 'doctor',
            },
          ])

          const withInvitees = await organizations.getEmployeesAndInvitees(
            trx,
            organization_ids[0],
            {
              emails: [hw_at_organization2.email],
            },
          )

          assertEquals(withInvitees.length, 1)
          assertEquals(omit(withInvitees[0], ['professions']), {
            avatar_url: 'avatar_url',
            email: hw_at_organization2.email,
            display_name: 'At Organization 2',
            health_worker_id: hw_at_organization2.id,
            is_invitee: false,
            name: 'At Organization 2',
            registration_status: 'incomplete',
            actions: {
              view: `/app/organizations/${
                organization_ids[0]
              }/employees/${hw_at_organization2.id}`,
            },
            online: null,
          })
          assertEquals(withInvitees[0].professions.length, 2)
          assertEquals(withInvitees[0].professions[0].profession, 'admin')
          assertEquals(withInvitees[0].professions[1].profession, 'doctor')
        }),
    )

    itUsesTrxAnd(
      "assures that registration_status is pending_approval for when registration is complete, but hasn't been approved",
      async (trx) => {
        const hw_at_organization1 = await health_workers.upsert(trx, {
          name: 'At Organization 1',
          email: `${generateUUID()}@worker.com`,
          avatar_url: 'avatar_url',
        })
        assert(hw_at_organization1)

        await employment.add(trx, [
          {
            health_worker_id: hw_at_organization1.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
            profession: 'nurse',
          },
        ])

        const nurse_address = await insertTestAddress(trx)
        assert(nurse_address)

        await nurse_registration_details.add(trx, {
          health_worker_id: hw_at_organization1.id,
          gender: 'female',
          national_id_number: randomNationalId(),
          date_of_first_practice: '2020-01-01',
          ncz_registration_number: 'GN123456',
          mobile_number: '5555555555',
          national_id_media_id: null,
          ncz_registration_card_media_id: null,
          face_picture_media_id: null,
          nurse_practicing_cert_media_id: null,
          approved_by: null,
          date_of_birth: '2020-01-01',
          address_id: nurse_address.id,
        })

        const withInvitees = await organizations.getEmployeesAndInvitees(
          trx,
          '00000000-0000-0000-0000-000000000001',
          {
            emails: [hw_at_organization1.email],
          },
        )

        assertEquals(withInvitees.length, 1)
        assertEquals(omit(withInvitees[0], ['professions']), {
          avatar_url: 'avatar_url',
          email: hw_at_organization1.email,
          display_name: 'At Organization 1',
          health_worker_id: hw_at_organization1.id,
          is_invitee: false,
          name: 'At Organization 1',
          registration_status: 'pending_approval',
          actions: {
            view:
              `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${hw_at_organization1.id}`,
          },
          online: null,
        })
        assertEquals(withInvitees[0].professions.length, 1)
        assertEquals(withInvitees[0].professions[0].profession, 'nurse')
      },
    )

    itUsesTrxAnd(
      'assures that registration_status is approved for when registration is complete, and has been approved',
      async (trx) => {
        const nurse = await health_workers.upsert(trx, {
          name: 'Nurse',
          email: `${generateUUID()}@worker.com`,
          avatar_url: 'avatar_url',
        })
        assert(nurse)

        const admin = await health_workers.upsert(trx, {
          name: 'Admin',
          email: `${generateUUID()}@worker.com`,
          avatar_url: 'avatar_url',
        })
        assert(admin)

        await employment.add(trx, [
          {
            health_worker_id: nurse.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
            profession: 'nurse',
          },
          {
            health_worker_id: admin.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
            profession: 'admin',
          },
        ])

        const nurse_address = await insertTestAddress(trx)
        assert(nurse_address)

        await nurse_registration_details.add(trx, {
          health_worker_id: nurse.id,
          gender: 'female',
          national_id_number: randomNationalId(),
          date_of_first_practice: '2020-01-01',
          ncz_registration_number: 'GN123456',
          mobile_number: '5555555555',
          national_id_media_id: null,
          ncz_registration_card_media_id: null,
          face_picture_media_id: null,
          nurse_practicing_cert_media_id: null,
          approved_by: admin.id,
          date_of_birth: '2020-01-01',
          address_id: nurse_address.id,
        })

        const withInvitees = await organizations.getEmployeesAndInvitees(
          trx,
          '00000000-0000-0000-0000-000000000001',
          {
            emails: [nurse.email, admin.email],
          },
        )

        assertEquals(withInvitees.length, 2)
        const nurse_result = withInvitees.find((e) =>
          e.professions[0].profession === 'nurse'
        )!
        const admin_result = withInvitees.find((e) =>
          e.professions[0].profession === 'admin'
        )!
        assertEquals(omit(nurse_result, ['professions']), {
          avatar_url: 'avatar_url',
          email: nurse.email,
          display_name: 'Nurse',
          health_worker_id: nurse.id,
          is_invitee: false,
          name: 'Nurse',
          registration_status: 'approved',
          actions: {
            view:
              `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${nurse.id}`,
          },
          online: null,
        })
        assertEquals(nurse_result.professions.length, 1)
        assertEquals(nurse_result.professions[0].profession, 'nurse')
        assertEquals(omit(admin_result, ['professions']), {
          avatar_url: 'avatar_url',
          email: admin.email,
          display_name: 'Admin',
          health_worker_id: admin.id,
          is_invitee: false,
          name: 'Admin',
          registration_status: 'approved',
          actions: {
            view:
              `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${admin.id}`,
          },
          online: null,
        })
        assertEquals(admin_result.professions.length, 1)
        assertEquals(admin_result.professions[0].profession, 'admin')
      },
    )
  })

  describe('invite', () => {
    itUsesTrxAnd(
      'adds rows to health_worker_invitees if the user is not already a health worker at the organization',
      async (trx) => {
        const email = `${generateUUID()}@example.com`
        await organizations.invite(
          trx,
          '00000000-0000-0000-0000-000000000001',
          [
            { email, profession: 'nurse' },
          ],
        )
        const invitees = await trx.selectFrom('health_worker_invitees').where(
          'email',
          '=',
          email,
        ).selectAll()
          .execute()

        assertEquals(invitees.length, 1)
        const invitee = invitees[0]
        assertEquals(invitee.email, email)
        assertEquals(invitee.profession, 'nurse')
      },
    )

    itUsesTrxAnd(
      'adds the profession if the health worker is already employed at this organization',
      async (trx) => {
        const hw_at_organization1 = await health_workers.upsert(trx, {
          name: 'At Organization 1',
          email: `${generateUUID()}@worker.com`,
          avatar_url: 'avatar_url',
        })
        assert(hw_at_organization1)

        await employment.add(trx, [
          {
            health_worker_id: hw_at_organization1.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
            profession: 'admin',
          },
        ])

        await organizations.invite(
          trx,
          '00000000-0000-0000-0000-000000000001',
          [
            { email: hw_at_organization1.email, profession: 'doctor' },
          ],
        )
        const invitees = await trx.selectFrom('health_worker_invitees').where(
          'email',
          '=',
          hw_at_organization1.email,
        ).selectAll()
          .execute()

        assertEquals(invitees.length, 0)

        const employmentResult = await trx.selectFrom('employment').where(
          'health_worker_id',
          '=',
          hw_at_organization1.id,
        ).selectAll()
          .execute()
        assertEquals(employmentResult.length, 2)
        assertEquals(
          employmentResult[0].health_worker_id,
          employmentResult[1].health_worker_id,
        )
        assertEquals(employmentResult[0].profession, 'admin')
        assertEquals(employmentResult[1].profession, 'doctor')
      },
    )

    itUsesTrxAnd(
      'fails if the user is already a health worker at the organization with that exact profession',
      async (trx) => {
        const same_email = `${generateUUID()}@worker.com`
        const hw_at_organization1 = await health_workers.upsert(trx, {
          name: 'At Organization 1',
          email: same_email,
          avatar_url: 'avatar_url',
        })
        assert(hw_at_organization1)

        await employment.add(trx, [
          {
            health_worker_id: hw_at_organization1.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
            profession: 'admin',
          },
        ])

        await assertRejects(
          () =>
            organizations.invite(trx, '00000000-0000-0000-0000-000000000001', [
              { email: same_email, profession: 'admin' },
            ]),
          StatusError,
          `${same_email} is already employed as a admin. Please remove them from the list.`,
        )
      },
    )

    itUsesTrxAnd(
      'fails on an attempt to invite an existing nurse as a doctor ',
      async (trx) => {
        const same_email = `${generateUUID()}@worker.com`
        const hw_at_organization1 = await health_workers.upsert(trx, {
          name: 'At Organization 1',
          email: same_email,
          avatar_url: 'avatar_url',
        })
        assert(hw_at_organization1)

        await employment.add(trx, [
          {
            health_worker_id: hw_at_organization1.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
            profession: 'nurse',
          },
        ])

        await assertRejects(
          () =>
            organizations.invite(trx, '00000000-0000-0000-0000-000000000001', [
              { email: same_email, profession: 'doctor' },
            ]),
          StatusError,
          `${same_email} is already employed as a nurse so they can't also be employed as a doctor. Please remove them from the list.`,
        )
      },
    )
  })
})
