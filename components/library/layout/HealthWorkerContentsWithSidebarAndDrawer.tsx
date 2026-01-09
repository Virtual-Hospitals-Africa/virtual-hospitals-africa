import { ComponentChild, ComponentChildren } from 'preact'
import { Header } from '../Header.tsx'
import { AlertListener } from '../../../islands/alert/AlertListener.tsx'

export type HealthWorkerContentsWithSidebarAndDrawerProps<T> = {
  title: string
  sidebar: ComponentChild
  drawer?: ComponentChild
  children: ComponentChildren
  url: URL
}

export default function HealthWorkerContentsWithSidebarAndDrawer<T>(
  {
    title,
    sidebar,
    drawer,
    children,
    url,
  }: HealthWorkerContentsWithSidebarAndDrawerProps<T>,
) {
  return (
    <div className='max-w-screen h-screen flex flex-row overflow-hidden'>
      <AlertListener initial_url={url} />
      {sidebar}
      <div className='flex flex-row flex-1 overflow-hidden'>
        <section className='flex flex-col flex-1 overflow-hidden'>
          <Header
            title={title}
            variant='home page'
          />
          <div className='flex-1 flex flex-col overflow-y-auto'>
            {children}
          </div>
        </section>
        {drawer}
      </div>
    </div>
  )
}
