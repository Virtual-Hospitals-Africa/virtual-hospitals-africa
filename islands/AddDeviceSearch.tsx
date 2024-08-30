import AsyncSearch from './AsyncSearch.tsx'

export function AddDeviceSearch(
  { organization_id }: { organization_id: string },
) {
  return (
    <AsyncSearch
      search_route='/app/devices'
      optionHref={(option) =>
        `/app/organizations/${organization_id}/inventory/add_device?device_id=${option.id}`}
    />
  )
}
