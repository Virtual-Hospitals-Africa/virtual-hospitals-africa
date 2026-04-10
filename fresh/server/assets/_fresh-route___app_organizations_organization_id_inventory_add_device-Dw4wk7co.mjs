import { u, av as Form, K as FormRow, dA as DeviceSearch, aB as TextInput, B as Button, H as HealthWorkerHomePage, aN as assertOr403, r as redirect, F as object, G as string } from "../server-entry.mjs";
import { i as inventory } from "./inventory-LxIPqcyI.mjs";
import { d as devices } from "./devices-FzIcYlDo.mjs";
import { r as roleByProfession } from "./roleByProfession-D3ZuwA92.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
function OrganizationDeviceForm({
  device
}) {
  return u(Form, {
    method: "POST",
    children: [u(FormRow, {
      children: u(DeviceSearch, {
        name: "device",
        label: "Device",
        required: true,
        addable: true,
        value: device
      })
    }), u(FormRow, {
      children: u(TextInput, {
        name: "serial_number",
        label: "Serial Number",
        required: true
      })
    }), u(FormRow, {
      children: u(Button, {
        type: "submit",
        children: "Submit"
      })
    })]
  });
}
const AddDeviceSchema = object({
  device_id: string(),
  serial_number: string().optional()
}).describe("Add device");
const handler$1 = postHandler(AddDeviceSchema, async (ctx, to_add) => {
  const admin_role = roleByProfession(ctx.state.organization_employment, "admin");
  assertOr403(admin_role);
  const {
    organization_id
  } = ctx.params;
  await inventory.addOrganizationDevice(ctx.state.trx, {
    organization_id,
    device_id: to_add.device_id,
    serial_number: to_add.serial_number,
    created_by: admin_role.employment_id
  });
  const success = encodeURIComponent(`Device added to your organization's inventory 🏥`);
  return redirect(`/app/organizations/${organization_id}/inventory?success=${success}`);
});
const add_device = HealthWorkerHomePage("Add Device", async function DeviceAdd({
  url,
  state
}) {
  let device = null;
  const device_id = url.searchParams.get("device_id");
  if (device_id) {
    device = await devices.getById(state.trx, device_id);
  }
  return u(OrganizationDeviceForm, {
    device
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_inventory_add_device = add_device;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_inventory_add_device as default,
  handler,
  handlers
};
