import { ComponentChildren } from 'preact'
import BottomNav from './BottomNav.tsx'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'
import SuccessMessage from '../../islands/SuccessMessage.tsx'
import { Footer } from '../../components/landing-page/Footer.tsx'
import { assert } from 'std/assert/assert.ts'
import { ErrorListener } from '../../islands/ErrorListener.tsx'

export type LayoutProps =
  & {
    title: string
    route: string
    url: URL
    children: ComponentChildren
  }
  & ({
    variant: 'standard' | 'form'
    avatarUrl: string
  } | {
    variant: 'just-logo' | 'landing-page'
    avatarUrl?: undefined
  })

function AppLayoutContents(
  { title, route, avatarUrl, variant, children }: {
    title: string
    route: string
    avatarUrl: string
    variant: 'standard' | 'form'
    children: ComponentChildren
  },
) {
  return (
    <>
      <Sidebar route={route} />
      <section className='md:pl-48'>
        <Header
          title={title}
          avatarUrl={avatarUrl}
          variant={variant}
        />
        {children}
      </section>
      <BottomNav route={route} />
    </>
  )
}

function JustLogoLayoutContents(
  { title, children }: {
    title: string
    route: string
    children: ComponentChildren
  },
) {
  return (
    <>
      <Header
        title={title}
        variant='just-logo'
      />
      <section className='min-h-full flex flex-col align-center justify-between flex-grow'>
        {children}
        <Footer />
      </section>
    </>
  )
}

export default function Layout(props: LayoutProps) {
  const success = props.url.searchParams.get('success')
  const error = props.url.searchParams.get('error')

  assert(!success || !error, 'Cannot have both success and error')

  return (
    <>
      <SuccessMessage
        message={success}
        className='fixed z-50 top-0 left-0 right-0 m-12'
      />
      <ErrorListener
        initialError={error}
      />
      {props.variant === 'landing-page' && props.children}
      {(props.variant === 'standard' ||
        props.variant === 'form') && <AppLayoutContents {...props} />}
      {props.variant === 'just-logo' && <JustLogoLayoutContents {...props} />}
    </>
  )
}
