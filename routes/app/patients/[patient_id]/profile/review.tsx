import { PatientPage } from './_middleware.tsx'

export default PatientPage(
  'Review',
  function ReviewPage(_req, _ctx) {
    return <h1>Hello from review</h1>
  },
)
