import { WifiIcon } from '../library/icons/heroicons/solid.tsx'

export default function WifiPattern() {
  return (
    <div
      aria-hidden='true'
      className='absolute inset-0 h-full w-full'
    >
      <WifiIcon
        className='absolute -top-24 -right-24 w-72 h-72'
        fill='white'
        stroke='white'
        rotate='90deg'
        // opacity={0.7}
        style={{
          transform: 'rotate(-135deg)',
        }}
      />
    </div>
  )
}
