import { Button } from '../../library/Button.tsx'
import { Tabs } from '../../library/Tabs.tsx'
import { ArrowLeftIcon } from '../../library/icons/heroicons/outline.tsx'
import { DrawerHistory } from '../../drawer-v4/History.tsx'
import { DrawerThisVisit } from '../../drawer-v4/ThisVisit.tsx'
import { ReferralCard } from './ReferralCard.tsx'
import type { Workflow } from '../../../db.d.ts'
import { type Priority, priorityColors } from '../../../shared/priorities.ts'
import type {
  RenderedEmployee,
  RenderedEvaluationRelativeToHealthWorker,
  RenderedPatient,
  RenderedPatientHistory,
  RenderedSidebarWorkflow,
} from '../../../types.ts'
import capitalize from '../../../util/capitalize.ts'
import cls from '../../../util/cls.ts'

export type PatientCaseTab = 'overview' | 'this_visit' | 'history'

const TABS: { id: PatientCaseTab; label: string }[] = [
  { id: 'overview', label: 'overview' },
  { id: 'this_visit', label: 'this_visit' },
  { id: 'history', label: 'history' },
]

export function isPatientCaseTab(value: string | null): value is PatientCaseTab {
  return value === 'overview' || value === 'this_visit' || value === 'history'
}

function ageLabel(patient: RenderedPatient): string | null {
  if (patient.age_years != null) return `(${patient.age_years}yrs)`
  if (patient.age_display) return `(${patient.age_display})`
  return null
}

function tabHref(case_href: string, tab: PatientCaseTab): string {
  if (tab === 'overview') return case_href
  return `${case_href}?tab=${tab}`
}

export function PatientCase(
  {
    patient,
    priority_name,
    back_href,
    case_href,
    active_tab,
    organization_id,
    current_workflow,
    this_visit_findings,
    this_visit_diagnoses,
    history,
    referring_employee,
    referring_employee_online,
  }: {
    patient: RenderedPatient
    priority_name: Priority | null
    back_href: string
    case_href: string
    active_tab: PatientCaseTab
    organization_id: string
    current_workflow: Workflow | null
    this_visit_findings: RenderedSidebarWorkflow[]
    this_visit_diagnoses: RenderedEvaluationRelativeToHealthWorker[]
    history: RenderedPatientHistory
    referring_employee: RenderedEmployee | null
    referring_employee_online: boolean
  },
) {
  const priority_color = priorityColors(priority_name)
  const age_label = ageLabel(patient)
  const visit_workflow = current_workflow ?? 'registration'

  return (
    <div id='patient-case-view' className='fixed inset-0 z-20 flex flex-col bg-gray-100'>
      <header className='grid grid-cols-[2.25rem_1fr_2.25rem] items-center px-4 pb-2 pt-4'>
        <a
          id='patient-case-back'
          href={back_href}
          aria-label='Back'
          className='flex size-9 items-center justify-center'
        >
          <ArrowLeftIcon className='size-6 text-indigo-700' />
        </a>
        <h1 className='min-w-0 text-center text-xl font-semibold leading-7 text-gray-800'>
          Patient Case View
        </h1>
      </header>

      <main id='patient-case-scroll' className='flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4'>
        <div className='flex flex-col'>
          <section
            id='patient-case-summary'
            className={cls(
              'px-4 pt-4',
              referring_employee ? 'rounded-t-lg pb-2.5' : 'rounded-lg pb-4',
              priority_color.bg,
            )}
          >
            <div className='flex items-start justify-between gap-3'>
              <p id='patient-case-name' className='min-w-0 text-base font-semibold leading-6 text-gray-800'>
                {patient.name ?? 'Unnamed patient'}
              </p>
              {priority_name && (
                <p id='patient-case-priority' className={cls('shrink-0 text-sm font-medium', priority_color.text)}>
                  {priority_name}
                </p>
              )}
            </div>
            <div className='mt-1 flex flex-wrap items-center gap-4 text-xs leading-4 text-gray-800'>
              {patient.sex && <p id='patient-case-sex'>{capitalize(patient.sex)}</p>}
              {(patient.dob_formatted || age_label) && (
                <p>
                  {patient.dob_formatted && <span id='patient-case-dob'>{patient.dob_formatted}</span>}
                  {patient.dob_formatted && age_label ? ' ' : null}
                  {age_label && <span id='patient-case-age'>{age_label}</span>}
                </p>
              )}
            </div>
          </section>
          {referring_employee && (
            <ReferralCard
              referring_employee={referring_employee}
              referring_employee_online={referring_employee_online}
            />
          )}
        </div>

        <div id='patient-case-tabs'>
          <Tabs
            navClassName='flex gap-4'
            tabs={TABS.map((tab) => ({
              tab: tab.label,
              href: tabHref(case_href, tab.id),
              active: tab.id === active_tab,
            }))}
          />
        </div>

        {active_tab === 'overview' && (
          <section id='patient-case-panel-overview' className='rounded-lg bg-white'>
            <DrawerHistory
              organization_id={organization_id}
              history={history}
              keys={['medications', 'pre_existing_conditions']}
              show_header={false}
            />
          </section>
        )}

        {active_tab === 'this_visit' && (
          <section id='patient-case-panel-this-visit' className='rounded-lg bg-white'>
            <DrawerThisVisit
              organization_id={organization_id}
              current_workflow={visit_workflow}
              this_visit_findings={this_visit_findings}
              this_visit_diagnoses={this_visit_diagnoses}
            />
          </section>
        )}

        {active_tab === 'history' && (
          <section id='patient-case-panel-history' className='rounded-lg bg-white'>
            <DrawerHistory organization_id={organization_id} history={history} />
          </section>
        )}
      </main>

      <footer className='flex shrink-0 flex-col gap-4 border-t border-gray-200 bg-white px-6 pb-6 pt-4 shadow-[0px_-5px_7.5px_rgba(0,0,0,0.08)]'>
        <Button id='patient-case-final-diagnosis' type='button' disabled className='w-full'>
          Make Final Diagnosis
        </Button>
        <div className='flex w-full gap-4'>
          <Button id='patient-case-order-test' type='button' variant='secondary' disabled className='flex-1'>
            Order Test
          </Button>
          <Button id='patient-case-call-nurse' type='button' variant='secondary' disabled className='flex-1'>
            Call Nurse
          </Button>
        </div>
      </footer>
    </div>
  )
}
