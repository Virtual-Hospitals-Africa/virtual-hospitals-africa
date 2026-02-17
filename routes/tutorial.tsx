import { Context } from 'fresh'
import { TriageTutorial } from '../islands/TriageTutorial.tsx'
import { TUTORIAL_EMPLOYEE, TUTORIAL_PATIENT } from '../shared/tutorial/mock-data.ts'

export default function TutorialPage(ctx: Context<unknown>) {
  return (
    <TriageTutorial
      url={ctx.url}
      route={ctx.route!}
      patient={TUTORIAL_PATIENT}
      employee={TUTORIAL_EMPLOYEE}
    />
  )
}
