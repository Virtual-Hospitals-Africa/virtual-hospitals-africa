import { assert } from 'std/assert/assert.ts'

const USE_DOCKER_QUICKSTART = !!Deno.env.get('USE_DOCKER_QUICKSTART')

export function getEnvVariableRequiredOutsideDockerQuickstart(
  name: string,
) {
  const value = Deno.env.get(name)
  if (!USE_DOCKER_QUICKSTART) {
    assert(value, `Must have ${name} environment variable set`)
  }
  return value
}
