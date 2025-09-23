import { PatientProfilePage } from './_middleware.tsx'

export default PatientProfilePage(
  'Summary',
  function SummaryPage(_req, _ctx) {
    return <h1>Hello from orders</h1>
  },
)
