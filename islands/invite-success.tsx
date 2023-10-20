import { JSX } from 'preact'
import SuccessMessage from './SuccessMessage.tsx'

interface InviteSuccessProps {
  invited: string | null
}

export default function InviteSuccess(
  { invited }: InviteSuccessProps,
): JSX.Element {
  return (
    <SuccessMessage message={invited && `Successfully invited ${invited}`} />
  )
}
