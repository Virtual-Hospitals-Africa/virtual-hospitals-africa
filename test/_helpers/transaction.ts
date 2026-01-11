import { it } from 'std/testing/bdd.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import db from '../../db/db.ts'
import { TrxOrDb } from '../../types.ts'

const withTrx = (callback: (trx: TrxOrDb) => Promise<void>) => db.transaction().setIsolationLevel('read committed').execute(callback)

export function itUsesTrxAnd(
  description: string,
  callback?: (trx: TrxOrDb) => Promise<void>,
  opts: { only?: boolean; skip?: boolean } = {},
) {
  const { only, skip } = opts
  const _it = only ? it.only : skip ? it.skip : it
  _it(
    description,
    () => callback && withTrx(callback),
  )
}

itUsesTrxAnd.only = (
  description: string,
  callback: (trx: TrxOrDb) => Promise<void>,
) => itUsesTrxAnd(description, callback, { only: true })

itUsesTrxAnd.skip = (
  description: string,
  callback?: (trx: TrxOrDb) => Promise<void>,
) => itUsesTrxAnd(description, callback, { skip: true })

itUsesTrxAnd.rejects = (
  description: string,
  callback: (trx: TrxOrDb) => Promise<void>,
  validateError?: (
    error: Error & {
      cause?: {
        fields?: {
          severity: string
          code: string
          message: string
          detail: string
          schema: string
          table: string
          constraint: string
          file: string
          line: string
          routine: string
        }
      }
    },
  ) => void,
) =>
  it('rejects when ' + description, async () => {
    const error = await assertRejects(() => withTrx(callback))
    // deno-lint-ignore no-explicit-any
    validateError?.(error as any)
  })
