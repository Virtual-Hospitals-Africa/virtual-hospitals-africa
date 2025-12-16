import entries from '../util/entries.ts'

export type TaskPriority = 'Emergency' | 'Very urgent' | 'Urgent'

export type AdditionalTask = {
  key: string
  label: string
  description?: string
}

export type TriggeredTaskGroup = {
  trigger_s_expression: string
  trigger_label: string
  priority: TaskPriority
  tasks: AdditionalTask[]
  handover_required?: boolean
  handover_label?: string
}

export type KeyedTriggeredTaskGroup = TriggeredTaskGroup & {
  key: string
}

/**
 * Additional tasks that are triggered based on clinical findings during triage.
 * Similar to warning signs, these use S-expressions to match patient conditions.
 *
 * Structure:
 * - Each key represents a triggering condition
 * - trigger_s_expression: S-expression that activates this task group
 * - trigger_label: Display label for why these tasks are triggered
 * - priority: Urgency level (Emergency, Very urgent, Urgent)
 * - tasks: List of checkbox tasks to complete
 * - handover_required: Whether this condition requires handover to SHCP
 */
export const ADDITIONAL_TASK_GROUPS: Record<string, TriggeredTaskGroup> = {
  // Low blood glucose - requires immediate action and handover
  'low_glucose': {
    // TODO: Add proper S-expression for glucose < 3 mmol/L measurement
    // For now using a placeholder that checks for hypoglycemia finding
    'trigger_s_expression': '(finding 404684003 (qualifier 302866003))', // 302866003 = Hypoglycemia
    'trigger_label': 'Glucose below 3 mmol/L',
    'priority': 'Emergency',
    'tasks': [
      {
        key: 'give_food',
        label: 'Give patient something to eat',
        description: 'Provide quick-acting glucose source',
      },
      {
        key: 'move_to_resuscitation',
        label: 'Move patient to resuscitation',
      },
    ],
    'handover_required': true,
    'handover_label': 'Handover to SHCP',
  },

  // Severe dehydration
  'severe_dehydration': {
    'trigger_s_expression': '(finding 404684003 (qualifier 34095006))', // 34095006 = Dehydration
    'trigger_label': 'Severe dehydration',
    'priority': 'Very urgent',
    'tasks': [
      {
        key: 'start_iv_fluids',
        label: 'Start IV fluid resuscitation',
      },
      {
        key: 'monitor_urine_output',
        label: 'Monitor urine output',
      },
    ],
    'handover_required': false,
  },

  // High fever in child
  'high_fever_child': {
    'trigger_s_expression':
      '(finding 404684003 (qualifier 386661006 (qualifier 272519000)))', // High fever, severe
    'trigger_label': 'High fever (>39°C)',
    'priority': 'Urgent',
    'tasks': [
      {
        key: 'give_paracetamol',
        label: 'Administer paracetamol',
      },
      {
        key: 'remove_clothing',
        label: 'Remove excess clothing',
      },
      {
        key: 'tepid_sponging',
        label: 'Tepid sponging if temperature >40°C',
      },
    ],
    'handover_required': false,
  },

  // Respiratory distress
  'respiratory_distress': {
    'trigger_s_expression': '(finding 404684003 (qualifier 271825005))', // 271825005 = Respiratory distress
    'trigger_label': 'Respiratory distress',
    'priority': 'Emergency',
    'tasks': [
      {
        key: 'position_upright',
        label: 'Position patient upright',
      },
      {
        key: 'give_oxygen',
        label: 'Administer oxygen',
      },
      {
        key: 'prepare_nebulizer',
        label: 'Prepare nebulizer if wheezing',
      },
    ],
    'handover_required': true,
    'handover_label': 'Handover to SHCP',
  },
}

export const KEYED_ADDITIONAL_TASK_GROUPS: KeyedTriggeredTaskGroup[] = entries(
  ADDITIONAL_TASK_GROUPS,
)
  .map(([key, group]) => ({
    key,
    ...group,
  }))
