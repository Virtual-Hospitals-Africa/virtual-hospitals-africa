export default async function parseJSON(file_path: string) {
  const contents = await Deno.readTextFile(file_path)
  return JSON.parse(contents)
}

export function parseJSONSync(file_path: string) {
  const contents = Deno.readTextFileSync(file_path)
  return JSON.parse(contents)
}
