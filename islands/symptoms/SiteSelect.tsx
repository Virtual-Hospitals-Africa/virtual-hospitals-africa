import {
  Select,
  SelectWithOptions,
} from '../../components/library/form/Inputs.tsx'
import { Maybe } from '../../types.ts'
import { BODY_PARTS } from '../../shared/body_parts.ts'
import capitalize from '../../util/capitalize.ts'

function AllSiteOptions({ selected }: { selected?: string }) {
  return (
    <>
      <option selected={!selected}>Unspecified</option>
      {BODY_PARTS.map(([body_part, sites]) => (
        <optgroup label={body_part} key={body_part}>
          {sites.map((site) => (
            <option key={site} value={site} selected={site === selected}>
              {site}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  )
}

export function SiteSelect({
  name,
  sites,
  value,
}: {
  name: string
  sites: ['*'] | string[]
  value?: Maybe<string>
}) {
  if (sites.length === 1 && sites[0] === '*') {
    return (
      <Select
        name={name}
        label='Site'
        className='capitalize'
      >
        <AllSiteOptions selected={value ?? undefined} />
      </Select>
    )
  }

  if (!sites.length) return null

  return (
    <SelectWithOptions
      name={name}
      label='Site'
      options={sites.map((s) => capitalize(s))}
      value={value ?? undefined}
      className='capitalize'
    />
  )
}
