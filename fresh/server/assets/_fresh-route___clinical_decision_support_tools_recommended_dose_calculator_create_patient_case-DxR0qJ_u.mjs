import { u, av as Form, a, J as FormSection, ed as FormGrid, dO as DateInput, ee as SelectWithOptions, ef as NumberInput, eg as PatientConditionsSection, B as Button, eb as StepsSidebar, L as LogoWithFullText, ec as HealthWorkerContentsWithSidebarAndDrawer } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["<div>", "</div>"];
function CreatePatientCase(ctx) {
  return u(HealthWorkerContentsWithSidebarAndDrawer, {
    title: "Recommended Dose Calculator",
    url: ctx.url,
    sidebar: u(StepsSidebar, {
      top: {
        href: "/clinical_decision_support_tools",
        child: u(LogoWithFullText, {
          variant: "indigo",
          className: "w-full"
        })
      },
      url: ctx.url,
      route: ctx.route,
      params: ctx.params,
      nav_links: [{
        step: "Create patient case",
        route: "/clinical_decision_support_tools/recommended_dose_calculator/create_patient_case"
      }, {
        step: "Recommended medications",
        route: "/clinical_decision_support_tools/recommended_dose_calculator/recommended_medications"
      }],
      steps_completed: []
    }),
    children: u(Form, {
      method: "GET",
      action: "/clinical_decision_support_tools/recommended_dose_calculator/recommended_medications",
      className: "flex flex-col gap-8 py-6 px-4",
      children: [u(FormSection, {
        header: "Demographic Details",
        children: u(FormGrid, {
          columns: 2,
          children: [u(DateInput, {
            name: "dob",
            label: "Date of Birth",
            required: true
          }), u(SelectWithOptions, {
            name: "sex",
            label: "Sex",
            blank_option: "Select Sex",
            options: ["male", "female"],
            required: true
          }), u(NumberInput, {
            name: "height_cm",
            label: "Height (cm)",
            min: 0,
            required: true
          }), u(NumberInput, {
            name: "weight_kg",
            label: "Weight (kg)",
            min: 0,
            required: true
          })]
        })
      }), u(FormSection, {
        header: "Patient Conditions",
        children: u(PatientConditionsSection, null)
      }), a($$_tpl_1, u(Button, {
        type: "submit",
        children: "Calculate Recommended Doses"
      }))]
    })
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___clinical_decision_support_tools_recommended_dose_calculator_create_patient_case = CreatePatientCase;
export {
  config,
  css,
  _freshRoute___clinical_decision_support_tools_recommended_dose_calculator_create_patient_case as default,
  handler,
  handlers
};
