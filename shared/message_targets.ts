
export const MESSAGE_TARGET_CATEGORIES = {
  regions: ['locality' as const, 'administrative_area_level_1' as const, 'administrative_area_level_2' as const],
  organizations: ['organization' as const, 'organization_category' as const],
  health_workers: ['profession' as const, 'employee' as const],
}

export type MessageTargetCategory = keyof typeof MESSAGE_TARGET_CATEGORIES
