import AsyncSearch from './AsyncSearch.tsx'

export function AddConsumableSearch(
  { organization_id }: { organization_id: string },
) {
  return (
    <AsyncSearch
      search_route='/app/consumables'
      optionHref={(option) =>
        `/app/organizations/${organization_id}/inventory/add_consumable?consumable_id=${option.id}`}
    />
  )
}
