
export const MESSAGE_TARGET_CATEGORIES = {
  regions: ['locality', 'administrative_area_level_1', 'administrative_area_level_2'],
  organizations: ['organization', 'organization_category'],
  health_workers: ['profession', 'employment'],
}

export type MessageTargetCategory = keyof typeof MESSAGE_TARGET_CATEGORIES