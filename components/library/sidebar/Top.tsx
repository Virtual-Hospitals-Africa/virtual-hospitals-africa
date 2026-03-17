import { ComponentChildren } from 'preact'
import { LogoWithCollapsibleText } from '../../../islands/Logo.tsx'
import { HEADER_HEIGHT_PX } from '../HeaderHeight.ts'

export function HealthWorkerDefaultTop() {
  return (
    <Top href='/app'>
      <LogoWithCollapsibleText variant='indigo' className='w-full h-full' />
    </Top>
  )
}

export function RegulatorDefaultTop() {
  return (
    <Top href='/regulator'>
      <LogoWithCollapsibleText variant='indigo' className='w-full h-full' />
    </Top>
  )
}

export function DefaultTop({ url }: { url: URL }) {
  if (url.pathname.startsWith('/app') || url.pathname.startsWith('/tutorial') || url.pathname.startsWith('/example')) {
    return <HealthWorkerDefaultTop />
  }
  if (url.pathname.startsWith('/regulator')) {
    return <RegulatorDefaultTop />
  }
  throw new Error(`Could not compute home page top for url: ${url}`)
}

export function Top({ href, children }: { href: string; children: ComponentChildren }) {
  return (
    <a
      href={href}
      className='flex items-center w-full h-full gap-3 shrink-0'
      style={{
        height: HEADER_HEIGHT_PX,
        display: 'grid',
        placeItems: 'center',
        width: '100%',
      }}
    >
      {children}
    </a>
  )
}
