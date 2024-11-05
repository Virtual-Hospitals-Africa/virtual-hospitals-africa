export type DescriptionLine = {
  text: string
  href?: string
  parenthetical?: string
}

export function Description(
  { description }: { description?: DescriptionLine },
) {
  if (!description) {
    return null
  }
  return (
    <p className='text-sm font-sans text-gray-500 leading-normal break-words'>
      {description.href
        ? (
          <a
            href={description.href}
            rel='noopener noreferrer'
            className='text-blue-500'
          >
            {description.text}
          </a>
        )
        : (
          description.text
        )}
      {description.parenthetical && (
        <span>
          ({description.parenthetical})
        </span>
      )}
    </p>
  )
}
