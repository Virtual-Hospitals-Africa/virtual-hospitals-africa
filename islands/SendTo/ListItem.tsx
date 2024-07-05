import { JSX } from 'preact'
import * as HeroIconsOutline from '../../components/library/icons/heroicons/outline.tsx'
import { Image, Sendable, SendableToEntity } from '../../types.ts'
import Avatar from '../../components/library/Avatar.tsx'
import { assertEquals } from 'std/assert/assert_equals.ts'
import cls from '../../util/cls.ts'
import OnlineIndicator from '../../components/OnlineIndicator.tsx'

function CircularImage({ image }: { image: Image }) {
  if (image.type === 'avatar') {
    return <Avatar src={image.url} className={image.className} />
  }
  assertEquals(image.type, 'icon')

  if (image.icon === 'BluetoothIcon') {
    throw new Error('BluetoothIcon is not supported yet')
  }

  const Icon = HeroIconsOutline[image.icon]
  return (
    <Icon
      className={cls('h-6 w-6 text-gray-500', image.className)}
      aria-hidden='true'
    />
  )
}

function Description(
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

export function SendableListItem(
  { sendable, selected }: { sendable: Sendable; selected: boolean },
): JSX.Element {
  const { image, name, description, status, menu_options, to } = sendable
  return (
    <li>
      <a>
        <div className='group relative flex items-center px-5 py-6'>
          <a className='-m-1 block flex-1 p-1'>
            <div
              className='absolute inset-0 group-hover:bg-gray-50'
              aria-hidden='true'
            />
            <div className='relative flex min-w-0 flex-1 items-center'>
              <span className='relative inline-block flex-shrink-0'>
                <CircularImage image={image} />
                <OnlineIndicator
                  online={to.type === 'entity' ? to.online : null}
                />
              </span>
              <div className='ml-4'>
                <p className='text-sm font-sans font-medium text-gray-900 leading-normal'>
                  {name}
                </p>
                <Description description={description} />

                {sendable.status && (
                  <p className='text-xs font-ubuntu text-gray-500 whitespace-pre-line'>
                    {sendable.status}
                  </p>
                )}
                {
                  /* {!online && reopenTime && (
                  <p className='text-xs font-ubuntu text-gray-500'>
                    {reopenTime}
                  </p>
                )} */
                }
              </div>
            </div>
          </a>
        </div>
      </a>
    </li>
  )
}
