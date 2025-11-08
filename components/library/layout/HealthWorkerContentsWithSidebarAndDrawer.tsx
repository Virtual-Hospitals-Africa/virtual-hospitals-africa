import { ComponentChild, ComponentChildren } from 'preact'
import { Header } from '../Header.tsx'
import { LoggedInHealthWorkerContext } from '../../../types.ts'

export type HealthWorkerContentsWithSidebarAndDrawerProps<T> = {
  ctx: LoggedInHealthWorkerContext<T>
  title: string
  sidebar: ComponentChild
  drawer?: ComponentChild
  children: ComponentChildren
}

export default function HealthWorkerContentsWithSidebarAndDrawer<T>(
  {
    ctx,
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
        <section className='flex flex-row flex-1 md:pl-48'>
          <Header
            title={title}
            variant='home page'
            avatar_url={ctx.state.health_worker.avatar_url}
            notifications={[]}
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
