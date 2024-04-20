import { walk } from 'std/fs/mod.ts'
import { forEach } from '../util/inParallel.ts'
import { combineAsyncIterables } from '../util/combineAsyncIterables.ts'
import { pooledMap } from "std/async/pool.ts";

const ignore_paths = [
  'db/codegen'
]

const dirs = [
  'db',
  'chatbot',
  'components',
  'external-clients',
  'islands',
  'scripts',
  'routes',
  'shared',
  'static',
  'test',
  'token_refresher'
]

async function * walkFiles(directory: string) {
  for await (const entry of walk(directory)) {
    if (!entry.isFile) continue
    if (ignore_paths.some((path) => entry.path.includes(path))) continue
    yield entry.path
  }
}

async function * walkDirectories(directories: string[]) {
  yield * combineAsyncIterables(directories.map(walkFiles))
}

async function rename(
  directories: string[],
  oldText: string,
  newText: string,
) {
  const regex = new RegExp(oldText, 'g')
  await forEach(walkDirectories(directories), async (path) => {
    const newFilePath = path.replace(oldText, newText)
    if (path !== newFilePath) {
      await Deno.rename(path, newFilePath)
      path = newFilePath
    }

    const originalContent = await Deno.readTextFile(path)
    const newContent = originalContent.replace(regex, newText)
    if (originalContent !== newContent) {
      await Deno.writeTextFile(path, newContent)
    }
  })
}

if (import.meta.main) {
  await rename(dirs, "'facilities'", "'Organization'")
  await rename(dirs, 'facilities', 'organizations')
  await rename(dirs, 'facility', 'organization')
}

