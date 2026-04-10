import { a, u, d4 as Table, df as employeeOrganizationDepartmentNames, cX as EmptyState, dg as UserCircleIcon, K as FormRow, dh as SearchInput, B as Button, aw as employeeDisplay, ax as Person, H as HealthWorkerHomePage, au as employees$1 } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["", "", ""];
function EmployeesTable({
  is_admin,
  employees: employees2,
  pathname
}) {
  const columns = [{
    label: "Employee",
    headerClassName: "pl-12",
    data(row) {
      return u(Person, {
        person: {
          ...row,
          display_name: employeeDisplay(row).display_name
        }
      });
    }
  }, {
    label: "Profession",
    data(row) {
      return employeeDisplay(row).description;
    }
  }, {
    label: "Departments",
    data: employeeOrganizationDepartmentNames
  }, {
    label: "Actions",
    type: "actions"
  }];
  const add_href = `${pathname}/invite`;
  return a($$_tpl_1, u(FormRow, {
    className: "mb-4",
    children: [u(SearchInput, null), is_admin && u(Button, {
      type: "button",
      href: add_href,
      className: "grid self-end p-2 text-white border-0 rounded-md shadow-sm w-max ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 whitespace-nowrap place-items-center",
      children: "Invite"
    })]
  }), u(Table, {
    columns,
    rows: employees2,
    EmptyState: () => u(EmptyState, {
      header: "No employees",
      explanation: "Invite a health worker to get started",
      Icon: UserCircleIcon,
      button: is_admin ? {
        children: "Invite",
        href: add_href
      } : void 0
    })
  }));
}
const employees = HealthWorkerHomePage(async function EmployeeTable(ctx) {
  const {
    trx,
    health_worker,
    organization,
    is_admin_at_organization
  } = ctx.state;
  const employees_of_organization = await employees$1.findAll(trx, {
    organization_id: organization.id
  });
  return {
    title: `${organization.name} Employees`,
    children: u(EmployeesTable, {
      is_admin: is_admin_at_organization,
      employees: employees_of_organization,
      pathname: ctx.url.pathname,
      organization_id: organization.id,
      health_worker_id: health_worker.id
    })
  };
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_employees = employees;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_employees as default,
  handler,
  handlers
};
