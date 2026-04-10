import { u, d4 as Table, ay as capitalize, a, b as s, l, H as HealthWorkerHomePage, e as assertOr404 } from "../server-entry.mjs";
import { i as inventory } from "./inventory-LxIPqcyI.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["<span ", ">", "", "</span>"];
const columns = [{
  label: "Log",
  data(row) {
    return capitalize(row.interaction);
  }
}, {
  label: "Employee",
  type: "person",
  data: "created_by",
  fallback: null
}, {
  label: "Change",
  data(row) {
    const is_positive = row.change > 0;
    return a($$_tpl_1, l("class", is_positive ? "text-green-400" : "text-yellow-400"), s(!!is_positive && "+"), s(row.change));
  }
}, {
  label: "Patient",
  type: "person",
  data: "patient",
  fallback: null
}, {
  label: "Procurer",
  data(row) {
    return row.procured_from?.name;
  }
}, {
  label: "Date",
  data: "created_at_formatted"
}, {
  label: "Batch Number",
  data: "batch_number"
}, {
  label: "Expires",
  data: "expiry_date"
}, {
  type: "actions",
  label: "Actions"
}];
const fake_prescriptions = [{
  interaction: "prescription filled",
  created_at: /* @__PURE__ */ new Date(),
  created_at_formatted: "4 April 2024 10:51:44 AM",
  created_by: {
    name: "Susan Mlalazi",
    avatar_url: "/images/avatars/random/female/2.png",
    href: "/foo"
  },
  procured_from: null,
  change: -20,
  expiry_date: null,
  batch_number: "622",
  patient: {
    name: "Bongani Nyathi",
    description: "female, 20 years",
    avatar_url: "/images/avatars/random/female/3.png",
    href: "/foo"
  },
  actions: {
    view: "/app/prescriptions/1"
  }
}, {
  interaction: "prescription filled",
  created_at: /* @__PURE__ */ new Date(),
  created_at_formatted: "5 April 2024 9:50:09 AM",
  created_by: {
    name: "Susan Mlalazi",
    avatar_url: "/images/avatars/random/female/2.png",
    href: "/foo"
  },
  procured_from: null,
  change: -10,
  expiry_date: null,
  batch_number: "622",
  patient: {
    name: "Ernest Mafusire",
    description: "male, 22 years",
    avatar_url: "/images/avatars/random/male/3.png",
    href: "/foo"
  },
  actions: {
    view: "/app/prescriptions/1"
  }
}, {
  interaction: "prescription filled",
  created_at: /* @__PURE__ */ new Date(),
  created_at_formatted: "6 April 2024 3:16:22 PM",
  created_by: {
    name: "Tafara Ndhlovu",
    avatar_url: "/images/avatars/random/male/4.png",
    href: "/foo"
  },
  procured_from: null,
  change: -30,
  expiry_date: null,
  batch_number: "622",
  patient: {
    name: "Christopher Mukono",
    description: "male, 32 years",
    avatar_url: "/images/avatars/random/male/7.png",
    href: "/foo"
  },
  actions: {
    view: "/app/prescriptions/1"
  }
}];
function InventoryHistoryTable({
  history: history2
}) {
  return u(Table, {
    columns,
    rows: history2.concat(fake_prescriptions).toReversed(),
    EmptyState: () => {
      throw new Error("Should not have access to a history page for which there are no entries");
    }
  });
}
const history = HealthWorkerHomePage(async function InventoryHistoryPage({
  url,
  state
}) {
  const consumable_id = url.searchParams.get("consumable_id");
  assertOr404(consumable_id);
  const consumable = await inventory.getConsumablesHistory(state.trx, {
    organization_id: state.organization.id,
    consumable_id
  });
  return {
    title: `Inventory History: ${consumable.name}`,
    children: u(InventoryHistoryTable, {
      history: consumable.history
    })
  };
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_inventory_history = history;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_inventory_history as default,
  handler,
  handlers
};
