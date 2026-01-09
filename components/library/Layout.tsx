import { ComponentChild, ComponentChildren } from 'preact'
import { Header } from './Header.tsx'
import { SimpleFooter } from '../../components/landing-page/Footer.tsx'
import { RegulatorHomePageSidebar } from './Sidebar.tsx'
import { Maybe, RenderedNotification } from '../../types.ts'
import { AlertListener } from '../../islands/alert/AlertListener.tsx'

export type LayoutProps =
  & {
    title: string
    url: URL
    children: ComponentChildren
    drawer?: ComponentChild
  }
  & (
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
    <div className='max-w-screen flex flex-col'>
      {sidebar}
      <div className='flex flex-row min-h-screen grow'>
        <section className='flex flex-row flex-1 md:pl-48'>
          <Header
            title={title}
            variant={variant}
            avatar_url={avatarUrl}
            notifications={notifications}
          />
          <div className='pl-6 grow'>{children}</div>
        </section>
        {drawer}
      </div>
    </div>
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
      <section className='flex flex-col justify-between grow min-h-full p-6 align-center'>
        {children}
      </section>
      <SimpleFooter />
    </>
  )
}

export default function Layout(props: LayoutProps) {
  return (
    <>
      <AlertListener initial_url={props.url} />
      {props.variant === 'landing page' && props.children}
      {(
        props.variant === 'regulator home page'
      ) && (
        <AppLayoutContents
          {...props}
          variant='home page'
          sidebar={
            <RegulatorHomePageSidebar
              route={props.route}
              params={props.params || {}}
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
