export function AdditionalDescription(
  { additional_description }: {
    additional_description?: string
  },
) {
  if (!additional_description) {
    return null
  }
  return (
    <p className='text-sm font-sans text-gray-500 leading-normal break-words'>
      {additional_description}
    </p>
  )
}
