import { useSignal } from '@preact/signals'
import { showAlertMessage } from './alert/AlertListener.tsx'

export default function CreateGoogleMeetButton({
  organization_id,
  patient_id,
}: {
  organization_id: string
  patient_id: string
}) {
  const is_loading = useSignal(false)

  async function createMeeting() {
    if (is_loading.value) return

    is_loading.value = true

    try {
      const response = await fetch(
        `/app/organizations/${organization_id}/patients/${patient_id}/open_encounter/create-google-meet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to create Google Meet link')
      }

      const data = await response.json()
      const { hangoutLink } = data

      await navigator.clipboard.writeText(hangoutLink)

      showAlertMessage({
        message: 'Google Meet link created and copied to clipboard',
        level: 'success',
        actions: [
          {
            name: 'Open Meeting',
            href: hangoutLink,
          },
        ],
      })

      globalThis.open(hangoutLink, '_blank')
    } catch (error) {
      console.error('Error creating Google Meet:', error)
      showAlertMessage({
        message: 'Failed to create Google Meet link',
        level: 'error',
      })
    } finally {
      is_loading.value = false
    }
  }

  return (
    <button
      type='button'
      onClick={createMeeting}
      disabled={is_loading.value}
      className='w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
    >
      {is_loading.value ? 'Creating...' : 'Create Google Meet'}
    </button>
  )
}
