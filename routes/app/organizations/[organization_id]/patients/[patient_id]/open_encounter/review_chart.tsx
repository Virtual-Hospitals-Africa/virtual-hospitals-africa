import { z } from 'zod'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { HealthWorkerHomePage } from '../../../../../_middleware.tsx'
import type { OpenEncounterContext } from '../../../../../../../types.ts'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import { this_visit_findings } from '../../../../../../../db/models/this_visit_findings.ts'
import { diagnoses } from '../../../../../../../db/models/diagnoses.ts'
import { referrals } from '../../../../../../../db/models/referrals.ts'
import { assertOr403 } from '../../../../../../../util/assertOr.ts'
import SectionHeader from '../../../../../../../components/library/typography/SectionHeader.tsx'
import { DrawerThisVisit } from '../../../../../../../components/drawer-v4/ThisVisit.tsx'
import { Button } from '../../../../../../../components/library/Button.tsx'
import PriorityBadge from '../../../../../../../components/PriorityBadge.tsx'
import first from '../../../../../../../util/first.ts'

const ReviewChartSchema = z.object({})

export const handler = postHandler(
  ReviewChartSchema,
  (ctx: OpenEncounterContext) =>
    redirect(`${ctx.state.open_encounter_pathname}/review_chart`),
)

export default HealthWorkerHomePage(
  'Patient Chart',
  async function ReviewChartPage(ctx: OpenEncounterContext) {
    const {
      trx,
      health_worker,
      encounter,
      organization_id,
      patient_encounter_id,
    } = ctx.state

    const referral = first(
      await referrals.findAll(trx, {
        patient_encounter_id,
        originator_or_notified_health_worker_id: health_worker.id,
      }),
    )
    assertOr403(referral, 'You are not authorized to review this chart')

    const { findings, this_visit_diagnoses } = await promiseProps({
      findings: this_visit_findings.get(trx, {
        health_worker_id: health_worker.id,
        encounter,
        current_workflow_state: null,
      }),
      this_visit_diagnoses: diagnoses.get(trx, {
        encounter,
        health_worker_id: health_worker.id,
      }),
    })

    const { patient, priority, notes } = encounter

    return (
      <div className='py-6 max-w-4xl mx-auto flex flex-col gap-6'>
        <div className='flex items-start justify-between gap-4'>
          <p className='text-sm text-gray-600 max-w-2xl'>
            Review this patient's current encounter before responding to the
            referral.
          </p>
          <Button
            href='/app/notifications'
            variant='secondary'
            size='sm'
            className='shrink-0'
          >
            Back
          </Button>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <h2 className='text-xl font-semibold text-gray-900'>
                {patient.name || '[Unnamed Patient]'}
              </h2>
              {patient.description && (
                <p className='mt-1 text-sm text-gray-500'>
                  {patient.description}
                </p>
              )}
            </div>
            <div id='patient-drawer-priority' className='shrink-0'>
              <PriorityBadge priority={priority?.name ?? null} />
            </div>
          </div>
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <DrawerThisVisit
            id='review-chart-this-visit'
            organization_id={organization_id}
            this_visit_findings={findings}
            this_visit_diagnoses={this_visit_diagnoses}
          />
        </div>

        {notes && (
          <div className='bg-white shadow rounded-lg p-6 flex flex-col gap-2'>
            <SectionHeader>Notes</SectionHeader>
            <p className='text-sm text-gray-700'>{notes}</p>
          </div>
        )}
      </div>
    )
  },
)
