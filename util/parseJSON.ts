export default async function parseJSON(filePath: string) {
  try {
    return JSON.parse(await Deno.readTextFile(filePath))
  } catch (e) {
    console.log(filePath + ': ' + e.message)
  }
}
