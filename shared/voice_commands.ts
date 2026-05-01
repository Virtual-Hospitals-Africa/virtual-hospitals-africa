export type BloodPressureReading = readonly [spoken: string, systolic: number, diastolic: number]

export const COMMON_BLOOD_PRESSURE_READINGS: readonly BloodPressureReading[] = [
  ['one twenty over eighty', 120, 80],
  ['one twenty over eighty five', 120, 85],
  ['one thirty over eighty', 130, 80],
  ['one thirty over eighty five', 130, 85],
  ['one thirty over ninety', 130, 90],
  ['one forty over ninety', 140, 90],
  ['one forty over ninety five', 140, 95],
  ['one fifty over ninety', 150, 90],
  ['one fifty over ninety five', 150, 95],
  ['one fifty over one hundred', 150, 100],
  ['one sixty over ninety', 160, 90],
  ['one sixty over ninety five', 160, 95],
  ['one sixty over one hundred', 160, 100],
  ['one seventy over ninety', 170, 90],
  ['one seventy over ninety five', 170, 95],
  ['one seventy over one hundred', 170, 100],
  ['one eighty over ninety', 180, 90],
  ['one eighty over ninety five', 180, 95],
  ['one eighty over one hundred', 180, 100],
  ['one eighty over one hundred ten', 180, 110],
  ['one ten over seventy', 110, 70],
  ['one ten over seventy five', 110, 75],
  ['one hundred over sixty', 100, 60],
  ['one hundred over sixty five', 100, 65],
  ['one hundred over seventy', 100, 70],
  ['ninety over sixty', 90, 60],
  ['ninety over sixty five', 90, 65],
  ['eighty over fifty', 80, 50],
  ['eighty over fifty five', 80, 55],
  ['seventy over forty', 70, 40],
  ['seventy over forty five', 70, 45],
  ['sixty over forty', 60, 40],
] as const

export const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
}

export function parseSpokenNumber(s: string): number | null {
  const cleaned = s.trim().replace(/-/g, ' ').replace(/\band\b/g, ' ')
  if (!cleaned) return null

  const parts = cleaned.split(/\s+/)
  let value = 0
  let current = 0
  let decimal = 0
  let decimalPlace = 0
  let isDecimal = false

  for (const part of parts) {
    if (part === 'point') {
      isDecimal = true
      continue
    }

    const word_value = NUMBER_WORDS[part]
    if (word_value === undefined) return null

    if (isDecimal) {
      decimal = decimal * 10 + word_value
      decimalPlace += 1
      continue
    }

    if (word_value === 100) {
      current = Math.max(1, current) * 100
    } else if (word_value === 1000) {
      current = Math.max(1, current) * 1000
      value += current
      current = 0
    } else {
      current += word_value
    }
  }

  const result = value + current
  if (decimalPlace > 0) {
    return Number(`${result}.${String(decimal).padStart(decimalPlace, '0')}`)
  }

  return result
}

export function parseNumber(s: string): number | null {
  const cleaned = s.trim().replace(/\s+/g, '')
  const n = Number(cleaned)
  if (Number.isFinite(n)) return n

  return parseSpokenNumber(s)
}

// Vital measurement aliases for voice recognition
export const VITAL_VOICE_ALIASES: Record<string, string> = {
  temp: 'temperature',
  temperature: 'temperature',
  pulse: 'heart_rate',
  'heart rate': 'heart_rate',
  breathing: 'respiratory_rate',
  'respiratory rate': 'respiratory_rate',
  glucose: 'blood_glucose',
  'blood glucose': 'blood_glucose',
  'blood sugar': 'blood_glucose',
  weight: 'body_weight',
  'body weight': 'body_weight',
  height: 'body_height',
  'body height': 'body_height',
}

// Helper message for voice commands
export const VOICE_COMMANDS_HELP_MESSAGE = `
Voice Commands allow you to quickly fill out the triage form using natural language. Here's how to use them effectively:

⚠️ Warning Signs:
• Say "has a seizure", "having chest pain", or "has difficulty breathing"
• The system will automatically check that warning sign
• Use phrases starting with "has a", "have a", or "having"
• Simply saying the symptom name alone may not check the box

📝 Brief History (Yes / No / Unknown):
• Say "has diabetes" → marked as Yes
• Say "no diabetes" or "diabetes no" → marked as No
• Say "diabetes unknown" or "not sure about asthma" → marked as Unknown
• Saying only the condition name (for example, "diabetes") will not mark it yet
• The system will wait for you to say Yes, No, or Unknown

📊 Vital Measurements:
• Say "[vital name] [number]"
• Examples:
  - "temperature 37.8"
  - "heart rate 72"
  - "respiratory rate 16"
  - "weight 70"
  - "height 170"
• Numbers can be spoken as digits or words
  - "37.8" or "thirty-seven point eight"

🩸 Blood Pressure:
• Say "blood pressure [number] over [number]"
• Examples:
  - "blood pressure 120 over 80"
  - "blood pressure one thirty over ninety"

📋 Assessments:
• Say any assessment option shown in the form
• Examples:
  - "alert"
  - "confused"
  - "trauma"
  - "no trauma"

💡 Tips:
• Speak clearly and pause briefly between commands
• Use the exact labels shown on the screen
• Wait for the form to update before giving the next command
• The microphone button turns red when listening
`.trim()

export const ASSESSMENT_VALUE_ALIASES: Record<string, string[]> = {
  alert: ['alert', 'mentally alert'],
  'reacts to voice': ['reacts to voice', 'impairment of mental alertness'],
  confused: ['confused', 'clouded consciousness'],
  'reacts to pain': ['reacts to pain', 'responds to pain'],
  unresponsive: ['unresponsive'],

  walking: ['able to walk'],
  'can walk': ['able to walk'],
  'difficulty walking': ['difficulty walking'],
  'cannot walk': ['unable to walk'],
  'unable to walk': ['unable to walk'],

  trauma: ['"traumatic injury"'],
  'no trauma': ['"no traumatic injury"'],
}
