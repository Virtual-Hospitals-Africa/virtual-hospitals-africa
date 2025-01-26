import { Person } from '../../components/library/Person.tsx'

export function CareTeamSection({ care_team }: {
  // deno-lint-ignore no-explicit-any
  care_team: any[]
}) {
  console.log('care team', care_team)
  return (
    <div>
      {care_team.map((health_worker) => <Person person={health_worker} />)}
    </div>
  )
}
