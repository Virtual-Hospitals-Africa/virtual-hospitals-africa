// deno-lint-ignore-file no-explicit-any no-unused-vars
import db from './db/db.ts'
import * as helpers from './db/helpers.ts'

const ignore_file_extensions = new Set([
  'txt',
  'py',
  'tsv',
  'csv',
  'json',
  'sh',
  'DS_Store',
])

const skip_directories = new Set([
  'dumps',
  'resources',
  'node_modules',
])

async function loadAllModules(dir: string) {
  const modules: any = {}
  const importing: Promise<any>[] = []
  for await (const in_directory of Deno.readDir(dir)) {
    if (
      in_directory.isDirectory && skip_directories.has(in_directory.name)
    ) {
      continue
    }
    if (in_directory.isSymlink) {
      // throw new Error('Symlinks are not supported: ' + in_directory.name)
      continue
    }
    if (in_directory.isDirectory) {
      loadAllModules(
        `${dir}/${in_directory.name}`,
      ).then((module) => {
        modules[in_directory.name] = module
      })
      continue
    }
    const file = in_directory
    const [file_name, extension] = file.name.split('.')
    if (ignore_file_extensions.has(extension)) continue
    const importing_module = import(`${dir}/${file.name}`).then((module) => {
      let just_default_export = true
      if (!module.default) {
        just_default_export = false
      } else {
        for (const key in module) {
          if (key !== 'default') {
            just_default_export = false
            break
          }
        }
      }
      return modules[file_name] = just_default_export ? module.default : module
    })
    importing.push(importing_module)
  }
  await Promise.all(importing)
  return modules
}

async function loadAll(to_import: string[]) {
  const modules: any[] = []
  const importing: Promise<any>[] = []
  to_import.forEach((dir, i) => {
    const importing_module = loadAllModules(dir).then((module) => {
      modules[i] = module
    })
    importing.push(importing_module)
  })
  await Promise.all(importing)
  return modules
}

// Add these to the repl's scope
const [
  models,
  migrations,
  util,
  routes,
  shared,
  externalClients,
  components,
  islands,
  mocks,
] = await loadAll([
  './db/models',
  './db/migrations',
  './util',
  './routes',
  './shared',
  './external-clients',
  './components',
  './islands',
  './mocks',
])

await loadAllModules('./db').then((x) => {
  delete x['db']
  Object.assign(db, x)
})
