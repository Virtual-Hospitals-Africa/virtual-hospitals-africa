// import { useEffect } from 'preact/hooks'
// import { MIGRAINE_SEARCH_RESPONSE } from './mock-data.ts'

// export function useInterceptWarningSignsSearchHack() {

//     useEffect(() => {
//       // major hack: intercept XHR to stub the SNOMED search during the tutorial
//       // deno-lint-ignore no-explicit-any
//       const proto = XMLHttpRequest.prototype as any
//       const original_send = proto.send
//       const original_open = proto.open

//       // We need to intercept 'open' to capture the URL
//       proto.open = function (_method: unknown, url: unknown) {
//         this._url = url // Store URL for use in 'send'
//         return original_open.apply(this, arguments)
//       }

//       proto.send = function () {
//         const url = this._url

//         if (url && url.includes('/tutorial/snomed-warning-signs')) {
//           Object.defineProperties(this, {
//             status: { value: 200 },
//             readyState: { value: 4 },
//             responseText: { value: JSON.stringify(MIGRAINE_SEARCH_RESPONSE) },
//           })

//           dispatchEvent(
//             new CustomEvent('@@triage-tutorial-manually-set-search-results', {
//               detail: MIGRAINE_SEARCH_RESPONSE.results,
//             }),
//           )

//           if (typeof this.onreadystatechange === 'function') {
//             this.onreadystatechange()
//           }
//           if (typeof this.onload === 'function') {
//             this.onload()
//           }

//           // Return early so the real network request never fires
//           return
//         }

//         return original_send.apply(this, arguments)
//       }

//       return () => {
//         proto.send = original_send
//         proto.open = original_open
//       }
//     }, [])

// }
