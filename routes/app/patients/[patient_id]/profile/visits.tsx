import { PatientPage } from './_middleware.tsx'

export default PatientPage(
  'Visits',
  function VisitsPage(_req, _ctx) {
    return <h1>Hello from visits</h1>
  },
)
