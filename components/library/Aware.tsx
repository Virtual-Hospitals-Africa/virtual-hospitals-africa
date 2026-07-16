import * as AwareIcons from './icons/aware.tsx'

export function AwareCircle({ aware }: { aware: 'Access' | 'Watch' | 'Reserve' | null }) {
  if (!aware) return null
  const Icon = AwareIcons[aware]
  return <Icon />
}
