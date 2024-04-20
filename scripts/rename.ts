import { walk } from 'std/fs/mod.ts'
import { forEach } from '../util/inParallel.ts'
import { combineAsyncIterables } from '../util/combineAsyncIterables.ts'
import * as path from 'std/path/mod.ts'
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
  await forEach(walkDirectories(directories), async (file_path) => {
    const new_file_path = file_path.replace(oldText, newText)
    if (file_path !== new_file_path) {
      
      const dirname = path.dirname(new_file_path)
      await Deno.mkdir(dirname, { recursive: true })
      await Deno.rename(file_path, new_file_path)
      file_path = new_file_path
    }

    const original_content = await Deno.readTextFile(file_path)
    const new_content = original_content.replace(regex, newText)
    if (original_content !== new_content) {
      await Deno.writeTextFile(file_path, new_content)
    }
  })
}

if (import.meta.main) {
  await rename(dirs, "'organizations'", "'organizations'")
  await rename(dirs, 'organizations', 'organizations')
  await rename(dirs, 'organization', 'organization')
}
