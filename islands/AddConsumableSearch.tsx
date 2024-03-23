import AsyncSearch from './AsyncSearch.tsx'

export function AddConsumableSearch({ facility_id }: { facility_id: number }) {
  return (
    <AsyncSearch
      href='/app/consumables'
      optionHref={(option) =>
        `/app/facilities/${facility_id}/inventory/add_consumable?consumable_id=${option.id}`}
    />
  )
}
