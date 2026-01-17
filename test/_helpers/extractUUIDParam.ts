import { CheerioAPI } from 'cheerio'
import isString from '../../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import { isUUID } from '../../util/uuid.ts'

export function extractUUIDParam($: CheerioAPI & { url: string } | URL | string, preceding_path: string) {
  const url = getUrl()
  const match = url.match(new RegExp(`${preceding_path}\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})`))
  assert(match, `No match found for ${url} at path ${preceding_path}`)
  const [, id] = match
  assert(isUUID(id))
  return id

  function getUrl(): string {
    if (isString($)) return $
    if ($ instanceof URL) return String($)
    if ('url' in $ && isString($.url)) return $.url
    throw new Error(`Could not find url in ${$}`)
  }
}
