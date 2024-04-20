import { ComponentChild, ComponentChildren } from 'preact'
import { Header } from './Header.tsx'
import { Footer } from '../../components/landing-page/Footer.tsx'
import { assert } from 'std/assert/assert.ts'
import { ErrorListener } from '../../islands/ErrorListener.tsx'
import { HomePageSidebar } from './Sidebar.tsx'
import { EmployedHealthWorker, Maybe } from '../../types.ts'
import SuccessMessage from '../../islands/SuccessMessage.tsx'
import WarningMessage from '../../islands/WarningMessage.tsx'
import * as notifications from '../../shared/notifications.ts'
import { RenderedNotification } from '../../types.ts'

export type LayoutProps =
  & {
    title: string
    url: URL
    children: ComponentChildren
  }
  & ({
    variant: 'home page'
    route: string
    health_worker: EmployedHealthWorker
    params?: Record<string, string>
  } | {
    variant: 'form'
    sidebar: ComponentChild
  } | {
    variant: 'just logo' | 'landing page'
  })

function AppLayoutContents(
  { title, avatarUrl, notifications, variant, sidebar, children }: {
    title: string
    avatarUrl?: Maybe<string>
    notifications?: RenderedNotification[]
    variant: 'home page' | 'form'
    sidebar: ComponentChild
    children: ComponentChildren
  },
) {
  return (
    <>
      {sidebar}
      <section className='md:pl-48'>
        <Header
          title={title}
          variant={variant}
          avatarUrl={avatarUrl}
          notifications={notifications}
        />
        <div className='p-4'>
          {children}
        </div>
      </section>
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
          avatarUrl={props.health_worker.avatar_url}
          notifications={notifications.ofEmployedHealthWorker(
            props.health_worker,
          )}
          sidebar={
            <HomePageSidebar
              route={props.route}
              params={props.params && ('organization_id' in props.params)
                ? props.params
                : {
                  ...props.params,
                  organization_id: props.health_worker.default_organization_id
                    .toString(),
                }}
              urlSearchParams={props.url.searchParams}
            />
          }
        />
      )}
      {props.variant === 'form' && <AppLayoutContents {...props} />}
      {props.variant === 'just logo' && <JustLogoLayoutContents {...props} />}
    </>
  )
}
