import { Context } from 'fresh'
import { ConsultationTutorial } from '../islands/ConsultationTutorial.tsx'
import { CONSULTATION_EMPLOYEE, CONSULTATION_PATIENT } from '../shared/consultation-tutorial/mock-data.ts'

export default function ConsultationTutorialPage(ctx: Context<unknown>) {
  return (
    <ConsultationTutorial
      url={ctx.url}
      route={ctx.route!}
      patient={CONSULTATION_PATIENT}
      employee={CONSULTATION_EMPLOYEE}
    />
  )
}
