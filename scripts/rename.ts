import { walk } from 'std/fs/mod.ts'
import { forEach } from '../util/inParallel.ts'
import { combineAsyncIterables } from '../util/combineAsyncIterables.ts'
import * as path from 'std/path/mod.ts'
import { pooledMap } from 'std/async/pool.ts'

const ignore_paths = [
  'db/codegen',
]

const dirs = [
  'db',
  'chatbot',
  'components',
  'external-clients',
  'islands',
  // 'scripts',
  'routes',
  'shared',
  'static',
  'test',
  'token_refresher',
]

async function* walkFiles(directory: string) {
  for await (const entry of walk(directory)) {
    if (!entry.isFile) continue
    if (ignore_paths.some((path) => entry.path.includes(path))) continue
    yield entry.path
  }
}

async function* walkDirectories(directories: string[]) {
  yield* combineAsyncIterables(directories.map(walkFiles))
}

async function rename({ files, directories, to_rename }: {
  files: string[]
  directories: string[]
  to_rename: [string, string][]
}) {
  const replacements = to_rename.map(([old_text, new_text]) => {
    const regex = new RegExp(old_text, 'g')
    return (str: string): string => str.replace(regex, new_text)
  })
  const replace_all = (str: string) =>
    replacements.reduce((str, replace) => replace(str), str)

  async function replaceInFile(file_path: string) {
    const new_file_path = replace_all(file_path)
    if (file_path !== new_file_path) {
      const dirname = path.dirname(new_file_path)
      await Deno.mkdir(dirname, { recursive: true })
      await Deno.rename(file_path, new_file_path)
      file_path = new_file_path
    }

    const original_content = await Deno.readTextFile(file_path)
    const new_content = replace_all(original_content)
    if (original_content !== new_content) {
      await Deno.writeTextFile(file_path, new_content)
    }
  }

  await forEach(walkDirectories(directories), replaceInFile)
  await forEach(files, replaceInFile)
}

if (import.meta.main) {
  await rename({
    files: ['types.ts'],
    directories: dirs,
    to_rename: [
      ["'organizations'", "'organizations'"],
      ['facilities', 'organizations'],
      ['facility', 'organization'],
    ],
  })
}
