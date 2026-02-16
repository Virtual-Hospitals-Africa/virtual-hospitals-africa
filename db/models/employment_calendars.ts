import { RenderedEmployee, TrxOrDbOrQueryCreator } from '../../types.ts'

export const employment_calendars = {
  add(
    trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
    employment_id: string,
  ) {
    return trx.updateTable('employment_calendars')
      .set({ availability_set: true })
      .where('employment_id', '=', employment_id)
      .execute()
  },
  findOneOptional(
    trx: TrxOrDbOrQueryCreator,
    employee: RenderedEmployee,
  ) {
    return trx
      .selectFrom('employment_calendars')
      .where('employment_id', '=', employee.employee_id)
      .selectAll('employment_calendars')
      .executeTakeFirst()
  },
}
