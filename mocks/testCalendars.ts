import generateUUID from '../util/uuid.ts'

export default function testCalendars() {
  return {
    gcal_appointments_calendar_id: generateUUID() +
      '@appointments.calendar.google.com',
    gcal_availability_calendar_id: generateUUID() +
      '@availability.calendar.google.com',
  }
}
