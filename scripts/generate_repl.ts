// Is this better?
console.log(`import db from './db/db.ts'`)

const cwd = Deno.cwd()

async function loadAllModules(dir: string) {
  // deno-lint-ignore no-explicit-any
  const modules: any = {}
  const qualified_dir = dir.startsWith(cwd) ? dir : `${cwd}${dir}`
  const path = qualified_dir.slice(cwd.length)
  for await (const inDir of Deno.readDir(qualified_dir)) {
    if (inDir.isSymlink) {
      throw new Error('Symlinks are not supported: ' + inDir.name)
    }
    if (inDir.isDirectory) {
      modules[inDir.name] = await loadAllModules(
        `${qualified_dir}/${inDir.name}`,
      )
      continue
    }
    const file = inDir
    const [fileName, fileExt] = file.name.split('.')
    const module = await import(`${qualified_dir}/${file.name}`)
    if (Object.keys(module).length === 0) {
      continue
    }
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

    const x = (path.replace(/^\/db/, '').slice(1).replaceAll(
      '/',
      '$',
    ) + '$' +
      fileName).replaceAll('-', '_').replaceAll(
        '[',
        '',
      ).replaceAll(']', '')
    if (just_default_export) {
      console.log(`import ${x} from '.${path}/${fileName}.${fileExt}'`)
    } else {
      console.log(`import * as ${x} from '.${path}/${fileName}.${fileExt}'`)
    }
  }
}

async function loadAll(to_import: string[]) {
  for (const dir of to_import) {
    await loadAllModules(dir)
  }
}

await loadAll([
  '/db/models',
  '/db/migrations',
  '/util',
  '/routes',
  '/shared',
  '/external-clients',
  '/components',
  '/islands',
])
