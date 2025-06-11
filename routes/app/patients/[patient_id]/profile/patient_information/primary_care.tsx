import { PatientPage } from '../_middleware.tsx'

export default PatientPage(
  'Patient Information > Primary Care',
  function VisitsPage(_req, _ctx) {
    return <h1>Hello Patient Primary Care</h1>
  },
)
