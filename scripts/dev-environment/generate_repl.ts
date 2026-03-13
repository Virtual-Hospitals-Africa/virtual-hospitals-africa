// Is this better?
console.log(`import db from './db/db.ts'`)

const cwd = Deno.cwd()

async function loadAllModules(dir: string) {
  // deno-lint-ignore no-explicit-any
  const modules: any = {}
  const qualified_dir = dir.startsWith(cwd) ? dir : `${cwd}${dir}`
  const path = qualified_dir.slice(cwd.length)
  for await (const in_dir of Deno.readDir(qualified_dir)) {
    if (in_dir.isSymlink) {
      throw new Error('Symlinks are not supported: ' + in_dir.name)
    }
    if (in_dir.isDirectory) {
      modules[in_dir.name] = await loadAllModules(
        `${qualified_dir}/${in_dir.name}`,
      )
      continue
    }
    const file = in_dir
    const [file_name, file_ext] = file.name.split('.')
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
      file_name).replaceAll('-', '_').replaceAll(
        '[',
        '',
      ).replaceAll(']', '')
    if (just_default_export) {
      console.log(`import ${x} from '.${path}/${file_name}.${file_ext}'`)
    } else {
      console.log(`import * as ${x} from '.${path}/${file_name}.${file_ext}'`)
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
