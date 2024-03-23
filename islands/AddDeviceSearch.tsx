import AsyncSearch from './AsyncSearch.tsx'

export function AddDeviceSearch({ facility_id }: { facility_id: number }) {
  return (
    <AsyncSearch
      href='/app/devices'
      optionHref={(option) =>
        `/app/facilities/${facility_id}/inventory/add_device?device_id=${option.id}`}
    />
  )
}
