import {
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import { TabProps, Tabs } from '../../../../../../components/library/Tabs.tsx'
import hrefFromCtx from '../../../../../../util/hrefFromCtx.ts'
import { assertOrRedirect } from '../../../../../../util/assertOr.ts'
import { OrganizationView } from '../../../../../../islands/request-review/OrganizationView.tsx'

function searchByHref(
  ctx: EncounterContext,
  searchBy: string,
) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.set('searchBy', searchBy)
  })
}

function getView(ctx: EncounterContext) {
  const searchBy = ctx.url.searchParams.get('searchBy')
  const organization_href = searchByHref(ctx, 'organizations')
  assertOrRedirect(searchBy, organization_href)

  const tabs: TabProps[] = [
    {
      tab: 'organizations',
      href: searchByHref(ctx, 'organizations'),
      active: searchBy === 'organizations',
    },
    {
      tab: 'health professionals',
      href: searchByHref(ctx, 'professionals'),
      active: searchBy === 'professionals',
    },
  ]

  return { tabs }
}

export function RequestReviewPage(
  { ctx }: EncounterPageChildProps,
) {
  const organization_search_url = ctx.url.pathname.replace(
    '/request_review',
    '/nearest_organizations',
  )
  const show_tabs = false

  return (
    <>
      {show_tabs && <Tabs {...getView(ctx)} />}
      <OrganizationView search_url={organization_search_url} />
    </>
  )
}

export default EncounterPage(RequestReviewPage)
