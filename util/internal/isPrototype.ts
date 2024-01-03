const objectProto = Object.prototype

export default function isPrototype(value: unknown) {
  const Ctor = value && value.constructor
  const proto = (typeof Ctor === 'function' && Ctor.prototype) || objectProto

  return value === proto
}
