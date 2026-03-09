import * as cheerio from 'cheerio'
import set from '../../util/set.ts'
import { parseParam } from '../../backend/parseForm.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'
import compactMap from '../../util/compactMap.ts'
import { groupBy } from '../../util/groupBy.ts'
import uniq from '../../util/uniq.ts'
import { get } from '../../util/get.ts'

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
      set(
        form_values,
        el.attribs.name,
        el.attribs.value ? parseParam(el.attribs.value) : null,
      )
    }
    if (el.attribs.type === 'radio' && ('defaultchecked' in el.attribs) && !get(form_values, el.attribs.name)) {
      set(
        form_values,
        el.attribs.name,
        el.attribs.value ? parseParam(el.attribs.value) : null,
      )
    }
    if (el.attribs.type === 'radio' && !('checked' in el.attribs) && !('defaultchecked' in el.attribs) && !get(form_values, el.attribs.name)) {
      set(
        form_values,
        el.attribs.name,
        null,
      )
    }
  })
  $('form select').each((_i, el) => {
    let value = null
    $(el).find('option[selected]').each((_i, option) => {
      value = option.attribs.value && parseParam(option.attribs.value)
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

export function getFormLabels($: cheerio.CheerioAPI): Record<string, unknown> {
  const names_and_labels = compactMap($('form input,textarea,select').toArray(), (el) => {
    if (el.attribs.type === 'hidden' || !el.attribs.name) {
      return
    }
    return {
      name: el.attribs.name,
      label: findLabel().text(),
    }

    function findLabel() {
      if (el.attribs['aria-labelledby']) {
        const by_labelledby = $(`label[id="${el.attribs['aria-labelledby']}"]`)
        if (!by_labelledby.length) {
          throw new Error(
            `element declared it was labelled by ${el.attribs['aria-labelledby']} but no such element was found`,
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

  const form_labels = {}
  for (const [key, values] of groupBy(names_and_labels, 'name')) {
    const unique_labels = uniq(values.map((value) => value.label))
    // For radio buttons with distinct labels, return all labels
    const labels = unique_labels.length === 1 ? unique_labels[0] : unique_labels
    set(form_labels, key, labels)
  }
  return form_labels
}

export function getFormOptions($: cheerio.CheerioAPI): unknown {
  const form_options: Record<
    string,
    Array<{ label: string; value: string; selected: boolean }>
  > = {}
  $('form select').each((_i, el) => {
    if (!el.attribs.name) return
    const options: Array<{ label: string; value: string; selected: boolean }> = []
    $(el).find('option').each((_i, option) => {
      options.push({
        label: option.attribs.label ?? $(option).text(),
        value: option.attribs.value ?? '',
        selected: 'selected' in option.attribs,
      })
    })
    set(form_options, el.attribs.name, options)
  })

  // 2. Handle Radio Buttons
  $('input[type="radio"]').each((_i, el) => {
    const name = el.attribs.name
    if (!name) return

    // Initialize the array for this name if it doesn't exist
    if (!form_options[name]) {
      form_options[name] = []
    }

    // Attempt to find a label. Often associated via 'id' or wrapping the input.
    const id = el.attribs.id
    let labelText = ''

    if (id) {
      labelText = $(`label[for="${id}"]`).text().trim()
    }
    if (!labelText) {
      labelText = $(el).closest('label').text().trim()
    }

    form_options[name].push({
      label: labelText || el.attribs.value || '', // Fallback to value if no label found
      value: el.attribs.value ?? '',
      selected: 'checked' in el.attribs,
    })
  })

  return form_options
}
