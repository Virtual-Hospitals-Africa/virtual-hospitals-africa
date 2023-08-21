import { assertEquals } from 'std/testing/asserts.ts'
import { AdminDistricts } from '../types.ts'
import { filterDistrictsByKey } from '../islands/patient-address-inputs.tsx'

Deno.test('filterDistrictsByKey should returns one filtered province based on the provided country info with only one match', () => {
  const itemId: keyof AdminDistricts = 'provinceId'
  const itemName: keyof AdminDistricts = 'provinceName'
  const filterKey: keyof AdminDistricts = 'countryId'
  const filterValue: AdminDistricts['countryId'] = 1
  const adminDistricts: AdminDistricts[] = [
    {
      countryId: 2,
      countryName: 'Country2',
      provinceId: 1,
      provinceName: 'Province1',
      districtId: 1,
      districtName: 'District1',
      wardId: 1,
      wardName: 'Ward1',
      suburbId: 1,
      suburbName: 'Suburb1',
    },
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 2,
      provinceName: 'Province2',
      districtId: 3,
      districtName: 'District3',
      wardId: 2,
      wardName: 'Ward2',
      suburbId: 2,
      suburbName: 'Suburb2',
    },
  ]

  const expectedResult = [
    {
      id: 2,
      name: 'Province2',
    },
  ]

  assertEquals(
    filterDistrictsByKey(
      itemId,
      itemName,
      adminDistricts,
      filterKey,
      filterValue,
    ),
    expectedResult,
  )
})

Deno.test('filterDistrictsByKey should returns two filtered provinces based on the provided country info with two matches', () => {
  const itemId: keyof AdminDistricts = 'provinceId'
  const itemName: keyof AdminDistricts = 'provinceName'
  const filterKey: keyof AdminDistricts = 'countryId'
  const filterValue: AdminDistricts['countryId'] = 1
  const adminDistricts: AdminDistricts[] = [
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 1,
      provinceName: 'Province1',
      districtId: 1,
      districtName: 'District1',
      wardId: 1,
      wardName: 'Ward1',
      suburbId: 1,
      suburbName: 'Suburb1',
    },
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 2,
      provinceName: 'Province2',
      districtId: 3,
      districtName: 'District3',
      wardId: 2,
      wardName: 'Ward2',
      suburbId: 2,
      suburbName: 'Suburb2',
    },
  ]

  const expectedResult = [
    {
      id: 1,
      name: 'Province1',
    },
    {
      id: 2,
      name: 'Province2',
    },
  ]

  assertEquals(
    filterDistrictsByKey(
      itemId,
      itemName,
      adminDistricts,
      filterKey,
      filterValue,
    ),
    expectedResult,
  )
})

Deno.test('filterDistrictsByKey should returns two filtered provinces based on the provided country info with two matched and unique provinces', () => {
  const itemId: keyof AdminDistricts = 'provinceId'
  const itemName: keyof AdminDistricts = 'provinceName'
  const filterKey: keyof AdminDistricts = 'countryId'
  const filterValue: AdminDistricts['countryId'] = 1
  const adminDistricts: AdminDistricts[] = [
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 1,
      provinceName: 'Province1',
      districtId: 1,
      districtName: 'District1',
      wardId: 1,
      wardName: 'Ward1',
      suburbId: 1,
      suburbName: 'Suburb1',
    },
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 2,
      provinceName: 'Province2',
      districtId: 3,
      districtName: 'District3',
      wardId: 2,
      wardName: 'Ward2',
      suburbId: 2,
      suburbName: 'Suburb2',
    },
  ]

  const expectedResult = [
    {
      id: 1,
      name: 'Province1',
    },
    {
      id: 2,
      name: 'Province2',
    },
  ]

  assertEquals(
    filterDistrictsByKey(
      itemId,
      itemName,
      adminDistricts,
      filterKey,
      filterValue,
    ),
    expectedResult,
  )
})

