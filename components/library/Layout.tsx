import { ComponentChild, ComponentChildren } from 'preact'
import { Header } from './Header.tsx'
import { SimpleFooter } from '../../components/landing-page/Footer.tsx'
import { assert } from 'std/assert/assert.ts'
import { ErrorListener } from '../../islands/ErrorListener.tsx'
import {
  PractitionerHomePageSidebar,
  RegulatorHomePageSidebar,
} from './Sidebar.tsx'
import { EmployedHealthWorker, Maybe } from '../../types.ts'
import SuccessMessage from '../../islands/SuccessMessage.tsx'
import WarningMessage from '../../islands/WarningMessage.tsx'
import { RenderedNotification } from '../../types.ts'

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
        <section className='md:pl-48 flex-1'>
          <Header
            title={title}
            variant={variant}
            avatarUrl={avatarUrl}
            notifications={notifications}
          />
          <div className='p-4'>{children}</div>
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
      <section className='min-h-full flex flex-col align-center justify-between flex-grow p-6'>
        {children}
      </section>
      <SimpleFooter />
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
        notDismissable={props.variant === 'empty'}
      />
      <WarningMessage
        message={warning}
        className='fixed z-50 top-0 left-0 right-0 m-12'
      />
      <ErrorListener initialError={error} />
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
              <PractitionerHomePageSidebar
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
