/*
  The floating panels that sit in the column just left of the patient drawer:
  the priority escalation panel (islands/PriorityEscalation/PriorityEscalationPanel.tsx)
  and the warning signs follow-ups panel (islands/WarningSigns/FollowUpsPanel.tsx).

  They are rendered by two separate islands that know nothing of each other, so
  rather than each guessing at the other's position they portal into one host
  element rendered by HealthWorkerContentsWithSidebarAndDrawer, which owns the
  geometry. Whichever panels are open then stack in that column, sharing its
  width and its edges.

  Stacking is by `order`, not by DOM insertion, because which island hydrates
  first is not something we control.
*/
export const SIDE_PANEL_HOST_ID = 'drawer-side-panels'

/*
  A fixed column running from just below the header to just above the Next
  button, flush to the left edge of the drawer (w-60 xl:w-84, so right-64
  xl:right-88 leaves a 1rem gutter). pointer-events-none because the column
  spans most of the viewport and would otherwise swallow clicks on the form
  behind it; each panel turns pointer events back on for itself.
*/
export const SIDE_PANEL_HOST_CLASS =
  'fixed top-20 bottom-20 right-64 xl:right-88 z-40 w-[30rem] xl:w-[44rem] max-w-[calc(100vw-20rem)] flex flex-col items-stretch justify-start gap-3 pointer-events-none'

/*
  min-h-0 so that two open panels shrink to share the column rather than
  overflowing it; each panel scrolls its own body.
*/
export const SIDE_PANEL_CLASS = 'pointer-events-auto flex flex-col min-h-0 rounded-2xl bg-white shadow-xl border border-gray-200'

export const SIDE_PANEL_ORDER = {
  priority_escalation: 'order-1',
  follow_ups: 'order-2',
}

export function sidePanelHost(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.getElementById(SIDE_PANEL_HOST_ID)
}
