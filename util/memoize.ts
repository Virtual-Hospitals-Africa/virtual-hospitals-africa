// deno-lint-ignore-file no-explicit-any
export default function memoize<
  Func extends (...args: any[]) => any,
  CacheKey,
>(func: Func, resolver?: (...args: Parameters<Func>) => CacheKey): Func {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }
  const memoized = function (...args: Parameters<Func>) {
    // @ts-ignore allow this
    const key: CacheKey = resolver ? resolver.apply(this, args) : args[0]
    const cache = memoized.cache

    if (cache.has(key)) {
      return cache.get(key)
    }
    // @ts-ignore allow this
    const result = func.apply(this, args)
    memoized.cache = cache.set(key, result) || cache
    return result
  }
  memoized.cache = new (memoize.Cache || Map)()
  return memoized as unknown as Func
}

memoize.Cache = Map
