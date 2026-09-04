import { assert } from 'std/assert/assert.ts'
import Search, { OptionLike, SearchPropsCommon, SearchPropsMulti, SearchPropsSingular } from './Search.tsx'
import useAsyncSearch from './useAsyncSearch.tsx'

export type AsyncSearchProps<
  T extends OptionLike = OptionLike,
> =
  & SearchPropsCommon<T>
  & {
    search_route: string
    debounce_milliseconds?: number
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
    onQueryBlanked?(): void
  }
  & (
    SearchPropsSingular<T> | SearchPropsMulti<T>
  )

export type AsyncSearchPropsSingular<
  T extends OptionLike = OptionLike,
> = AsyncSearchProps<T> & {
  multi?: never | false
}

export default function AsyncSearch<
  T extends OptionLike,
>({
  search_route,
  value,
  skip_blank_search,
  onQuery,
  onSearchResults,
  onQueryBlanked,
  ...rest
}: AsyncSearchProps<T>) {
  if (onQueryBlanked) {
    assert(skip_blank_search, 'onQueryBlanked only makes sense when skip_blank_search')
  }
  const { results, loading, loadMore, setQuery, search } = useAsyncSearch({
    search_route,
    skip_blank_search,
    value,
    onSearchResults,
    onQueryBlanked,
  })
  console.log({ loading, search, results })
  return (
    <Search
      {...rest}
      is_async
      skip_blank_search={skip_blank_search}
      // deno-lint-ignore no-explicit-any
      value={value as any}
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
