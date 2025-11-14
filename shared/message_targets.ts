import { MessageTargetType } from '../db.d.ts'
import { RenderedMessageTarget } from '../types.ts'
import { groupBy } from '../util/groupBy.ts'

export const MESSAGE_TARGET_CATEGORIES = {
  regions: [
    'locality' as const,
    'administrative_area_level_1' as const,
    'administrative_area_level_2' as const,
  ],
  organizations: ['organization' as const, 'organization_category' as const],
  health_workers: ['profession' as const, 'employee' as const],
}

export type MessageTargetCategory = keyof typeof MESSAGE_TARGET_CATEGORIES

const MESSAGE_TYPE_TO_CATEGORY = {
  locality: 'regions',
  administrative_area_level_1: 'regions',
  administrative_area_level_2: 'regions',
  organization: 'organizations',
  organization_category: 'organizations',
  profession: 'health_workers',
  employee: 'health_workers',
} satisfies Record<MessageTargetType, MessageTargetCategory>

export function groupByCategory(
  targets: RenderedMessageTarget[],
): Map<MessageTargetCategory, RenderedMessageTarget[]> {
  return groupBy(
    targets,
    (target) => MESSAGE_TYPE_TO_CATEGORY[target.target_type],
  )
}

export const BY_TARGET_UUID = new Set<string>([
  'organization',
  'employee',
])
