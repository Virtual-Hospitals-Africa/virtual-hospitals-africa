import assertHasProperty from './util/assertHasProperty.ts'
import { humanReadableJson } from './util/humanReadableJson.ts'

const [util, ...args] = Deno.args

let to_import = util.includes('/') ? util : `./util/${util}.ts`
if (!to_import.startsWith('./')) {
  to_import = `./${to_import}`
}

const module = await import(to_import)

assertHasProperty(module, 'default')

const result = await module.default(...args)

console.log(humanReadableJson(result))
