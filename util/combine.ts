type OverlappingKeys<X, Y> = Extract<keyof X, keyof Y>

export function combine<
  X extends object,
  Y extends object,
>(x: X, y: OverlappingKeys<X, Y> extends never ? Y : never): X & Y {
  // deno-lint-ignore no-explicit-any
  const clone: any = { ...x }
  for (const key in y) {
    if (key in x) {
      throw new Error(`Name collision ${key}`)
    }
    clone[key] = y[key]
  }
  return clone
}
