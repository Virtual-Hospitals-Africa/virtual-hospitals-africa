import { ComponentChild, ComponentChildren } from 'preact'
import { Header } from '../Header.tsx'

export type HealthWorkerContentsWithSidebarAndDrawerProps<T> = {
  title: string
  sidebar: ComponentChild
  drawer?: ComponentChild
  children: ComponentChildren
}

export default function HealthWorkerContentsWithSidebarAndDrawer<T>(
  {
    title,
    sidebar,
    drawer,
    children,
  }: HealthWorkerContentsWithSidebarAndDrawerProps<T>,
) {
  return (
    <div className='max-w-screen flex flex-col'>
      {sidebar}
      <div className='flex flex-row min-h-screen grow'>
        <section className='flex flex-col flex-1 md:pl-48'>
          <Header
            title={title}
            variant='home page'
          />
          <div className='pl-6 grow'>{children}</div>
        </section>
        {drawer && (
          <div className='h-full w-[400px] border-l border-gray-200'>
            {drawer}
          </div>
        )}
      </div>
    </div>
  )
}
