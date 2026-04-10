import { h as health_workers, ad as generateUUID, aO as blankSelection, aU as base, aW as organizations, bf as jsonArrayFrom, ey as orderByArrayPosition, ez as DEPARTMENTS } from "../server-entry.mjs";
const employment = {
  addOne(trx, {
    department_ids,
    ...employee
  }) {
    health_workers.invalidateCacheOne(employee.health_worker_id);
    const id = generateUUID();
    return trx.with("employment_insert", (qb) => qb.insertInto("employment").values({
      id,
      ...employee
    }).returningAll()).with("department_insert", (qb) => department_ids?.length ? qb.insertInto("department_employment").values(department_ids.map((department_id) => ({
      department_id,
      employment_id: id
    }))) : blankSelection(qb)).selectFrom("employment_insert").selectAll("employment_insert").executeTakeFirstOrThrow();
  }
};
function baseQuery(trx, opts) {
  return organizations.baseQuery(trx, opts).select((eb) => [jsonArrayFrom(eb.selectFrom("organization_departments").innerJoin("departments", "departments.name", "organization_departments.name").select(["organization_departments.id", "organization_departments.name"]).whereRef("organization_departments.organization_id", "=", "organizations.id").orderBy((eb_organization_departments_order) => orderByArrayPosition(eb_organization_departments_order, "organization_departments.name", DEPARTMENTS), "desc")).as("departments")]);
}
const organizations_with_departments = base({
  top_level_table: "organizations",
  // caching: {
  //   number_of_items: 100,
  // },
  baseQuery,
  formatResult: (x) => x
});
export {
  employment as e,
  organizations_with_departments as o
};
