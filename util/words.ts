// deno-lint-ignore-file no-control-regex
import unicodeWords from './internal/unicodeWords.ts'

const has_unicode_word = RegExp.prototype.test.bind(
  /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
)

/** Used to match words composed of alphanumeric characters. */
const re_ascii_word = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g

function asciiWords(str: string) {
  return str.match(re_ascii_word)
}

/**
 * Splits `string` into an array of its words.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {RegExp|string} [pattern] The pattern to match words.
 * @returns {Array} Returns the words of `string`.
 * @example
 *
 * words('fred, barney, & pebbles')
 * // => ['fred', 'barney', 'pebbles']
 *
 * words('fred, barney, & pebbles', /[^, ]+/g)
 * // => ['fred', 'barney', '&', 'pebbles']
 */
function words(str: string, pattern?: RegExp | string) {
  if (pattern === undefined) {
    const result = has_unicode_word(str) ? unicodeWords(str) : asciiWords(str)
    return result || []
  }
  return str.match(pattern) || []
}

export default words
