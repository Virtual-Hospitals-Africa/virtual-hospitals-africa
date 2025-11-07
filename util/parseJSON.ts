export default async function parseJSON(file_path: string) {
  return JSON.parse(await Deno.readTextFile(file_path))
}
