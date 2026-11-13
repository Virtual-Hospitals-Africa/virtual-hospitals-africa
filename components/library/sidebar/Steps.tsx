import { ComponentChild, JSX } from 'preact'
import { ScrollActiveTabIntoView } from '../../../islands/ScrollActiveTabIntoView.tsx'
import { matchActiveLink } from '../../../util/matchActiveLink.ts'
import { replaceParams } from '../../../util/replaceParams.ts'
import cls from '../../../util/cls.ts'
import { prettyStepName } from '../../../shared/workflow.ts'
import {
  ArchiveBoxIcon,
  ArrowRightCircleIcon,
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  BeakerIcon,
  BellAlertIcon,
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FlagIcon,
  HeartIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PhoneIcon,
  ScaleIcon,
  UserIcon,
  VideoCameraIcon,
} from '../icons/heroicons/outline.tsx'
import { MedicineIcon } from '../icons/Medicines.tsx'
import * as ProgressIcons from '../icons/progress.tsx'
import { GenericSidebar } from './Generic.tsx'
import { DefaultTop } from './Top.tsx'

type StepIcon = (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element

const STEP_ICONS: Record<string, StepIcon> = {
  additional_tasks_and_investigations: BeakerIcon,
  assign_priority: FlagIcon,
  await_orders: ClockIcon,
  brief_history: ClipboardDocumentListIcon,
  checkup: ClipboardDocumentListIcon,
  clinical_notes: PencilSquareIcon,
  close_visit: CheckBadgeIcon,
  confirm_details: DocumentCheckIcon,
  confirm_hand_over: ArrowsRightLeftIcon,
  contacts: PhoneIcon,
  diagnoses: DocumentMagnifyingGlassIcon,
  diagnosis: DocumentMagnifyingGlassIcon,
  dispense: ArchiveBoxIcon,
  emergency_reason: ExclamationCircleIcon,
  findings: MagnifyingGlassIcon,
  give_orders: ClipboardDocumentCheckIcon,
  height_and_weight: ScaleIcon,
  identify_patient: IdentificationIcon,
  invite_participants: VideoCameraIcon,
  measure_vitals: HeartIcon,
  monitor_patient: EyeIcon,
  notify_staff: BellAlertIcon,
  orders: ClipboardDocumentCheckIcon,
  personal: UserIcon,
  prescriptions: MedicineIcon,
  primary_care: BuildingOffice2Icon,
  referral: ArrowTopRightOnSquareIcon,
  request_review: ChatBubbleLeftRightIcon,
  revert: ArrowUturnLeftIcon,
  review_case: DocumentMagnifyingGlassIcon,
  route_patient: ArrowRightCircleIcon,
  terms_and_conditions: DocumentTextIcon,
  this_visit: ClipboardDocumentIcon,
  warning_signs: ExclamationTriangleIcon,
}

const DEFAULT_STEP_ICON = ClipboardDocumentIcon

type WorkflowNavLink = {
  step: string
  route: string
}

type StepsSidebarProps = {
  top?: ComponentChild
  url: URL
  route?: string | null
  params: Record<string, string>
  bottom?: ComponentChild
  nav_links: WorkflowNavLink[]
  steps_completed: string[]
}

function describeWorkflowSteps(nav_links: WorkflowNavLink[], steps_completed: string[]) {
  return nav_links.map((link) => ({
    ...link,
    title: prettyStepName(link.step),
    completed: steps_completed.includes(link.step),
  }))
}

function hrefForStep(route: string, params: Record<string, string>, url: URL) {
  const all_params = { ...params }
  url.searchParams.forEach((value, key) => {
    all_params[key] = value
  })
  return replaceParams(route, all_params)
}

export function StepsSidebar(
  { top, bottom, nav_links, steps_completed, url, route, params }: StepsSidebarProps,
) {
  return (
    <div className='hidden h-full md:block'>
      <GenericSidebar
        top={top || <DefaultTop url={url} />}
        bottom={bottom}
        route={route!}
        params={params}
        urlSearchParams={url.searchParams}
        nav_links={describeWorkflowSteps(nav_links, steps_completed).map((link) => ({
          ...link,
          Icon: link.completed ? ProgressIcons.Check : ProgressIcons.Dot,
        }))}
      />
    </div>
  )
}

export function WorkflowStepsMobileNav(
  { nav_links, steps_completed, url, route, params, compact = false }: StepsSidebarProps & { compact?: boolean },
) {
  const steps = describeWorkflowSteps(nav_links, steps_completed)
  const active_step = matchActiveLink(steps, route ?? '')
  return (
    <ScrollActiveTabIntoView
      key={active_step?.step}
      aria-label='Workflow steps'
      className={cls(
        'w-full min-w-0 shrink-0 md:hidden',
        compact ? 'mt-4 overflow-x-hidden bg-white' : 'overflow-x-auto border-b border-gray-200 bg-white',
      )}
    >
      <ul className={cls('flex w-full items-stretch', compact ? 'gap-1.5' : 'gap-x-1 px-0 py-2')}>
        {steps.map((link) => {
          const active = link === active_step
          const Icon = STEP_ICONS[link.step] ?? DEFAULT_STEP_ICON
          const label = link.title.replaceAll(' & ', '\u00A0& ')
          return (
            <li key={link.step} className={cls('flex flex-1', compact ? 'min-w-0' : 'min-w-min')}>
              <a
                href={hrefForStep(link.route, params, url)}
                aria-current={active ? 'page' : undefined}
                className={cls(
                  'group flex h-full w-full flex-col items-center text-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                  compact ? 'min-w-0 gap-1 pb-0.5 text-indigo-700' : 'min-w-min gap-1 px-0',
                  !compact && (active ? 'font-medium text-indigo-700' : 'text-gray-500 hover:text-gray-700'),
                  compact && (active ? 'opacity-100' : 'opacity-60'),
                )}
              >
                {link.completed && !active && !compact ? <ProgressIcons.Check active={active} className='size-5' /> : (
                  <Icon
                    className={cls(
                      'size-5',
                      compact && 'text-indigo-700',
                      !compact && active && 'text-indigo-600',
                      !compact && !active && 'text-gray-400',
                    )}
                    aria-hidden='true'
                  />
                )}
                {compact
                  ? (
                    <span className='text-[10px] font-bold leading-[12px]'>
                      {label.split(' ').map((line) => <span key={line} className='block'>{line}</span>)}
                    </span>
                  )
                  : (
                    // Keep "&" with the previous word so it wraps as "Height &" / "Weight".
                    <span className='text-[11px] leading-tight'>{label}</span>
                  )}
                {!compact && (
                  <span
                    aria-hidden='true'
                    className={cls('mt-auto h-1 w-full rounded-full', active ? 'bg-indigo-600' : 'bg-transparent')}
                  />
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </ScrollActiveTabIntoView>
  )
}
