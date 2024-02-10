import { ComponentChild, ComponentChildren } from 'preact'
// import BottomNav from './BottomNav.tsx'
import { Header } from './Header.tsx'
import SuccessMessage from '../../islands/SuccessMessage.tsx'
import { Footer } from '../../components/landing-page/Footer.tsx'
import { assert } from 'std/assert/assert.ts'
import { ErrorListener } from '../../islands/ErrorListener.tsx'
import { HomePageSidebar } from './Sidebar.tsx'
import { Maybe } from '../../types.ts'
import WarningMessage from '../../islands/WarningMessage.tsx'

export type LayoutProps =
  & {
    title: string
    url: URL
    children: ComponentChildren
  }
  & ({
    variant: 'home page'
    avatarUrl?: Maybe<string>
    route: string
  } | {
    variant: 'form'
    sidebar?: ComponentChild
  } | {
    variant: 'just logo' | 'landing page'
  })

function AppLayoutContents(
  { title, avatarUrl, variant, sidebar, route, children }: {
    title: string
    route: string
    avatarUrl?: Maybe<string>
    variant: 'home page' | 'form'
    sidebar?: ComponentChild
    children: ComponentChildren
  },
) {
  return (
    <>
      {sidebar || <HomePageSidebar route={route} />}
      <section className='md:pl-48'>
        <Header
          title={title}
          avatarUrl={avatarUrl}
          variant={variant}
        />
        {children}
      </section>
      {/* <BottomNav route={route} /> */}
    </>
  )
}

function JustLogoLayoutContents(
  { title, children }: {
    title: string
    children: ComponentChildren
  },
) {
  return (
    <>
      <Header
        title={title}
        variant='just logo'
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
  const warning = props.url.searchParams.get('warning')

  const flags = Number(!!success) + Number(!!error) + Number(!!warning)
  assert(flags <= 1, 'Cannot have more than one of success, error, or warning')

  return (
    <>
      <SuccessMessage
        message={success}
        className='fixed z-50 top-0 left-0 right-0 m-12'
      />
      <WarningMessage
        message={warning}
        className='fixed z-50 top-0 left-0 right-0 m-12'
      />
      <ErrorListener
        initialError={error}
      />
      {props.variant === 'landing page' && props.children}
      {props.variant === 'home page' && (
        <AppLayoutContents
          {...props}
          sidebar={<HomePageSidebar route={props.route} />}
        />
      )}
      {props.variant === 'form' && (
        <AppLayoutContents route={props.url.pathname} {...props} />
      )}
      {props.variant === 'just logo' && <JustLogoLayoutContents {...props} />}
    </>
  )
}
