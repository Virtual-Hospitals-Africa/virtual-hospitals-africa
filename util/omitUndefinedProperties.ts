import { AnyRecord, OptionalUndefinedFields } from '../types.ts'

export function omitUndefinedProperties<T extends AnyRecord>(obj: T): OptionalUndefinedFields<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as OptionalUndefinedFields<T>
}
