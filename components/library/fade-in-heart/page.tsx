import { VHAText } from './vha-text.tsx'
import { WifiHeart } from './wifi-heart.tsx'

type FadeInHeartProps = {
  backgroundColor?: string
  primaryColor: 'white' | 'indigo'
}

export function FadeInHeartPage(props: FadeInHeartProps) {
  return (
    <div
      style={{
        height: '100vh',
        padding: 20,
        backgroundColor: props.backgroundColor,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div className='flex items-center gap-8'>
        <WifiHeart variant={props.primaryColor} width='400px' />
        <VHAText variant={props.primaryColor} />
      </div>
    </div>
  )
}
