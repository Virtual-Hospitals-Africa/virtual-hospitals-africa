import Search from './Search.tsx'
import useAsyncSearch, { type AsyncSearchProps } from './useAsyncSearch.tsx'

export default function AsyncSearch<
  T extends Record<string, unknown>,
>({
  search_route,
  value,
  onQuery,
  id_field,
  name_field,
  ...rest
}: AsyncSearchProps<T>) {
  const { results, loading, loadMore, setQuery } = useAsyncSearch({
    search_route,
    value,
    id_field,
    name_field,
  })
  return (
    <Search
      {...rest}
      value={value}
      loading_options={loading}
      loadMoreOptions={loadMore}
      options={results}
      onQuery={(query) => {
        setQuery(query)
        onQuery?.(query)
      }}
    />
  )
}
