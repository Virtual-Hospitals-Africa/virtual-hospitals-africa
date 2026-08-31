import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { caseReferralNotificationDescription } from '../../../shared/notifications/case_referral_notification.ts'

describe('shared/notifications/case_referral_notification.ts', () => {
  describe('caseReferralNotificationDescription', () => {
    it('includes the presenting issue when provided', () => {
      assertEquals(
        caseReferralNotificationDescription({
          originator_display_name: 'Dr. Ada',
          priority_name: 'urgent',
          presenting_issue: 'Chest Pain',
        }),
        'Dr. Ada referred a urgent priority case to you: chest pain',
      )
    })

    it('trims whitespace from the presenting issue', () => {
      assertEquals(
        caseReferralNotificationDescription({
          originator_display_name: 'Dr. Ada',
          priority_name: 'urgent',
          presenting_issue: '  Chest Pain  ',
        }),
        'Dr. Ada referred a urgent priority case to you: chest pain',
      )
    })

    it('omits the suffix when the presenting issue is missing', () => {
      assertEquals(
        caseReferralNotificationDescription({
          originator_display_name: 'Dr. Ada',
          priority_name: 'urgent',
        }),
        'Dr. Ada referred a urgent priority case to you',
      )
      assertEquals(
        caseReferralNotificationDescription({
          originator_display_name: 'Dr. Ada',
          priority_name: 'urgent',
          presenting_issue: null,
        }),
        'Dr. Ada referred a urgent priority case to you',
      )
      assertEquals(
        caseReferralNotificationDescription({
          originator_display_name: 'Dr. Ada',
          priority_name: 'urgent',
          presenting_issue: '   ',
        }),
        'Dr. Ada referred a urgent priority case to you',
      )
    })
  })
})
