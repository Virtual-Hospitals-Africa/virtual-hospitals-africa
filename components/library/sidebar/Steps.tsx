import { ComponentChild } from 'preact'
import * as ProgressIcons from '../icons/progress.tsx'
import { prettyStepName } from '../../../shared/workflow.ts'
import { GenericSidebar } from './Generic.tsx'
import { DefaultTop } from './Top.tsx'

type StepsSidebarProps = {
  top?: ComponentChild
  url: URL
  route?: string | null
  params: Record<string, string>
  bottom?: ComponentChild
  nav_links: {
    step: string
    route: string
  }[]
  steps_completed: string[]
}

export function StepsSidebar(
  { top, bottom, nav_links, steps_completed, url, route, params }: StepsSidebarProps,
) {
  return (
    <GenericSidebar
      top={top || <DefaultTop url={url} />}
      bottom={bottom}
      route={route!}
      params={params}
      urlSearchParams={url.searchParams}
      nav_links={nav_links.map((link) => ({
        ...link,
        title: prettyStepName(link.step),
        Icon: steps_completed.includes(link.step) ? ProgressIcons.Check : ProgressIcons.Dot,
      }))}
    />
  )
}
