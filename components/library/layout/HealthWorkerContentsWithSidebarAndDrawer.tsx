import { ComponentChild, ComponentChildren } from 'preact'
import { Header } from '../Header.tsx'
import { AlertListener } from '../../../islands/alert/AlertListener.tsx'
import { Notifications } from '../../../islands/Notifications.tsx'
import { SIDE_PANEL_HOST_CLASS, SIDE_PANEL_HOST_ID } from './side_panels.ts'

export type HealthWorkerContentsWithSidebarAndDrawerProps<T> = {
  title: string
  sidebar: ComponentChild
  drawer?: ComponentChild
  // Panels rendered in the column left of the drawer from the start, alongside those portalled into it
  side_panels?: ComponentChildren
  children: ComponentChildren
  url: URL
}

export default function HealthWorkerContentsWithSidebarAndDrawer<T>(
  {
    title,
    sidebar,
    drawer,
    side_panels,
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
      {/* The column the floating side panels portal into. See ./side_panels.ts */}
      {drawer && <div id={SIDE_PANEL_HOST_ID} className={SIDE_PANEL_HOST_CLASS}>{side_panels}</div>}
      <Notifications />
    </div>
  )
}
