import Search, { SearchProps } from './Search.tsx'
import useAsyncSearch from './useAsyncSearch.tsx'

export type AsyncSearchProps<
  T extends { id?: unknown; name: string } = { id?: unknown; name: string },
> = Omit<SearchProps<T>, 'options' | 'onQuery'> & {
  search_route: string
  onQuery?: (query: string) => void
}

export default function AsyncSearch<
  T extends { id?: unknown; name: string },
>({
  search_route,
  value,
  onQuery,
  ...rest
}: AsyncSearchProps<T>) {
  const { search, setSearch } = useAsyncSearch({ search_route, value })
  return (
    <Search
      {...rest}
      value={value}
      options={search.results}
      onQuery={(query) => {
        setSearch({ ...search, query })
        onQuery?.(query)
      }}
    />
  )
}
