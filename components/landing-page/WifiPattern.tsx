import { WifiIcon } from '../library/icons/heroicons/solid.tsx'

export default function WifiPattern() {
  return (
    <div
      aria-hidden='true'
      className='hidden md:block md:absolute inset-0 h-full w-full'
    >
      <WifiIcon
        className='absolute -top-24 -right-24 w-72 h-72'
        fill='white'
        stroke='white'
        style={{
          transform: 'rotate(-135deg)',
        }}
      />
    </div>
  )
}
