import { describe, it } from 'std/testing/bdd.ts'
import {
  asResultAsync,
  Failure,
  isSuccess,
} from '../../util/asResult.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { forEach } from '../../util/inParallel.ts'
import { assert } from 'node:console'

type TestFn = () => void | Promise<void>

export type TestCase =
  | [name: string, fn: TestFn]
  | [
    name: string,
    fn: TestFn,
    opts: { only?: boolean; skip?: boolean },
  ]

  
async function runTestCases(
  cases: TestCase[],
{ fail_fast, concurrency = Infinity }: {
    fail_fast?: boolean
    concurrency?: number
  } = {}) {
    console.log('running cases, ', cases.length)
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
  }

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


let descriptions: string[] = []
let test_cases: TestCase[] = []
export function describeParallel(
  description: string,
  callback: () => void,
  opts: { only?: boolean, skip?: boolean} = {}
) {
  const run = opts.only ? describe.only : opts.skip ? describe.skip : describe
  const is_top_level = !descriptions.length
  const this_descriptions = [...descriptions]
  if (!is_top_level) {
    throw new Error('Try this for now')
    descriptions = [...descriptions, description]
  }
  
  run(description, () => {
    callback()
    console.log(test_cases)
    assert(test_cases.length > 0)
    const cases_to_run = test_cases
    it('passes', async () => {
      await runTestCases(cases_to_run)
    })
  })

  test_cases = []

  // descriptions = this_descriptions
  // if (is_top_level) {
  //   console.log('here', description)
  //   // testParallel(description, test_cases)
  //   return
  // }
}

describeParallel.only = (
  description: string,
  callback: () => void
) => describeParallel(description, callback, { only: true })

describeParallel.skip = (
  description: string,
  callback: () => void
) => describeParallel(description, callback, { skip: true })

export function itParallel(
  description: string,
  test: TestFn,
  opts: { only?: boolean, skip?: boolean} = {}
) {
  const x = [...descriptions, description].join(' > ')
  console.log('mwekmwekl', x)
  test_cases.push([x, test, opts])
}

itParallel.only = (
  description: string,
  test: TestFn
) => itParallel(description, test, { only: true })

itParallel.skip = (
  description: string,
  test: TestFn
) => itParallel(description, test, { skip: true })
