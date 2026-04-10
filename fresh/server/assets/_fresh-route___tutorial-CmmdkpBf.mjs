import { u, em as TUTORIAL_EMPLOYEE, en as TUTORIAL_PATIENT, eo as TriageTutorial } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
function TutorialPage(ctx) {
  return u(TriageTutorial, {
    url: ctx.url,
    route: ctx.route,
    patient: TUTORIAL_PATIENT,
    employee: TUTORIAL_EMPLOYEE
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___tutorial = TutorialPage;
export {
  config,
  css,
  _freshRoute___tutorial as default,
  handler,
  handlers
};
