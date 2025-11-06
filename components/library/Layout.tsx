import { ComponentChild, ComponentChildren } from 'preact'
import { Header } from './Header.tsx'
import { SimpleFooter } from '../../components/landing-page/Footer.tsx'
import { assert } from 'std/assert/assert.ts'
import { AlertListener } from '../../islands/AlertListener.tsx'
import {
  HealthWorkerHomePageSidebar,
  RegulatorHomePageSidebar,
} from './Sidebar.tsx'
import { EmployedHealthWorker, Maybe } from '../../types.ts'
import { RenderedNotification } from '../../types.ts'
import { Alert } from '../../islands/AlertMessage.tsx'

export type LayoutProps =
  & {
    title: string
    url: URL
    children: ComponentChildren
    drawer?: ComponentChild
  }
  & (
    | {
      variant: 'health worker home page'
      route: string
      health_worker: EmployedHealthWorker
      notifications: RenderedNotification[]
      params?: Record<string, string>
    }
    | {
      variant: 'regulator home page'
      route: string
      regulator: { id: string }
      params?: Record<string, string>
    }
    | {
      variant: 'form'
      sidebar: ComponentChild
    }
    | {
      variant: 'just logo' | 'landing page' | 'empty'
    }
  )

function AppLayoutContents({
  title,
  avatarUrl,
  notifications,
  variant,
  sidebar,
  drawer,
  children,
}: {
  title: string
  avatarUrl?: Maybe<string>
  notifications?: RenderedNotification[]
  variant: 'home page' | 'form'
  sidebar: ComponentChild
  drawer?: ComponentChild
  children: ComponentChildren
}) {
  return (
    <>
      {sidebar}
      <div className='flex'>
        <section className='flex-1 md:pl-48'>
          <Header
            title={title}
            variant={variant}
            avatarUrl={avatarUrl}
            notifications={notifications}
          />
          <div className='pl-6'>{children}</div>
        </section>
        {drawer && (
          <div className='h-screen w-[400px] border-l border-gray-200'>
            {drawer}
          </div>
        )}
      </div>
    </>
  )
}

function JustLogoLayoutContents({
  title,
  children,
}: {
  title: string
  children: ComponentChildren
}) {
  return (
    <>
      <Header title={title} variant='just logo' />
      <section className='flex flex-col justify-between flex-grow min-h-full p-6 align-center'>
        {children}
      </section>
      <SimpleFooter />
    </>
  )
}

function initialAlert(url: URL): Alert | null {
  const error = url.searchParams.get('error')
  const warning = url.searchParams.get('warning')
  const success = url.searchParams.get('success')

  const flags = Number(!!error) + Number(!!warning) + Number(!!success)
  assert(flags <= 1, 'Cannot have more than one of success, error, or warning')
  if (error) {
    return { message: error, level: 'error' }
  }
  if (warning) {
    return { message: warning, level: 'warning' }
  }
  if (success) {
    return { message: success, level: 'success' }
  }
  return null
}

export default function Layout(props: LayoutProps) {
  return (
    <>
      <AlertListener initial_alert={initialAlert(props.url)} />
      {props.variant === 'landing page' && props.children}
      {(props.variant === 'health worker home page' ||
        props.variant === 'regulator home page') && (
        <AppLayoutContents
          {...props}
          variant='home page'
          avatarUrl={props.variant === 'health worker home page'
            ? props.health_worker.avatar_url
            : ''}
          notifications={props.variant === 'health worker home page'
            ? props.notifications
            : []}
          sidebar={props.variant === 'health worker home page'
            ? (
              <HealthWorkerHomePageSidebar
                route={props.route}
                params={props.params && 'organization_id' in props.params
                  ? props.params
                  : {
                    ...props.params,
                    organization_id: props.health_worker.default_organization_id
                      .toString(),
                  }}
                urlSearchParams={props.url.searchParams}
              />
            )
            : (
              <RegulatorHomePageSidebar
                route={props.route}
                params={props.params || {}}
                urlSearchParams={props.url.searchParams}
              />
            )}
        />
      )}
      {props.variant === 'form' && <AppLayoutContents {...props} />}
      {props.variant === 'just logo' && <JustLogoLayoutContents {...props} />}
    </>
  )
}
