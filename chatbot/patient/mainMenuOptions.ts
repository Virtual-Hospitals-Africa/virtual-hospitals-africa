export default [
  {
    option: 'make_appointment',
    display: 'Make appointment',
    nextState: 'not_onboarded:make_appointment:enter_name' as const,
  },
  {
    option: 'find_nearest_clinic',
    display: 'Find Nearest Clinic',
    nextState: 'not_onboarded:find_nearest_clinic:share_location' as const,
  },
]
