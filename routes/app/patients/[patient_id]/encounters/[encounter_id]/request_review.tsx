import {
  completeStep,
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import { TabProps, Tabs } from '../../../../../../components/library/Tabs.tsx'
import hrefFromCtx from '../../../../../../util/hrefFromCtx.ts'
import { assertOrRedirect } from '../../../../../../util/assertOr.ts'
import * as doctor_reviews from '../../../../../../db/models/doctor_reviews.ts'
import * as events from '../../../../../../db/models/events.ts'
import { OrganizationView } from '../../../../../../islands/request-review/OrganizationView.tsx'
import { promiseProps } from '../../../../../../util/promiseProps.ts'
import { parseRequest } from '../../../../../../util/parseForm.ts'
import z from 'zod'
import redirect from '../../../../../../util/redirect.ts'

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

const ReviewRequestSchema = z.object({
  organization_id: z.string().uuid().optional(),
  doctor_id: z.string().uuid().optional(),
  requester_notes: z.string().optional(),
}).refine(
  (data) => data.organization_id || data.doctor_id,
  {
    message: 'Must request a review from a doctor or an organization',
    path: ['organization_id'],
  },
)
  .refine(
    (data) => !!data.organization_id === !data.doctor_id,
    {
      message:
        'Must request a review from a doctor or an organization, but not both',
      path: ['organization_id'],
    },
  )

const PostSchema = z.object({
  review_request: ReviewRequestSchema.optional(),
})

export const handler = {
  async POST(req: Request, ctx: EncounterContext) {
    const { trx, encounter, encounter_provider, patient } = ctx.state
    const { completing_step, made_request } = await promiseProps({
      completing_step: completeStep(ctx),
      made_request: parseRequest(
        ctx.state.trx,
        req,
        PostSchema.parse,
      ).then(async (body) => {
        if (!body.review_request) return false
        const review_request = await doctor_reviews.upsertRequest(trx, {
          ...body.review_request,
          requested_by: encounter_provider.patient_encounter_provider_id,
          patient_id: encounter.patient_id,
          encounter_id: encounter.encounter_id,
        })

        await events.insert(trx, {
          type: 'ReviewRequested',
          data: {
            review_request_id: review_request.id,
          },
        })

        return true
      }),
    })

    // TODO: distinguish between Async and sync
    if (made_request) {
      const success = encodeURIComponent(
        `You have submitted a case review request for ${patient.name}. Please have them wait to be seen.`,
      )
      return redirect(
        `/app/organizations/${encounter_provider.organization_id}/waiting_room?just_encountered_id=${encounter.encounter_id}&success=${success}`,
      )
    }

    return completing_step
  },
}

// TODO support initial search
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
      <OrganizationView
        current_url={ctx.url.toString()}
        search_url={organization_search_url}
        organizations={[]}
        concerning_patient={ctx.state.patient}
      />
    </>
  )
}

export default EncounterPage(RequestReviewPage)
