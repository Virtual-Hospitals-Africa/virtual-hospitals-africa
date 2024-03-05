import { assert } from 'std/assert/assert.ts'
import { useEffect, useState } from 'preact/hooks'
import Search, { SearchProps } from './Search.tsx'

export type AsyncSearchProps<
  T extends { id?: unknown; name: string } = { id?: unknown; name: string },
> = Omit<SearchProps<T>, 'options'> & {
  href: string
}

export default function AsyncSearch<
  T extends { id?: unknown; name: string },
>({
  href,
  value,
  onQuery,
  ...rest
}: AsyncSearchProps<T>) {
  const [search, setSearch] = useState({
    query: value?.name ?? '',
    delay: null as null | number,
    active_request: null as null | XMLHttpRequest,
    results: [] as T[],
  })

  // Make a cancellable request when the query changes
  useEffect(() => {
    const url = new URL(`${location.origin}${href}`)
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
      const results = JSON.parse(request.responseText)
      assert(Array.isArray(results))
      setSearch((search) => {
        if (search.active_request === request) {
          return {
            query: search.query,
            delay: null,
            active_request: null,
            results,
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
  }, [search.query])

  return (
    <Search
      {...rest}
      value={value}
      options={search.results}
      onQuery={(query) => {
        setSearch({ ...search, query })
        onQuery(query)
      }}
    />
  )
}
