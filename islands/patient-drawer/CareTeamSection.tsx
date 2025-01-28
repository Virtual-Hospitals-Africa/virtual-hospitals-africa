import { Person } from '../../components/library/Person.tsx'

export function CareTeamSection({ care_team }: {
  // deno-lint-ignore no-explicit-any
  care_team: any[]
}) {
  care_team.forEach(
    (health_worker) => console.log('health_worker', health_worker),
  )
  return (
    <div>
      {care_team.map((health_worker) => <Person person={health_worker} />)}
    </div>
  )
}
