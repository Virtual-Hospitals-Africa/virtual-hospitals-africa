import { a, b as s, u, l, c as classNames, ac as MapPinIcon, J as FormSection, R as RadioButtonGroup, Q as compact, T as TextArea, O as OpenEncounterWorkflowPage, Z as canPerform, m as assert, U as completedPersonal, ad as generateUUID, ae as organization_rooms, af as completeStep, V as patient_workflows, r as redirect, ag as events, Y as success, a2 as promiseProps, a1 as completeAndProceedToNextStep, k as patient_encounters, F as object, G as string, _ as _enum, $ as assertOrRedirect, a0 as warning } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { p as patient_presence } from "./patient_presence-BDsaizBc.mjs";
import { s as startWorkflow } from "./start-workflow-qhduKPTt.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1$1 = ["<div ", '><div class="flex items-start justify-between gap-4"><div class="flex flex-col gap-1.5"><div><p class="text-base font-semibold leading-snug text-gray-900">', '</p><p class="text-sm font-normal leading-5 text-gray-600">', '</p></div><div class="flex flex-col gap-0.5"><p class="text-sm font-medium leading-5 text-gray-600">', '</p><div class="flex items-center gap-1.5">', '<p class="text-sm font-normal leading-5 text-gray-500">', "</p></div></div></div><div ", ">~", " min</div></div></div>"];
const $$_tpl_2 = ['<div class="flex flex-col gap-4 shrink-0"><h3 class="text-lg font-semibold leading-6 text-gray-600">Staff Availability</h3><div class="flex flex-col gap-6">', "</div></div>"];
const status_styles = {
  available_soon: {
    border: "border-l-green-500",
    chipBg: "bg-green-100",
    chipText: "text-green-800"
  },
  busy: {
    border: "border-l-yellow-400",
    chipBg: "bg-yellow-100",
    chipText: "text-yellow-800"
  },
  unavailable: {
    border: "border-l-red-600",
    chipBg: "bg-red-100",
    chipText: "text-red-800"
  }
};
function StaffStatusCard({
  staff
}) {
  const styles = status_styles[staff.status];
  return a($$_tpl_1$1, l("class", classNames("bg-gray-50 border-l-4 rounded py-4 pl-6 pr-4 w-full", styles.border)), s(staff.name), s(staff.role), s(staff.activity), u(MapPinIcon, {
    className: "size-5 text-gray-500 shrink-0"
  }), s(staff.location), l("class", classNames("px-4 py-0.5 rounded-full text-sm font-medium leading-5 whitespace-nowrap", styles.chipBg, styles.chipText)), s(staff.estimated_minutes));
}
function StaffAvailabilityColumn({
  staff
}) {
  return a($$_tpl_2, s(staff.map((member) => u(StaffStatusCard, {
    staff: member
  }, member.name))));
}
const $$_tpl_1 = ['<div class="flex gap-14 items-start w-full">', "", "</div>"];
function ThisVisitSection({
  this_visit: this_visit2,
  can_do_triage,
  patient_names,
  senior_health_worker_name: senior_health_worker_name2,
  staff_availability
}) {
  return a($$_tpl_1, u(FormSection, {
    header: "This Visit",
    className: "max-w-250",
    children: [u(RadioButtonGroup, {
      name: "next_workflow",
      defaultValue: "continue_with_registration",
      options: [{
        id: "continue_with_registration",
        name: "Seeking treatment with primary care",
        description: [`I will continue registration with ${patient_names.preferred_name}`, `Once done, ${patient_names.preferred_name} will proceed to the waiting room to be seen by the next available health worker in the triage department`]
      }, {
        id: "immediate_triage",
        name: "Immediate transfer to triage",
        description: compact([`I will transfer ${patient_names.preferred_name} immediately to the triage area as this appears to be an urgent case`, can_do_triage ? null : `${senior_health_worker_name2} will be notified immediately to meet us in the triage area`, `Registration will be completed later once the patient is confirmed stable`])
      }, {
        id: "call_for_help",
        name: "Call for help in reception area",
        description: [`I will stay here in reception with ${patient_names.preferred_name}`, `${senior_health_worker_name2} will be notified immediately to join us in reception`]
      }]
    }), u(TextArea, {
      name: "notes",
      label: "Additional notes",
      value: this_visit2.notes,
      className: "max-w-full pl-6"
    })]
  }), s(staff_availability.length > 0 && u(StaffAvailabilityColumn, {
    staff: staff_availability
  })));
}
const senior_health_worker_name = "Nomsa Moyo";
const PatientRegistrationThisVisitSchema = object({
  next_workflow: _enum(["continue_with_registration", "immediate_triage", "call_for_help"]),
  notes: string().optional()
});
const handler$1 = postHandler(PatientRegistrationThisVisitSchema, async (ctx, {
  next_workflow,
  notes
}) => {
  const {
    trx,
    patient,
    encounter,
    organization,
    organization_employment
  } = ctx.state;
  const can_do_triage = canPerform(organization_employment, "triage");
  switch (next_workflow) {
    case "continue_with_registration": {
      const {
        response
      } = await promiseProps({
        updating_encounter: patient_encounters.updateOne(trx, encounter.patient_encounter_id, {
          reason: "seeking treatment",
          notes
        }),
        response: completeAndProceedToNextStep(ctx)
      });
      return response;
    }
    case "immediate_triage": {
      assert(!encounter.workflows.triage);
      assert(completedPersonal(patient));
      const patient_workflow_id = generateUUID();
      const patient_presence_updates = {
        current_workflow: "triage",
        department_name: "Triage",
        next_workflow: "registration"
      };
      const first_available_room = await organization_rooms.findFirstOptional(trx, {
        organization_id: organization.id,
        department_name: "Triage",
        is_available: true
      });
      if (first_available_room) {
        assert(!first_available_room.occupied_by_patient);
        patient_presence_updates.organization_room_id = first_available_room.id;
      }
      await Promise.all([completeStep(ctx), patient_workflows.insertOne(trx, {
        id: patient_workflow_id,
        patient_encounter_id: encounter.patient_encounter_id,
        workflow: "triage"
      }), patient_presence.set(trx, patient.id, patient_presence_updates), !can_do_triage && trx.updateTable("employment_presence").set({
        with_patient_id: null
      }).where("employment_presence.id", "=", organization_employment.employment_id).execute()]);
      if (can_do_triage) {
        encounter.workflows.triage = {
          patient_workflow_id,
          workflow: "triage",
          status: "not started",
          steps_completed: [],
          seen_patient_encounter_employee_ids: []
        };
        Object.assign(encounter.status.patient_presence, patient_presence_updates);
        return startWorkflow(ctx, "triage", {
          planning: "do_not_create_only_start_if_already_planned",
          patient_presence: "move_into_specificed_workflow"
        }).then(redirect);
      }
      await events.insert(trx, {
        type: "ImmediateTriage",
        data: {
          patient_encounter_id: encounter.patient_encounter_id,
          requested_by_employee_id: organization_employment.employment_id
        }
      });
      const redirect_success_message = first_available_room ? `Please escort ${patient.names.preferred_name} to ${first_available_room.name}. ${senior_health_worker_name} has been notified.` : `No rooms yet available for triage. Please stay with ${patient.names.preferred_name}. ${senior_health_worker_name} has been notified to come as soon as possible.`;
      return redirect(success(redirect_success_message, `/app/organizations/${organization.id}/waiting_room`));
    }
    default: {
      throw new Error("Not yet supported");
    }
  }
});
async function PatientRegistrationThisVisitPage(ctx) {
  const {
    patient,
    organization_employment,
    encounter: {
      reason,
      notes
    }
  } = ctx.state;
  const can_do_triage = !!canPerform(organization_employment, "triage");
  assertOrRedirect(patient.names, warning("The personal section must be completed first", ctx.url.pathname.replace("/this_visit", "/personal")));
  return u(ThisVisitSection, {
    this_visit: {
      reason,
      notes
    },
    patient_names: patient.names,
    senior_health_worker_name,
    can_do_triage,
    staff_availability: [{
      name: "Sarah Ndlovu",
      role: "Nurse",
      activity: "Assessing routine case",
      location: "Patient room 2",
      estimated_minutes: 2,
      status: "available_soon"
    }, {
      name: "Nomsa Moyo",
      role: "Nurse",
      activity: "Initial assessment in progress",
      location: "Patient Room 1",
      estimated_minutes: 8,
      status: "busy"
    }]
  });
}
const this_visit = OpenEncounterWorkflowPage(PatientRegistrationThisVisitPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_this_visit = this_visit;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_this_visit as default,
  handler,
  handlers
};
