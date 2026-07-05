import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import type { RenderedReferralRecipient } from '../../types.ts'
import { Person } from '../../components/library/Person.tsx'
import Badge, { type BadgeColor } from '../../components/library/Badge.tsx'

const POLL_INTERVAL_MS = 5000

const STATE_DISPLAY: Record<
  RenderedReferralRecipient['referral_state']['state'],
  { label: string; color: BadgeColor }
> = {
  not_seen: { label: 'Not seen yet', color: 'gray' },
  seen: { label: 'Seen', color: 'blue' },
  busy: { label: 'Busy', color: 'red' },
  reviewing: { label: 'Reviewing chart', color: 'yellow' },
  reverted: { label: 'Chart reverted', color: 'green' },
}

export function ReferralRecipients(
  { referral_id, recipients: initial_recipients }: {
    referral_id: string
    recipients: RenderedReferralRecipient[]
  },
) {
  const recipients = useSignal(initial_recipients)
  const last_polled_at = useSignal<string>(new Date().toLocaleTimeString())

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/app/referrals/${referral_id}`, {
          headers: { accept: 'application/json' },
        })
        if (response.ok) {
          const referral = await response.json()
          recipients.value = referral.recipients
        }
      } finally {
        last_polled_at.value = new Date().toLocaleTimeString()
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [referral_id])

  return (
    <div class='flex flex-col gap-3'>
      {recipients.value.map((recipient) => {
        const { label, color } = STATE_DISPLAY[recipient.referral_state.state]
        return (
          <div class='flex items-center gap-3' key={recipient.health_worker.id}>
            <Person person={recipient.health_worker} />
            <Badge content={label} color={color} />
          </div>
        )
      })}
      <span class='text-xs text-gray-500'>
        {last_polled_at.value ? `Last checked at ${last_polled_at.value}` : 'Checking for updates…'}
      </span>
    </div>
  )
}
