import { a, b as s, u, K as FormRow, d3 as AddConsumableSearch, B as Button, d4 as Table, cX as EmptyState, d5 as ArchiveBoxIcon, d6 as AddDeviceSearch, l, d7 as Tabs, H as HealthWorkerHomePage, e as assertOr404 } from "../server-entry.mjs";
import { i as inventory$1 } from "./inventory-LxIPqcyI.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1$3 = ['<span class="text-red-600">Not in stock</span>'];
const $$_tpl_2$2 = ["", "", ""];
const columns$2 = [{
  label: "Name",
  data: "name"
}, {
  label: "Quantity",
  data(row) {
    return row.quantity_on_hand || a($$_tpl_1$3);
  }
}, {
  type: "actions",
  label: "Actions"
}];
function OrganizationConsumablesTable({
  consumables,
  organization_id,
  is_admin
}) {
  const add_href = `/app/organizations/${organization_id}/inventory/add_consumable`;
  return a($$_tpl_2$2, s(is_admin && u(FormRow, {
    className: "mb-2",
    children: [u(AddConsumableSearch, {
      organization_id
    }), u(Button, {
      type: "button",
      href: add_href,
      className: "w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center",
      children: "Add Consumable"
    })]
  })), u(Table, {
    columns: columns$2,
    rows: consumables,
    EmptyState: () => u(EmptyState, {
      header: "No consumables in stock",
      explanation: "Add a consumable to get started",
      Icon: ArchiveBoxIcon,
      button: is_admin ? {
        children: "Add Consumable",
        href: add_href
      } : void 0
    })
  }));
}
const $$_tpl_1$2 = ['<div class="flex flex-col">', "</div>"];
const $$_tpl_2$1 = ["<span ", ">", "</span>"];
const $$_tpl_3$1 = ["", "", ""];
const columns$1 = [{
  label: "Name",
  data: "name"
}, {
  label: "Manufacturer",
  data: "manufacturer"
}, {
  label: "Serial Number",
  data: "serial_number"
}, {
  label: "Tests",
  data(row) {
    return a($$_tpl_1$2, s(row.diagnostic_test_capabilities.map((c) => a($$_tpl_2$1, l("key", c), s(c)))));
  }
}];
function OrganizationDevicesTable({
  devices,
  organization_id,
  is_admin
}) {
  const add_href = `/app/organizations/${organization_id}/inventory/add_device`;
  return a($$_tpl_3$1, s(is_admin && u(FormRow, {
    className: "mb-2",
    children: [u(AddDeviceSearch, {
      organization_id
    }), u(Button, {
      type: "button",
      href: add_href,
      className: "w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center",
      children: "Add Device"
    })]
  })), u(Table, {
    columns: columns$1,
    rows: devices,
    EmptyState: () => u(EmptyState, {
      header: "No devices in the inventory",
      explanation: "Add a device to get started",
      Icon: ArchiveBoxIcon,
      button: is_admin ? {
        children: "Add Device",
        href: add_href
      } : void 0
    })
  }));
}
const $$_tpl_1$1 = ['<div class="flex flex-col">', "</div>"];
const $$_tpl_2 = ["<span ", ">", "", "</span>"];
const $$_tpl_3 = ['<span class="text-red-600">Not in stock</span>'];
const $$_tpl_4 = ["", "", ""];
function breakSemicolons(str) {
  return a($$_tpl_1$1, s(str.split("; ").map((name, index) => a($$_tpl_2, l("key", name), s(name), s(index === 0 ? "" : ";")))));
}
const columns = [{
  label: "Generic Name",
  data(row) {
    return breakSemicolons(row.generic_name);
  }
}, {
  label: "Trade Name",
  data(row) {
    return breakSemicolons(row.trade_name);
  }
}, {
  label: "Manufacturer",
  data: "applicant_name"
}, {
  label: "Form",
  data: "form"
}, {
  label: "Strength",
  data: "strength_display"
}, {
  label: "Quantity",
  data(row) {
    return row.quantity_on_hand || a($$_tpl_3);
  }
}, {
  type: "actions",
  label: "Actions"
}];
function OrganizationMedicinesTable({
  medicines,
  organization_id,
  is_admin
}) {
  const add_href = `/app/organizations/${organization_id}/inventory/add_medicine`;
  return a($$_tpl_4, s(is_admin && u(FormRow, {
    className: "mb-2",
    children: u(Button, {
      type: "button",
      href: `/app/organizations/${organization_id}/inventory/add_medicine`,
      className: "grid self-end p-2 text-gray-900 border-0 rounded-md shadow-sm w-max ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 whitespace-nowrap place-items-center",
      children: "Add Medicine"
    })
  })), u(Table, {
    columns,
    rows: medicines,
    EmptyState: () => u(EmptyState, {
      header: "No medicines in stock",
      explanation: "Add a medicine to get started",
      Icon: ArchiveBoxIcon,
      button: is_admin ? {
        children: "Add Medicine",
        href: add_href
      } : void 0
    })
  }));
}
const $$_tpl_1 = ["", '<div class="mt-2">', "", "", "</div>"];
function inventoryView({
  devices,
  consumables,
  medicines,
  organization_id,
  is_admin,
  active_tab
}) {
  const tabs = [{
    tab: "Devices",
    href: `/app/organizations/${organization_id}/inventory?active_tab=devices`,
    active: active_tab === "devices"
  }, {
    tab: "Consumables",
    href: `/app/organizations/${organization_id}/inventory?active_tab=consumables`,
    active: active_tab === "consumables"
  }, {
    tab: "Medicines",
    href: `/app/organizations/${organization_id}/inventory?active_tab=medicines`,
    active: active_tab === "medicines"
  }];
  return a($$_tpl_1, u(Tabs, {
    tabs
  }), s(active_tab === "devices" && u(OrganizationDevicesTable, {
    devices,
    organization_id,
    is_admin
  })), s(active_tab === "consumables" && u(OrganizationConsumablesTable, {
    consumables,
    organization_id,
    is_admin
  })), s(active_tab === "medicines" && u(OrganizationMedicinesTable, {
    medicines,
    organization_id,
    is_admin
  })));
}
const inventory = HealthWorkerHomePage("Inventory", async function InventoryPage(ctx) {
  const {
    organization,
    is_admin_at_organization
  } = ctx.state;
  const {
    organization_id
  } = ctx.params;
  const active_tab = ctx.url.searchParams.get("active_tab") ?? "devices";
  assertOr404(organization_id);
  const organization_devices = active_tab === "devices" ? await inventory$1.getDevices(ctx.state.trx, {
    organization_id
  }) : [];
  const organization_consumbales = active_tab === "consumables" ? await inventory$1.getConsumables(ctx.state.trx, {
    organization_id
  }) : [];
  const organization_medicines = active_tab === "medicines" ? await inventory$1.getMedicines(ctx.state.trx, {
    organization_id
  }) : [];
  return u(inventoryView, {
    organization_id: organization.id,
    devices: organization_devices,
    consumables: organization_consumbales,
    medicines: organization_medicines,
    is_admin: is_admin_at_organization,
    active_tab
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_inventory = inventory;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_inventory as default,
  handler,
  handlers
};
