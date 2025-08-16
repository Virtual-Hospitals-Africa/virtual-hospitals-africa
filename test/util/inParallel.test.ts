import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import * as inParallel from '../../util/inParallel.ts'
import range from '../../util/range.ts'

async function* eventually100() {
  yield* range(100)
}

async function* eventually10() {
  yield* range(10)
}

describe('inParallel.forEach', () => {
  it('processes items in parallel up to a concurrency limit', async () => {
    const proccessedItems: number[] = []
    await inParallel.forEach(
      eventually100(),
      async (item) => {
        if (item % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1))
        }
        proccessedItems.push(item)
      },
      { concurrency: 8 },
    )
    assertEquals(proccessedItems, [
      1,
      2,
      3,
      4,
      6,
      7,
      8,
      9,
      11,
      12,
      13,
      14,
      16,
      17,
      18,
      19,
      21,
      22,
      23,
      24,
      26,
      27,
      28,
      29,
      31,
      32,
      33,
      34,
      0, // 0 is finally processed because at this point there are 8 numbers that were delayed, namely (0, 5, 10, 15, 20, 25, 30, 35)
      36,
      37,
      38,
      39,
      5,
      41,
      42,
      43,
      44,
      10,
      46,
      47,
      48,
      49,
      15,
      51,
      52,
      53,
      54,
      20,
      56,
      57,
      58,
      59,
      25,
      61,
      62,
      63,
      64,
      30,
      66,
      67,
      68,
      69,
      35,
      71,
      72,
      73,
      74,
      40,
      76,
      77,
      78,
      79,
      45,
      81,
      82,
      83,
      84,
      50,
      86,
      87,
      88,
      89,
      55,
      91,
      92,
      93,
      94,
      60,
      96,
      97,
      98,
      99,
      65, // We process the 7 remaining items that were divisible by 5 that had been delayed
      70,
      75,
      80,
      85,
      90,
      95,
    ])
  })

  it('can set concurrency to 1', async () => {
    const proccessedItems: number[] = []
    await inParallel.forEach(
      eventually10(),
      async (item) => {
        await new Promise((resolve) => setTimeout(resolve, 0))
        proccessedItems.push(item)
      },
      { concurrency: 1 },
    )
    assertEquals(proccessedItems, range(10))
  })

  it('rejects with the first error and stops processing further', async () => {
    const proccessedItems: number[] = []
    await assertRejects(
      () =>
        inParallel.forEach(
          eventually100(),
          // deno-lint-ignore require-await
          async (item) => {
            if (item === 15) {
              throw new Error('Whoops!')
            }
            proccessedItems.push(item)
          },
          { concurrency: 8 },
        ),
      Error,
      'Whoops!',
    )
    assertEquals(proccessedItems, [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
    ])
  })
})

describe('pMap', () => {
  it('processes items in parallel up to a concurrency limit, but returns them in the order the source generator yields them were yielded', async () => {
    const proccessedItems: number[] = []
    const results = await inParallel.pMap(
      eventually100(),
      async (item) => {
        if (item % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1))
        }
        proccessedItems.push(item)
        return item
      },
      { concurrency: 8 },
    )
    assertEquals(results, range(100))
    assertEquals(proccessedItems, [
      1,
      2,
      3,
      4,
      6,
      7,
      8,
      9,
      11,
      12,
      13,
      14,
      16,
      17,
      18,
      19,
      21,
      22,
      23,
      24,
      26,
      27,
      28,
      29,
      31,
      32,
      33,
      34,
      0, // 0 is finally processed because at this point there are 8 numbers that were delayed, namely (0, 5, 10, 15, 20, 25, 30, 35)
      36,
      37,
      38,
      39,
      5,
      41,
      42,
      43,
      44,
      10,
      46,
      47,
      48,
      49,
      15,
      51,
      52,
      53,
      54,
      20,
      56,
      57,
      58,
      59,
      25,
      61,
      62,
      63,
      64,
      30,
      66,
      67,
      68,
      69,
      35,
      71,
      72,
      73,
      74,
      40,
      76,
      77,
      78,
      79,
      45,
      81,
      82,
      83,
      84,
      50,
      86,
      87,
      88,
      89,
      55,
      91,
      92,
      93,
      94,
      60,
      96,
      97,
      98,
      99,
      65, // We process the 7 remaining items that were divisible by 5 that had been delayed
      70,
      75,
      80,
      85,
      90,
      95,
    ])
  })

  it('rejects with the first error and stops processing further', async () => {
    const proccessedItems: number[] = []
    await assertRejects(
      () =>
        inParallel.pMap(
          eventually100(),
          // deno-lint-ignore require-await
          async (item) => {
            if (item === 15) {
              throw new Error('Whoops!')
            }
            proccessedItems.push(item)
          },
          { concurrency: 8 },
        ),
      Error,
      'Whoops!',
    )
    assertEquals(proccessedItems, [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
    ])
  })
})
