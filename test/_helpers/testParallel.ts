import { describe, it } from 'std/testing/bdd.ts'
import { asResultAsync, Failure, isSuccess } from '../../util/asResult.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { forEach } from '../../util/inParallel.ts'
import { assert } from 'std/assert/assert.ts'
import { pluralize } from '../../util/pluralize.ts'
import partition from '../../util/partition.ts'

type TestFn = () => void | Promise<void>

const MAX_PARALLEL_TESTS = parseInt(Deno.env.get('MAX_PARALLEL_TESTS')!) || 8

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
  { fail_fast, concurrency = MAX_PARALLEL_TESTS }: {
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
