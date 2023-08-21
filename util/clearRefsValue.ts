import { Ref, RefObject } from 'preact'

export default function clearRefValue(...refs: Ref<HTMLSelectElement>[]) {
  for (const ref of refs) {
    const refObj = ref as RefObject<HTMLSelectElement>
    if (refObj?.current) {
      refObj.current.value = ''
    }
  }
}
