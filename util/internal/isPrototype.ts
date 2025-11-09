const object_proto = Object.prototype

export default function isPrototype(value: unknown) {
  const Ctor = value && value.constructor
  const proto = (typeof Ctor === 'function' && Ctor.prototype) || object_proto

  return value === proto
}
