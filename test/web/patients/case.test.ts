import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { describeParallel, itParallel } from '../../_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../db/db.ts'
import { organizations } from '../../../db/models/organizations.ts'
import { patients } from '../../../db/models/patients.ts'
import { referrals } from '../../../db/models/referrals.ts'
import { addTestEmployeeWithSession } from '../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../_helpers/organizations.ts'
import { insertReturningSeekingTreatmentWithEmployeeForTest } from '../../_helpers/workflows.ts'
import waitUntilTestServerUp from '../../_helpers/waitUntilTestServerUp.ts'

function assertReferralPrecedesTabs(html: string) {
  const referral_at = html.indexOf('patient-case-referral')
  const tabs_at = html.indexOf('patient-case-tabs')
  assert(referral_at !== -1)
  assert(tabs_at !== -1)
  assert(referral_at < tabs_at)
}

describeParallel(
  '/app/organizations/[organization_id]/patients/[patient_id]/case',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())

    itParallel('shows the patient case overview and switches tabs', async () => {
      const organization_id = TEST_ORGANIZATION_UUIDS.ZA.clinic
      const { fetchCheerio } = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        organization_id,
      })

      const inserted = await patients.insert(db, {
        name: 'Case View Patient',
        sex: 'male',
        gender: 'man',
        date_of_birth: '1995-04-12',
      })
      await patients.completeRegistration(db, inserted.id)
      const patient = await patients.getById(db, inserted.id, {
        include_incomplete_registration: true,
      })

      const case_path = `/app/organizations/${organization_id}/patients/${patient.id}/case`
      const $overview = await fetchCheerio(case_path)

      assertEquals($overview('#patient-case-name').text(), patient.name)
      assertEquals($overview('#patient-case-sex').text(), 'Male')
      assertEquals($overview('#patient-case-dob').text(), patient.dob_formatted)
      assertEquals($overview('#patient-case-age').text(), `(${patient.age_years}yrs)`)
      assertEquals($overview('#patient-case-priority').length, 0)
      assertEquals($overview(`a[href="${case_path}"]`).attr('aria-current'), 'page')
      assertEquals($overview('#patient-case-panel-overview').length, 1)
      assert($overview('#patient-case-panel-overview').text().includes('Medications'))
      assert($overview('#patient-case-panel-overview').text().includes('Pre Existing Conditions'))
      assert($overview('#patient-case-panel-overview').text().includes('No findings entered'))
      assert(!$overview.text().includes('Referred by'))
      assert(!$overview.text().includes('Lukman'))
      assert($overview('#patient-case-final-diagnosis').is(':disabled'))
      assert($overview('#patient-case-order-test').is(':disabled'))
      assert($overview('#patient-case-call-nurse').is(':disabled'))
      assertEquals($overview('#patient-case-exit').length, 0)
      assertEquals(
        $overview('#patient-case-back').attr('href'),
        `/app/organizations/${organization_id}/patients/${patient.id}/profile`,
      )
      assertEquals($overview('#patient-case-view > footer').length, 1)
      assertEquals($overview('#patient-case-scroll').length, 1)

      const $this_visit = await fetchCheerio(`${case_path}?tab=this_visit`)
      assertEquals($this_visit(`a[href="${case_path}?tab=this_visit"]`).attr('aria-current'), 'page')
      assertEquals($this_visit('#patient-case-panel-overview').length, 0)
      assertEquals($this_visit('#patient-drawer-this-visit').length, 1)

      const $history = await fetchCheerio(`${case_path}?tab=history`)
      assertEquals($history(`a[href="${case_path}?tab=history"]`).attr('aria-current'), 'page')
      assertEquals($history('#patient-case-panel-overview').length, 0)
      assert($history('#patient-drawer-history').text().includes('Allergies'))

      const $waiting_room = await fetchCheerio(
        `/app/organizations/${organization_id}/waiting_room`,
      )
      assert($waiting_room.url.includes('/waiting_room'))
    })

    itParallel('shows the latest referring clinician only to the notified recipient', async () => {
      const organization_id = TEST_ORGANIZATION_UUIDS.ZA.clinic
      const organization = await organizations.getById(db, organization_id)
      const self_pickup = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        organization_id,
      })
      const earlier_referrer = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        organization_id,
      })
      const later_referrer = await addTestEmployeeWithSession(db, {
        role: 'doctor',
        organization_id,
      })
      const recipient = await addTestEmployeeWithSession(db, {
        role: 'doctor',
        organization_id,
      })
      const uninvolved = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        organization_id,
      })

      const inserted = await patients.insert(db, {
        name: 'Referred Case Patient',
        sex: 'female',
        gender: 'woman',
        date_of_birth: '1990-01-20',
      })
      await patients.completeRegistration(db, inserted.id)
      const encounter = await insertReturningSeekingTreatmentWithEmployeeForTest(db, organization_id, {
        patient_id: inserted.id,
        employment_id: self_pickup.health_worker.employee_id,
      })
      const case_path = `/app/organizations/${organization_id}/patients/${inserted.id}/case`

      const $self_pickup = await self_pickup.fetchCheerio(case_path)
      assertEquals($self_pickup('#patient-case-referral').length, 0)
      assertEquals($self_pickup('#patient-case-name').text(), 'Referred Case Patient')
      assert($self_pickup('#patient-case-panel-overview').text().includes('Medications'))
      assert($self_pickup('#patient-case-final-diagnosis').is(':disabled'))
      assertEquals($self_pickup('#patient-case-view > footer').length, 1)

      const earlier_referral = await referrals.insert(db, {
        patient_id: inserted.id,
        patient_encounter_id: encounter.patient_encounter_id,
        organization_id,
        employment_id: earlier_referrer.health_worker.employee_id,
        originator_health_worker_id: earlier_referrer.health_worker.id,
        originator_avatar_url: `/health_workers/${earlier_referrer.health_worker.id}/avatar`,
        health_worker_ids_to_be_notified: [recipient.health_worker.id],
      })
      await db.updateTable('patient_records_aggregated')
        .set({ created_at: new Date('2020-01-01T00:00:00.000Z') })
        .where('id', '=', earlier_referral.referral_id)
        .execute()

      await referrals.insert(db, {
        patient_id: inserted.id,
        patient_encounter_id: encounter.patient_encounter_id,
        organization_id,
        employment_id: later_referrer.health_worker.employee_id,
        originator_health_worker_id: later_referrer.health_worker.id,
        originator_avatar_url: `/health_workers/${later_referrer.health_worker.id}/avatar`,
        health_worker_ids_to_be_notified: [recipient.health_worker.id],
      })

      const $recipient = await recipient.fetchCheerio(case_path)
      assert(earlier_referrer.health_worker.name !== later_referrer.health_worker.name)
      assertEquals($recipient('#patient-case-referral-label').text(), 'Referred by')
      assertEquals($recipient('#patient-case-referrer-name').text(), later_referrer.health_worker.name)
      assertEquals($recipient('#patient-case-referrer-organization').text(), organization.name)
      assert($recipient('#patient-case-referral-call').is(':disabled'))
      assert($recipient('#patient-case-referral-more').is(':disabled'))
      assertEquals($recipient('#patient-case-name').text(), 'Referred Case Patient')
      assertEquals($recipient('#patient-case-sex').text(), 'Female')
      assert($recipient('#patient-case-panel-overview').text().includes('Medications'))
      assert($recipient('#patient-case-panel-overview').text().includes('Pre Existing Conditions'))
      assert($recipient('#patient-case-final-diagnosis').is(':disabled'))
      assert($recipient('#patient-case-order-test').is(':disabled'))
      assert($recipient('#patient-case-call-nurse').is(':disabled'))
      assertEquals($recipient('#patient-case-view > footer').length, 1)
      assertReferralPrecedesTabs($recipient.html())

      const $this_visit = await recipient.fetchCheerio(`${case_path}?tab=this_visit`)
      assertEquals($this_visit('#patient-case-referrer-name').text(), later_referrer.health_worker.name)
      assertEquals($this_visit('#patient-drawer-this-visit').length, 1)
      assertEquals($this_visit('#patient-case-panel-overview').length, 0)
      assertReferralPrecedesTabs($this_visit.html())

      const $history = await recipient.fetchCheerio(`${case_path}?tab=history`)
      assertEquals($history('#patient-case-referrer-name').text(), later_referrer.health_worker.name)
      assert($history('#patient-drawer-history').text().includes('Allergies'))
      assertEquals($history('#patient-case-panel-overview').length, 0)
      assertReferralPrecedesTabs($history.html())

      const $uninvolved = await uninvolved.fetchCheerio(case_path)
      assertEquals($uninvolved('#patient-case-referral').length, 0)

      const $originator = await self_pickup.fetchCheerio(case_path)
      assertEquals($originator('#patient-case-referral').length, 0)

      const tied_created_at = new Date('2024-06-01T00:00:00.000Z')
      const tied_matches = await referrals.findAll(db, {
        patient_encounter_id: encounter.patient_encounter_id,
        notified_health_worker_id: recipient.health_worker.id,
      })
      await db.updateTable('patient_records_aggregated')
        .set({ created_at: tied_created_at })
        .where('id', 'in', tied_matches.map((referral) => referral.id))
        .execute()

      let winning_referral: (typeof tied_matches)[number] | null = null
      for (const referral of tied_matches) {
        if (!winning_referral || referral.id > winning_referral.id) winning_referral = referral
      }
      assert(winning_referral)
      const tied_referrer_name = winning_referral.employment_id === later_referrer.health_worker.employee_id
        ? later_referrer.health_worker.name
        : earlier_referrer.health_worker.name
      const $tied = await recipient.fetchCheerio(case_path)
      assertEquals($tied('#patient-case-referrer-name').text(), tied_referrer_name)
    })
  },
)
