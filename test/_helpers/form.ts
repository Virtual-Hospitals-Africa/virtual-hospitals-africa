import * as cheerio from 'cheerio'
import set from '../../util/set.ts'
import { parseParam } from '../../util/parseForm.ts'
import last from '../../util/last.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

export function getFormValues($: cheerio.CheerioAPI): unknown {
  const form_values = {}
  $('form input,textarea').each((_i, el) => {
    if (!el.attribs.name) return
    if (el.attribs.type === 'checkbox') {
      if ('checked' in el.attribs) {
        const value = el.attribs.value || true
        set(
          form_values,
          el.attribs.name,
          value,
        )
      }
      return
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

export function getFormLabels($: cheerio.CheerioAPI): unknown {
  const form_labels = {}
  $('form input,textarea,select').each((_i, el) => {
    if (el.attribs.type === 'hidden' || !el.attribs.name) {
      return
    }
    return set(
      form_labels,
      el.attribs.name,
      findLabel().text(),
    )

    function findLabel() {
      if (el.attribs['aria-labelledby']) {
        const by_labelledby = $(`label[id="${el.attribs['aria-labelledby']}"]`)
        if (!by_labelledby.length) {
          throw new Error(
            `element declared it was labelled by ${
              el.attribs['aria-labelledby']
            } but no such element was found`,
          )
        }
        return by_labelledby
      }
      if (el.attribs.id) {
        const by_id = $(`label[for="${el.attribs.id}"]`)
        if (by_id.length) return by_id
      }
      const closest = $(el).closest('label')
      if (closest.length) return closest

      throw new Error(`No label found for ${humanReadableJson(el.attribs)}`)
    }
  })
  return form_labels
}

export function getFormOptions($: cheerio.CheerioAPI): unknown {
  const form_options: Record<
    string,
    Array<{ label: string; value: string; selected: boolean }>
  > = {}
  $('form select').each((_i, el) => {
    if (!el.attribs.name) return
    const options: Array<{ label: string; value: string; selected: boolean }> =
      []
    $(el).find('option').each((_i, option) => {
      options.push({
        label: option.attribs.label ?? $(option).text(),
        value: option.attribs.value ?? '',
        selected: 'selected' in option.attribs,
      })
    })
    set(form_options, el.attribs.name, options)
  })
  return form_options
}
