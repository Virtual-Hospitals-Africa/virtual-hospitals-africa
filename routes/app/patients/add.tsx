import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  Patient,
} from '../../../types.ts'
import { assert } from 'std/testing/asserts.ts'
import * as patients from '../../../db/models/patients.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import * as media from '../../../db/models/media.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'
import { useAddPatientSteps } from '../../../components/patients/add/Steps.tsx'
import PatientPersonalForm from '../../../components/patients/add/PersonalForm.tsx'
import { parseRequest } from '../../../util/parseForm.ts'
import { isObject } from 'https://deno.land/x/importmap@0.2.1/_util.ts'
import compact from '../../../util/compact.ts'
import pick from '../../../util/pick.ts'

type AddPatientProps = {
  healthWorker: HealthWorker
  patient: Partial<Patient>
}

type HasNames = {
  first_name: string
  last_name: string
  middle_names?: string
}

function hasNames(patient: unknown): patient is HasNames {
  return isObject(patient) && !!patient.first_name && !!patient.last_name
}

const pickDemographics = pick([
  'phone_number',
  'gender',
  'date_of_birth',
  'national_id_number',
  'avatar_url',
  'file_type'
])

export const handler: LoggedInHealthWorkerHandler<AddPatientProps> = {
  GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))
    return ctx.render({ healthWorker, patient: {} })
  },
  // TODO: support steps of the form other than personal
  async POST(req, ctx) {
    const patientData = await parseRequest(req, {}, hasNames, 'avatar_url')

    const patient = {
      ...pickDemographics(patientData),
      name: compact([
        patientData.first_name,
        patientData.middle_names,
        patientData.last_name,
      ]).join(' '),
    }

    let mediaId: number | undefined

    if (patient.avatar_url) {
      const binaryData = await Deno.readFile(patient.avatar_url)
      const { id } = await media.insert(ctx.state.trx, {
        binary_data: binaryData,
        mime_type: patient.file_type,
        file_name: patientData.first_name,
      })
      mediaId = id
    }

    delete patient.avatar_url
    delete patient.file_type

    assert(patients.hasDemographicInfo(patient))
    await patients.upsert(ctx.state.trx, {
      ...patient,
      avatar_media_id: mediaId,
      // TODO separate patient's whatsapp conversation_state from patients table
      conversation_state: 'initial_message',
    })
    return redirect('/app/patients')
  },
}

export default function AddPatient(
  props: PageProps<AddPatientProps>,
) {
  const { steps, currentStep } = useAddPatientSteps(props)

  return (
    <Layout
      title='Add Patient'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        {steps}
        <form
          method='POST'
          className='w-full mt-4'
          encType='multipart/form-data'
        >
          {currentStep === 'personal' && <PatientPersonalForm />}
          {currentStep === 'address' && <div>TODO address form</div>}
          {currentStep === 'history' && <div>TODO history form</div>}
          {currentStep === 'allergies' && <div>TODO allergies form</div>}
          {currentStep === 'age_related_questions' && <div>TODO age form</div>}
        </form>
      </Container>
    </Layout>
  )
}
