// Roundabout way to get typescript to recognize that Decimal is a class
import { Decimal as DecimalClass } from 'decimal'
import { defineDecimal } from './decimal-definition.ts'

export const Decimal: typeof DecimalClass = defineDecimal() as unknown as typeof DecimalClass
export type Decimal = DecimalClass

const custom_inspect = Symbol.for('Deno.customInspect')
Object.assign(Decimal.prototype, {
  [custom_inspect]: function () {
    return `Decimal(${String(this)})`
  },
})
