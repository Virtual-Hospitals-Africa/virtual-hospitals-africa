import { positive_integer } from './validators.ts'

export function readPositiveIntegerEnvironmentVariable(
  key: string,
): undefined | number {
  if (!Deno.env.has(key)) return
  const value = Deno.env.get(key)
  return positive_integer.parse(value)
}
