import { PatientPage } from '../_middleware.tsx'

export default PatientPage(
  'Patient Information > General',
  function VisitsPage(_req, _ctx) {
    return <h1>Hello Patient general</h1>
  },
)
