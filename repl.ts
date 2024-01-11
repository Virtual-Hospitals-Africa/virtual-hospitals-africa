// deno-lint-ignore-file no-explicit-any no-unused-vars
// deno-lint-ignore-file no-unused-vars
import { load } from 'std/dotenv/mod.ts'
import db from './db/db.ts'
import { assert } from 'std/assert/assert.ts'

async function loadAllModules(dir: string) {
  const modules: any = {}
  for await (const inDir of Deno.readDir(dir)) {
    if (inDir.isSymlink) {
      throw new Error('Symlinks are not supported: ' + inDir.name)
    }
    if (inDir.isDirectory) {
      modules[inDir.name] = await loadAllModules(`${dir}/${inDir.name}`)
      continue
    }
    const file = inDir
    const [fileName, fileExt] = file.name.split('.')
    const module = await import(`${dir}/${file.name}`)
    modules[fileName] = module
  }
  return modules
}

const models: any = await loadAllModules('./db/models')
const util: any = await loadAllModules('./util')
const routes: any = await loadAllModules('./routes')
