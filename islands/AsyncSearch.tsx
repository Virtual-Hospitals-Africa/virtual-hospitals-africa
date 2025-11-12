import Search, {
  OptionLike,
  SearchPropsCommon,
  SearchPropsMulti,
  SearchPropsSingular,
} from './Search.tsx'
import useAsyncSearch from './useAsyncSearch.tsx'

export type AsyncSearchProps<
  T extends OptionLike = OptionLike,
> =
  & SearchPropsCommon<T>
  & {
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
  & (
    SearchPropsSingular<T> | SearchPropsMulti<T>
  )

export type AsyncSearchPropsSingular<
  T extends OptionLike = OptionLike,
> = AsyncSearchProps<T> & {
  multi?: never
}

export default function AsyncSearch<
  T extends OptionLike,
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
