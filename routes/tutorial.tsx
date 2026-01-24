import JustLogoLayout from '../components/library/JustLogoLayout.tsx'
import { TriageTutorial } from '../islands/TriageTutorial.tsx'
import randomDemographics from '../mocks/randomDemographics.ts'

export const config = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
}

export default function TutorialPage(
  _req: Request,
  ctx: { url: URL },
) {
  const patient = randomDemographics('ZA', 'female')

  return (
    <JustLogoLayout url={ctx.url} title='Virtual Hospitals Africa - Tutorial'>
      <TriageTutorial patient={patient} />
    </JustLogoLayout>
  )
}
