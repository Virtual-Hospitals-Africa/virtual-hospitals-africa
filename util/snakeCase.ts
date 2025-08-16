import { assertEquals } from 'std/assert/assert_equals.ts'

export default function snakeCase(str: string): string {
  // Handle null/undefined
  if (str == null) return ''

  // Convert to string
  str = String(str)

  // Handle empty string
  if (!str) return ''

  // Step 1: Handle special characters and split words
  // Replace non-alphanumeric characters with spaces
  str = str.replace(/[^\p{L}\p{N}]+/gu, ' ')

  // Step 2: Handle camelCase and PascalCase
  // Insert space before uppercase letters that follow lowercase letters or numbers
  str = str.replace(/(?<=[a-z0-9])(?=[A-Z])/g, ' ')

  // Insert space before uppercase letters followed by lowercase (for acronyms like "XMLParser" -> "XML Parser")
  str = str.replace(/(?<=[A-Z])(?=[A-Z][a-z])/g, ' ')

  // Step 3: Handle numbers
  // Insert space between letters and numbers
  str = str.replace(/(?<=[a-zA-Z])(?=[0-9])/g, ' ')
  str = str.replace(/(?<=[0-9])(?=[a-zA-Z])/g, ' ')

  // Step 4: Clean up and convert
  // Trim, convert to lowercase, and replace spaces with underscores
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

// // Alternative implementation using a more functional approach
// function snakeCaseAlt(str: string): string {
//   if (str == null) return '';

//   return String(str)
//     // First, handle non-word characters
//     .replace(/[^\p{L}\p{N}]+/gu, ' ')
//     // Handle camelCase/PascalCase boundaries
//     .replace(/(?<=[a-z0-9])(?=[A-Z])/g, ' ')
//     .replace(/(?<=[A-Z])(?=[A-Z][a-z])/g, ' ')
//     // Handle letter-number boundaries
//     .replace(/(?<=[a-zA-Z])(?=[0-9])/g, ' ')
//     .replace(/(?<=[0-9])(?=[a-zA-Z])/g, ' ')
//     // Final conversion
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, '_');
// }

// // Test cases to verify lodash compatibility
// const testCases = [
//   'camelCase',
//   'PascalCase',
//   'snake_case',
//   'kebab-case',
//   'SCREAMING_SNAKE_CASE',
//   'foo bar baz',
//   'fooBar123',
//   'XMLHttpRequest',
//   'IOError',
//   '123StartWithNumber',
//   'with.dots.between',
//   'with-dashes-between',
//   'with spaces between',
//   'with___multiple___underscores',
//   '',
//   null,
//   undefined,
//   123,
//   'français éclair café',
//   '你好世界'
// ];

// Example usage
assertEquals(snakeCase('camelCase'), 'camel_case')
assertEquals(snakeCase('PascalCase'), 'pascal_case')
assertEquals(snakeCase('kebab-case'), 'kebab_case')
assertEquals(snakeCase('foo bar baz'), 'foo_bar_baz')
assertEquals(snakeCase('XMLHttpRequest'), 'xml_http_request')
assertEquals(snakeCase('IOError'), 'io_error')
