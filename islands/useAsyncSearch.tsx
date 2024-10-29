import { assert } from 'std/assert/assert.ts'
import { useEffect, useState } from 'preact/hooks'
import { SearchProps } from './Search.tsx'

export type AsyncSearchProps<
  T extends { id?: unknown; name: string } = { id?: unknown; name: string },
> = Omit<SearchProps<T>, 'options' | 'onQuery'> & {
  search_route: string
  onQuery?: (query: string) => void
}

export default function useAsyncSearch<
  T extends { id?: unknown; name: string },
>({
  search_route,
  value,
}: AsyncSearchProps<T>) {
  const [search, setSearch] = useState({
    query: value?.name ?? '',
    page: 1,
    delay: null as null | number,
    active_request: null as null | XMLHttpRequest,
    pages: [] as { results: T[]; page: number }[],
    has_next_page: false,
  })

  // Make a cancellable request when the query changes
  useEffect(() => {
    const url = new URL(`${location.origin}${search_route}`)
    url.searchParams.set('page', String(search.page))
    if (search.query) {
      url.searchParams.set('search', search.query)
    }
    if (search.active_request) {
      search.active_request.abort()
    }
    if (search.delay) {
      clearTimeout(search.delay)
    }
    const request = new XMLHttpRequest()
    request.open('GET', url.toString())
    request.setRequestHeader('accept', 'application/json')
    request.onload = () => {
      if (request.status !== 200) {
        const event = new CustomEvent('show-error', {
          detail: request.responseText,
        })
        return self.dispatchEvent(event)
      }
      const json = JSON.parse(request.responseText)
      const page = Array.isArray(json)
        ? {
          results: json,
          page: 1,
          has_next_page: false,
        }
        : json

      assert(
        Array.isArray(page.results),
        'Expected results to be an array or an object with a results key',
      )
      assert(
        typeof page.has_next_page === 'boolean',
        'Expected results to have a has_next_page key',
      )
      assert(
        typeof page.page === 'number',
        'Expected results to have a page key',
      )

      setSearch((search) => {
        if (search.active_request === request) {
          assert(
            search.page === page.page,
            'Expected the page to match the request page',
          )
          return {
            query: search.query,
            page: page.page,
            delay: null,
            active_request: null,
            pages: [...search.pages, page],
            has_next_page: page.has_next_page,
          }
        }
        return search
      })
    }

    const delay = setTimeout(() => {
      request.send()
      setSearch((search) => ({
        ...search,
        delay: null,
        active_request: request,
      }))
    }, 220)

    setSearch((search) => ({
      ...search,
      delay,
      active_request: null,
    }))
  }, [search.query, search.page])

  const loading = !!search.active_request

  const loadMore = !loading && search.has_next_page
    ? () => {
      setSearch((search) => ({
        ...search,
        page: search.page + 1,
      }))
    }
    : undefined

  return {
    loading,
    loadMore,
    results: search.pages.flatMap((page) => page.results),
    setQuery: (query: string) =>
      setSearch((search) => ({
        ...search,
        query,
        page: 1,
        pages: [],
        has_next_page: false,
      })),
  }
}
