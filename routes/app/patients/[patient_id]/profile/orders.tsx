import { PatientPage } from './_middleware.tsx'

export default PatientPage(
  'Summary',
  function SummaryPage(_req, _ctx) {
    return <h1>Hello from orders</h1>
  },
)
