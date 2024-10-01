import { Sendable } from '../../types.ts'

export function AdditionalInfo(
  { additional_info }: { additional_info: Sendable['additional_info'] },
) {
  if (!additional_info) {
    return null
  }
  return (
    <p className='text-xs font-sans text-gray-500 leading-normal break-words italic'>
      {additional_info}
    </p>
  )
}
