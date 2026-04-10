const employment_calendars = {
  add(trx, calendars) {
    return trx.insertInto("employment_calendars").values(calendars).execute();
  },
  markAvailabilitySet(trx, employment_id) {
    return trx.updateTable("employment_calendars").set({
      availability_set: true
    }).where("employment_id", "=", employment_id).execute();
  },
  findOneOptional(trx, employee) {
    return trx.selectFrom("employment_calendars").where("employment_id", "=", employee.employee_id).selectAll("employment_calendars").executeTakeFirst();
  }
};
export {
  employment_calendars as e
};
