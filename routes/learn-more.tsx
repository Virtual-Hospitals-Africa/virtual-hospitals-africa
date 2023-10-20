import { EmployedHealthWorker, LoggedInHealthWorkerHandler } from '../types.ts'
import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import { FacilityAdmin, getFacilityAdmin } from '../db/models/employment.ts'
import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import { json } from '../util/responses.ts'
import { TextInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import FormButtons from '../components/library/form/buttons.tsx'
import Features from '../landing-page/components/Features.tsx'
import { Container } from '../components/library/Container.tsx'

export default function LearnMorePage(
  props: PageProps,
) {
  return (
    <Layout
      title='Learn More | Virtual Hospitals Africa'
      route={props.route}
      url={props.url}
      variant='just-logo'
    >
      <Container>
        <Features />
      </Container>
    </Layout>
  )
}
