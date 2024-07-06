import { Maybe } from '../types.ts'
import cls from '../util/cls.ts'

export default function OnlineIndicator(
  { online }: { online?: Maybe<boolean> },
) {
  if (online == null) {
    return null
  }

  return (
    <span
      className={cls(
        'absolute right-0 top-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white',
        online ? 'bg-green-400' : 'bg-gray-300',
      )}
      aria-hidden='true'
    />
  )
}
