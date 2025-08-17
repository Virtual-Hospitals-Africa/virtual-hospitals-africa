import { assert } from 'std/assert/assert.ts'

const USE_DOCKER_QUICKSTART = Deno.env.has('USE_DOCKER_QUICKSTART')
const NO_EXTERNAL_CONNECT = Deno.env.has('NO_EXTERNAL_CONNECT')

export function getEnvVariableRequiredOutsideDockerQuickstart(
  name: string,
) {
  const value = Deno.env.get(name)
  if (!USE_DOCKER_QUICKSTART && !NO_EXTERNAL_CONNECT) {
    assert(value, `Must have ${name} environment variable set`)
  }
  return value
}
