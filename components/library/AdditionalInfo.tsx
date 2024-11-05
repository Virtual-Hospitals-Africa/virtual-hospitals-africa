export function AdditionalInfo(
  { additional_info }: { additional_info?: string },
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
