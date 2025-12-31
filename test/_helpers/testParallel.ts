import { it } from 'std/testing/bdd.ts'
import {
  asResultAsync,
  Failure,
  isSuccess,
} from '../../util/asResult.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { forEach } from '../../util/inParallel.ts'

export type TestCase =
  | [name: string, fn: () => void | Promise<void>]
  | [
    name: string,
    fn: () => void | Promise<void>,
    opts: { only?: boolean; skip?: boolean },
  ]

export function testParallel(
  description: string,
  cases: TestCase[],
  { fail_fast, only, skip, concurrency = Infinity }: {
    fail_fast?: boolean
    only?: boolean
    skip?: boolean
    concurrency?: number
  } = {},
) {
  const run = only ? it.only : skip ? it.skip : it
  run(description, async () => {
    const any_only = cases.some((test_case) => test_case[2]?.only)
    const run_test_cases = any_only
      ? cases.filter((test_case) => test_case[2]?.only)
      : cases.filter((test_case) => !test_case[2]?.skip)

    const failures: Array<Failure & { name: string }> = []

    await forEach(run_test_cases, async ([name, fn]) => {
      const result = await asResultAsync(() => Promise.resolve().then(fn))
      if (isSuccess(result)) return
      if (fail_fast) throw result.error
      failures.push({ name, ...result })
    }, { concurrency })

    if (arrayIsEmpty(failures)) {
      return
    }

    const message = failures
      .map((f) => `[${f.name}] ${f.error.message}`)
      .join('\n\n')

    throw new AggregateError(failures.map((f) => f.error), message)
  })
}

testParallel.only = (
  description: string,
  cases: TestCase[],
) => testParallel(description, cases, { only: true })

testParallel.skip = (
  description: string,
  cases: TestCase[],
) => testParallel(description, cases, { skip: true })
