import { PatientProfilePage } from './_middleware.tsx'

export default PatientProfilePage(
  'Visits',
  function VisitsPage(_req, _ctx) {
    return <h1>Hello from visits</h1>
  },
)
