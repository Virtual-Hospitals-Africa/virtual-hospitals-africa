export default async function parseJSON(filePath: string) {
  try {
    return JSON.parse(await Deno.readTextFile(filePath))
  } catch (e) {
    console.error('Error parsing JSON file', filePath)
    throw e
  }
}
