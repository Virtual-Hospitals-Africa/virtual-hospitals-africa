/**
 * TEWS (Triage Early Warning Score) Priority Levels
 * Used to determine patient urgency based on total TEWS score
 */
export const TEWS_PRIORITY_LEVELS = {
  emergency: {
    key: "emergency",
    label: "Emergency",
    min_score: 7,
    colors: { bg: "bg-error-bg", text: "text-error-text" },
  },
  very_urgent: {
    key: "very_urgent",
    label: "Very Urgent",
    min_score: 5,
    colors: { bg: "bg-accent-orange-bg", text: "text-accent-orange-text" },
  },
  urgent: {
    key: "urgent",
    label: "Urgent",
    min_score: 3,
    colors: { bg: "bg-warning-bg", text: "text-warning-text" },
  },
  routine: {
    key: "routine",
    label: "Routine",
    min_score: 0,
    colors: { bg: "bg-success-bg", text: "text-success-text" },
  },
  deceased: {
    key: "deceased",
    label: "Deceased",
    min_score: -1,
    colors: { bg: "bg-accent-blue-bg", text: "text-accent-blue-text" },
  },
} as const;

export type TEWSPriorityKey = keyof typeof TEWS_PRIORITY_LEVELS;
export type TEWSPriorityLevel = typeof TEWS_PRIORITY_LEVELS[TEWSPriorityKey];

/**
 * Determine priority level from TEWS score
 * Maps numeric score to priority category with visual styling
 */
export function getPriorityFromTEWSScore(score: number): TEWSPriorityLevel {
  if (score >= TEWS_PRIORITY_LEVELS.emergency.min_score) {
    return TEWS_PRIORITY_LEVELS.emergency;
  }
  if (score >= TEWS_PRIORITY_LEVELS.very_urgent.min_score) {
    return TEWS_PRIORITY_LEVELS.very_urgent;
  }
  if (score >= TEWS_PRIORITY_LEVELS.urgent.min_score) {
    return TEWS_PRIORITY_LEVELS.urgent;
  }
  return TEWS_PRIORITY_LEVELS.routine;
}

/**
 * Age category used for TEWS calculation
 * Determines which scoring rules to apply
 */
export type TEWSAgeCategory = "adult" | "older_child" | "younger_child";
