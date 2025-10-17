export default function pascalCase(str: string): string {
  if (!str) return ''

  return str
    // Replace special characters and underscores with spaces
    .replace(/[_\-\.]+/g, ' ')
    // Split on spaces or capital letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Split into words
    .split(/\s+/)
    // Filter out empty strings
    .filter((word) => word.length > 0)
    // Capitalize first letter of each word and lowercase the rest
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    // Join without spaces
    .join('')
}
