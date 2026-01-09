import { describe, it } from 'std/testing/bdd.ts'
import { asResultAsync, Failure, isSuccess } from '../../util/asResult.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { forEach } from '../../util/inParallel.ts'
import { assert } from 'std/assert/assert.ts'
import { pluralize } from '../../util/pluralize.ts'
import partition from '../../util/partition.ts'

type TestFn = () => void | Promise<void>

export type TestCase =
  | [name: string, fn: TestFn]
  | [
    name: string,
    fn: TestFn,
    opts: { only?: boolean; skip?: boolean },
  ]

function casesToRun(
  cases: TestCase[],
) {
  const any_only = cases.some(([, , opts = {}]) => opts.only)
  return partition(
    cases,
    ([, , opts = {}]) => any_only ? !!opts.only : !opts.skip,
  )
}

async function runTestCases(
  cases_to_run: TestCase[],
  { fail_fast, concurrency = 7 }: {
    fail_fast?: boolean
    concurrency?: number
  } = {},
) {
  const failures: Array<Failure & { name: string }> = []

  await forEach(cases_to_run, async ([name, fn]) => {
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
}

let descriptions: string[] = []
let test_cases: TestCase[] = []
export function describeParallel(
  description: string,
  callback: () => void,
  opts: { only?: boolean; skip?: boolean } = {},
) {
  const this_descriptions = [...descriptions]
  descriptions = [...descriptions, description]
  const is_top_level = !this_descriptions.length
  if (!is_top_level) {
    callback()
    descriptions = this_descriptions
    return
  }

  const run = opts.only ? describe.only : opts.skip ? describe.skip : describe
  run(description, () => {
    callback()
    assert(test_cases.length, 'No test cases supplied')
    const [cases_to_run, skipped] = casesToRun(test_cases)
    let it_description = `passes ${cases_to_run.length} test ${
      pluralize('case', cases_to_run.length)
    }`
    if (skipped.length) {
      const skipped_description = ` (${skipped.length} skipped)`
      it_description += skipped_description
    }
    it(it_description, () => runTestCases(cases_to_run))
  })

  descriptions = this_descriptions
  test_cases = []
}

describeParallel.only = (
  description: string,
  callback: () => void,
) => describeParallel(description, callback, { only: true })

describeParallel.skip = (
  description: string,
  callback: () => void,
) => describeParallel(description, callback, { skip: true })

export function itParallel(
  description: string,
  test: TestFn,
  opts: { only?: boolean; skip?: boolean } = {},
) {
  const concatenated_test_description = [...descriptions.slice(1), description]
    .join(' > ')
  test_cases.push([concatenated_test_description, test, opts])
}

itParallel.only = (
  description: string,
  test: TestFn,
) => itParallel(description, test, { only: true })

itParallel.skip = (
  description: string,
  test: TestFn,
) => itParallel(description, test, { skip: true })

// export function testParallel(
//   description: string,
//   cases: TestCase[],
//   { fail_fast, only, skip, concurrency = Infinity }: {
//     fail_fast?: boolean
//     only?: boolean
//     skip?: boolean
//     concurrency?: number
//   } = {},
// ) {
//   const run = only ? it.only : skip ? it.skip : it
//   run(description, async () => {
//     const any_only = cases.some((test_case) => test_case[2]?.only)
//     const run_test_cases = any_only
//       ? cases.filter((test_case) => test_case[2]?.only)
//       : cases.filter((test_case) => !test_case[2]?.skip)

//     const failures: Array<Failure & { name: string }> = []

//     await forEach(run_test_cases, async ([name, fn]) => {
//       const result = await asResultAsync(() => Promise.resolve().then(fn))
//       if (isSuccess(result)) return
//       if (fail_fast) throw result.error
//       failures.push({ name, ...result })
//     }, { concurrency })

//     if (arrayIsEmpty(failures)) {
//       return
//     }

//     const message = failures
//       .map((f) => `[${f.name}] ${f.error.message}`)
//       .join('\n\n')

//     throw new AggregateError(failures.map((f) => f.error), message)
//   })
// }

// testParallel.only = (
//   description: string,
//   cases: TestCase[],
// ) => testParallel(description, cases, { only: true })

// testParallel.skip = (
//   description: string,
//   cases: TestCase[],
// ) => testParallel(description, cases, { skip: true })
