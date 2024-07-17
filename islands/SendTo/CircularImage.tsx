import * as HeroIconsOutline from '../../components/library/icons/heroicons/outline.tsx'
import { Image } from '../../types.ts'
import Avatar from '../../components/library/Avatar.tsx'
import { assertEquals } from 'std/assert/assert_equals.ts'
import cls from '../../util/cls.ts'
import { BluetoothIcon } from '../../components/library/icons/BluetoothIcon.tsx'

export function CircularImage({ image }: { image: Image }) {
  if (image.type === 'avatar') {
    return (
      <Avatar src={image.url} className={cls('h-10 w-10', image.className)} />
    )
  }
  assertEquals(image.type, 'icon')

  if (image.icon === 'BluetoothIcon') {
    return (
      <BluetoothIcon
        className={cls('h-10 w-10 text-gray-500', image.className)}
        aria-hidden='true'
      />
    )
    //throw new Error('BluetoothIcon is not supported yet')
  }

  const Icon = HeroIconsOutline[image.icon]
  return (
    <Icon
      className={cls('h-10 w-10 text-gray-500', image.className)}
      aria-hidden='true'
    />
  )
}