Deno.test('filterDistrictsByKey should returns empty array when nothing matches', () => {
  const itemId: keyof AdminDistricts = 'provinceId'
  const itemName: keyof AdminDistricts = 'provinceName'
  const filterKey: keyof AdminDistricts = 'countryId'
  const filterValue: AdminDistricts['countryId'] = 3
  const adminDistricts: AdminDistricts[] = [
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 1,
      provinceName: 'Province1',
      districtId: 1,
      districtName: 'District1',
      wardId: 1,
      wardName: 'Ward1',
      suburbId: 1,
      suburbName: 'Suburb1',
    },
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 2,
      provinceName: 'Province2',
      districtId: 3,
      districtName: 'District3',
      wardId: 2,
      wardName: 'Ward2',
      suburbId: 2,
      suburbName: 'Suburb2',
    },
  ]

  const expectedResult: { id: number; name: string }[] = []

  assertEquals(
    filterDistrictsByKey(
      itemId,
      itemName,
      adminDistricts,
      filterKey,
      filterValue,
    ),
    expectedResult,
  )
})

Deno.test('filterDistrictsByKey should returns empty array when adminDistricts is an empty array', () => {
  const itemId: keyof AdminDistricts = 'provinceId'
  const itemName: keyof AdminDistricts = 'provinceName'
  const filterKey: keyof AdminDistricts = 'countryId'
  const filterValue: AdminDistricts['countryId'] = 3
  const adminDistricts: AdminDistricts[] = []

  const expectedResult: { id: number; name: string }[] = []

  assertEquals(
    filterDistrictsByKey(
      itemId,
      itemName,
      adminDistricts,
      filterKey,
      filterValue,
    ),
    expectedResult,
  )
})

Deno.test('filterDistrictsByKey should returns empty array when filterValue is undefined', () => {
  const itemId: keyof AdminDistricts = 'provinceId'
  const itemName: keyof AdminDistricts = 'provinceName'
  const filterKey: keyof AdminDistricts = 'countryId'
  const filterValue = undefined
  const adminDistricts: AdminDistricts[] = [
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 1,
      provinceName: 'Province1',
      districtId: 1,
      districtName: 'District1',
      wardId: 1,
      wardName: 'Ward1',
      suburbId: 1,
      suburbName: 'Suburb1',
    },
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 2,
      provinceName: 'Province2',
      districtId: 3,
      districtName: 'District3',
      wardId: 2,
      wardName: 'Ward2',
      suburbId: 2,
      suburbName: 'Suburb2',
    },
  ]

  const expectedResult: { id: number; name: string }[] = []

  assertEquals(
    filterDistrictsByKey(
      itemId,
      itemName,
      adminDistricts,
      filterKey,
      filterValue,
    ),
    expectedResult,
  )
})

Deno.test('filterDistrictsByKey should returns one filtered province based on the provided country info with two matched but identical provinces', () => {
  const itemId: keyof AdminDistricts = 'provinceId'
  const itemName: keyof AdminDistricts = 'provinceName'
  const filterKey: keyof AdminDistricts = 'countryId'
  const filterValue: AdminDistricts['countryId'] = 1
  const adminDistricts: AdminDistricts[] = [
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 1,
      provinceName: 'Province1',
      districtId: 1,
      districtName: 'District1',
      wardId: 1,
      wardName: 'Ward1',
      suburbId: 1,
      suburbName: 'Suburb1',
    },
    {
      countryId: 1,
      countryName: 'Country1',
      provinceId: 1,
      provinceName: 'Province1',
      districtId: 3,
      districtName: 'District3',
      wardId: 2,
      wardName: 'Ward2',
      suburbId: 2,
      suburbName: 'Suburb2',
    },
  ]

  const expectedResult = [
    {
      id: 1,
      name: 'Province1',
    },
  ]

  assertEquals(
    filterDistrictsByKey(
      itemId,
      itemName,
      adminDistricts,
      filterKey,
      filterValue,
    ),
    expectedResult,
  )
})
