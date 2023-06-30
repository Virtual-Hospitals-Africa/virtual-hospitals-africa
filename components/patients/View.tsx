import { Patient, ReturnedSqlRow } from '../../types.ts'
import { Container } from '../library/Container.tsx'
import PatientsEmptyState from './EmptyState.tsx'
import PatientsTable from './Table.tsx'

export default function PatientsView(
  { patients }: { patients: ReturnedSqlRow<Patient & { name: string }>[] },
) {
  return (
    <Container size='lg'>
      {patients.length
        ? <PatientsTable patients={patients} />
        : <PatientsEmptyState />}
    </Container>
  )
}
