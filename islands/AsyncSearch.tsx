import Search, { SearchProps } from './Search.tsx'
import useAsyncSearch from './useAsyncSearch.tsx'

export type AsyncSearchProps<
  T extends { id?: unknown; name: string } = { id?: unknown; name: string },
> = Omit<SearchProps<T>, 'options' | 'onQuery'> & {
  search_route: string
  onQuery?(query: string): void
  onSearchResults?(values: {
    query: string
    page: number
    delay: null | number
    active_request: null | XMLHttpRequest
    pages: {
      results: T[]
      page: number
    }[]
    current_page: {
      results: T[]
      page: number
    }
    has_next_page: boolean
  }): void
}

export default function AsyncSearch<
  T extends { id?: unknown; name: string },
>({
  search_route,
  value,
  onQuery,
  onSearchResults,
  ...rest
}: AsyncSearchProps<T>) {
  const { results, loading, loadMore, setQuery } = useAsyncSearch({
    search_route,
    value,
    onSearchResults,
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
