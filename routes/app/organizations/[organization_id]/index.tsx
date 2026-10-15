// Fresh only runs ./_middleware.tsx for URLs that match a route, so this route
// has to exist for the middleware to redirect /app/organizations/:organization_id
// to /app/organizations/:organization_id/info. It is never actually rendered.
export default function OrganizationRoot() {
  return null
}
