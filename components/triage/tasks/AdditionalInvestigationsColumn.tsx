export default function AdditionalTasks({
  organization_id,
  evaluation_ids,
  task_groups,
}: {
  organization_id: string
  evaluation_ids: string[]
  task_groups: TaskGroup[]
}) {
  const at_least_one_soliticing_finding_task = all_tasks.some(negate(isLink))

  return (
    <div id='additional-investigations-column' class='flex flex-col gap-3.5 pb-4 pt-2 w-full max-w-3xl'>
      <HiddenInput
        name='evaluation_ids'
        value={evaluation_ids}
      />
      <SectionHeader className='w-full xl:w-60'>
        Additional Investigations
      </SectionHeader>
      {task_groups.map((group, index) => (
        <TaskGroupCard
          key={index}
          group={group}
          organization_id={organization_id}
        />
      ))}
    </div>
  )
}
