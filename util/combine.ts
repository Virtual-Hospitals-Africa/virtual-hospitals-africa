import { assertArrayNonEmpty } from './arraySize.ts'

type OverlappingKeys<X, Y> = Extract<keyof X, keyof Y>

export function combine<
  X extends object,
  Y extends object,
>(x: X, y: OverlappingKeys<X, Y> extends never ? Y : never, opts?: { allow_collision_if_identical?: boolean }): X & Y {
  // deno-lint-ignore no-explicit-any
  const clone: any = { ...x }
  for (const key in y) {
    if (key in x) {
      if (!opts?.allow_collision_if_identical) {
        throw new Error(`Name collision ${key}`)
      }
      // deno-lint-ignore no-explicit-any
      if ((x as any)[key] !== (y as any)[key]) {
        throw new Error(`Name collision ${key} with nonidentical values`)
      }
    }
    clone[key] = y[key]
    console
  }
  return clone
}

export function combineAll(objects: Record<string, string>[]): Record<string, string> {
  assertArrayNonEmpty(objects)
  // deno-lint-ignore no-explicit-any
  return objects.reduce(combine as any)
}
