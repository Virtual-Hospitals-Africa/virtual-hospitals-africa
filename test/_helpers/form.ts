import * as cheerio from 'cheerio'
import set from '../../util/set.ts'
import { parseParam } from '../../util/parseForm.ts'
import last from '../../util/last.ts'

export function getFormValues($: cheerio.CheerioAPI): unknown {
  const form_values = {}
  $('form input,textarea').each((_i, el) => {
    if (!el.attribs.name) return
    if (el.attribs.type === 'checkbox') {
      return set(
        form_values,
        el.attribs.name,
        'checked' in el.attribs,
      )
    }
    if (el.attribs.type !== 'radio' || ('checked' in el.attribs)) {
      const key = el.attribs.name && last(el.attribs.name.split('.'))
      set(
        form_values,
        el.attribs.name,
        el.attribs.value ? parseParam(key, el.attribs.value) : null,
      )
    }
  })
  $('form select').each((_i, el) => {
    let value = null
    $(el).find('option[selected]').each((_i, option) => {
      const key = option.attribs.name && last(el.attribs.name.split('!'))
      value = option.attribs.value && parseParam(key, option.attribs.value)
    })
    if (el.attribs.name) {
      set(
        form_values,
        el.attribs.name,
        value,
      )
    }
  })
  return form_values
}

export function getFormDisplay($: cheerio.CheerioAPI): unknown {
  const form_display = {}
  $('form input,textarea').each((_i, el) => {
    if (el.attribs.type !== 'hidden' && el.attribs.name) {
      set(
        formDisplay,
        el.attribs.name,
        el.attribs.value ?? null,
      )
    }
  })
  $('form select').each((_i, el) => {
    $(el).find('option[selected]').each((_i, option) => {
      if (el.attribs.name) {
        set(
          formDisplay,
          el.attribs.name,
          $(option).text(),
        )
      }
    })
  })
  return formDisplay
}
