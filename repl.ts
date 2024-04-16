// deno-lint-ignore-file no-explicit-any no-unused-vars
import db from './db/db.ts'

async function loadAllModules(dir: string) {
  const modules: any = {}
  const importing: Promise<any>[] = []
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
      return modules[fileName] = just_default_export ? module.default : module
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

const [models, migrations, util, routes, shared, externalClients] = await loadAll([
  './db/models',
  './db/migrations',
  './util',
  './routes',
  './shared',
  './external-clients',
])
