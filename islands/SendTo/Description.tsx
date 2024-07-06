import { Sendable } from '../../types.ts'

export function Description(
  { description }: { description: Sendable['description'] },
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
            target='_blank'
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
