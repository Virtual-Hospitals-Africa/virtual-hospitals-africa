/** Used to compose unicode character classes. */
const rs_astral_range = '\\ud800-\\udfff'
const rs_combo_marks_range = '\\u0300-\\u036f'
const re_combo_half_marks_range = '\\ufe20-\\ufe2f'
const rs_combo_symbols_range = '\\u20d0-\\u20ff'
const rs_combo_marks_extended_range = '\\u1ab0-\\u1aff'
const rs_combo_marks_supplement_range = '\\u1dc0-\\u1dff'
const rs_combo_range = rs_combo_marks_range + re_combo_half_marks_range +
  rs_combo_symbols_range + rs_combo_marks_extended_range +
  rs_combo_marks_supplement_range
const rs_dingbat_range = '\\u2700-\\u27bf'
const rs_lower_range = 'a-z\\xdf-\\xf6\\xf8-\\xff'
const rs_math_op_range = '\\xac\\xb1\\xd7\\xf7'
const rs_non_char_range = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf'
const rs_punctuation_range = '\\u2000-\\u206f'
const rsSpaceRange =
  ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000'
const rs_upper_range = 'A-Z\\xc0-\\xd6\\xd8-\\xde'
const rs_var_range = '\\ufe0e\\ufe0f'
const rs_break_range = rs_math_op_range + rs_non_char_range +
  rs_punctuation_range +
  rsSpaceRange

/** Used to compose unicode capture groups. */
const rs_apos = "['\u2019]"
const rs_break = `[${rs_break_range}]`
const rs_combo = `[${rs_combo_range}]`
const rs_digit = '\\d'
const rs_dingbat = `[${rs_dingbat_range}]`
const rs_lower = `[${rs_lower_range}]`
const rs_misc = `[^${rs_astral_range}${rs_break_range + rs_digit + rs_dingbat_range + rs_lower_range + rs_upper_range}]`
const rs_fitz = '\\ud83c[\\udffb-\\udfff]'
const rs_modifier = `(?:${rs_combo}|${rs_fitz})`
const rs_non_astral = `[^${rs_astral_range}]`
const rs_regional = '(?:\\ud83c[\\udde6-\\uddff]){2}'
const rs_surr_pair = '[\\ud800-\\udbff][\\udc00-\\udfff]'
const rs_upper = `[${rs_upper_range}]`
const rs_z_w_j = '\\u200d'

/** Used to compose unicode regexes. */
const rs_misc_lower = `(?:${rs_lower}|${rs_misc})`
const rs_misc_upper = `(?:${rs_upper}|${rs_misc})`
const rs_opt_contr_lower = `(?:${rs_apos}(?:d|ll|m|re|s|t|ve))?`
const rs_opt_contr_upper = `(?:${rs_apos}(?:D|LL|M|RE|S|T|VE))?`
const re_opt_mod = `${rs_modifier}?`
const rs_opt_var = `[${rs_var_range}]?`
const rs_opt_join = `(?:${rs_z_w_j}(?:${[rs_non_astral, rs_regional, rs_surr_pair].join('|')})${rs_opt_var + re_opt_mod})*`
const rs_ord_lower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])'
const rs_ord_upper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])'
const rs_seq = rs_opt_var + re_opt_mod + rs_opt_join
const rs_emoji = `(?:${[rs_dingbat, rs_regional, rs_surr_pair].join('|')})${rs_seq}`

const re_unicode_words = RegExp(
  [
    `${rs_upper}?${rs_lower}+${rs_opt_contr_lower}(?=${[rs_break, rs_upper, '$'].join('|')})`,
    `${rs_misc_upper}+${rs_opt_contr_upper}(?=${[rs_break, rs_upper + rs_misc_lower, '$'].join('|')})`,
    `${rs_upper}?${rs_misc_lower}+${rs_opt_contr_lower}`,
    `${rs_upper}+${rs_opt_contr_upper}`,
    rs_ord_upper,
    rs_ord_lower,
    `${rs_digit}+`,
    rs_emoji,
  ].join('|'),
  'g',
)

/**
 * Splits a Unicode `string` into an array of its words.
 *
 * @private
 * @param {string} The string to inspect.
 * @returns {Array} Returns the words of `string`.
 */
function unicodeWords(str: string) {
  return str.match(re_unicode_words)
}

export default unicodeWords
