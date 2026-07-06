import { CarePlanGroup, MedicineGroupWithPermissions, TaskGroupWithPermissions } from '../types.ts'

function dueToKey(due_to: Array<{ id: string }>): string {
  return due_to.map((record) => record.id).toSorted().join('-')
}

// Recommended medicines join the care-plan card whose due_to records match
// theirs exactly; medicines due to records with no matching task group get a
// card of their own.
export function buildCarePlanGroups(
  task_groups: TaskGroupWithPermissions[],
  medicine_groups: MedicineGroupWithPermissions[],
): CarePlanGroup[] {
  const groups: CarePlanGroup[] = task_groups.map((group) => ({ ...group, medicines: [] }))
  const by_key = new Map(groups.map((group) => [dueToKey(group.due_to), group]))
  for (const medicine_group of medicine_groups) {
    const key = dueToKey(medicine_group.due_to)
    const existing = by_key.get(key)
    if (existing) {
      existing.medicines.push(medicine_group)
      continue
    }
    const group: CarePlanGroup = { due_to: medicine_group.due_to, tasks: [], medicines: [medicine_group] }
    groups.push(group)
    by_key.set(key, group)
  }
  return groups
}
