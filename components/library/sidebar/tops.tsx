import { LogoWithCollapsibleText } from '../../../islands/Logo.tsx'

export const HealthWorkerDefaultTop = {
  href: '/app',
  child: <LogoWithCollapsibleText variant='indigo' className='w-full h-full' />,
}

export const RegulatorDefaultTop = {
  href: '/regulator',
  child: <LogoWithCollapsibleText variant='indigo' className='w-full h-full' />,
}

export function defaultTop(url: URL) {
  if (url.pathname.startsWith('/app') || url.pathname.startsWith('/tutorial') || url.pathname.startsWith('/example')) {
    return HealthWorkerDefaultTop
  }
  if (url.pathname.startsWith('/regulator')) {
    return RegulatorDefaultTop
  }
  throw new Error(`Could not compute home page top for url: ${url}`)
}
