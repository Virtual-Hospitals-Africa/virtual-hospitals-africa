// TODO something more robust?

// deno-lint-ignore no-explicit-any
export function warn(...messages: any[]) {
  console.warn(...messages)
}

// deno-lint-ignore no-explicit-any
export function log(...messages: any[]) {
  console.log(...messages)
}

// deno-lint-ignore no-explicit-any
export function error(...messages: any[]) {
  console.error(...messages)
}
