import { RenderedEmployee, TrxOrDb } from '../../types.ts'

export const employment_calendars = {
  add(
    trx: TrxOrDb,
    calendars: {
      employment_id: string
      gcal_appointments_calendar_id: string
      gcal_availability_calendar_id: string
      availability_set?: boolean
    }[],
  ) {
    return trx
      .insertInto('employment_calendars')
      .values(calendars)
      .execute()
  },
  markAvailabilitySet(
    trx: TrxOrDb,
    employment_id: string,
  ) {
    return trx.updateTable('employment_calendars')
      .set({ availability_set: true })
      .where('employment_id', '=', employment_id)
      .execute()
  },
  findOneOptional(
    trx: TrxOrDb,
    employee: RenderedEmployee,
  ) {
    return trx
      .selectFrom('employment_calendars')
      .where('employment_id', '=', employee.employee_id)
      .selectAll('employment_calendars')
      .executeTakeFirst()
  },
}
