export default async function parseJSON(filePath: string) {
  return JSON.parse(await Deno.readTextFile(filePath))
}
