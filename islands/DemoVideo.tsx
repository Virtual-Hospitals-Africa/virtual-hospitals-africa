import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useEffect } from 'preact/hooks'
import { effect, useSignal } from '@preact/signals'
import { assert } from 'std/assert/assert.ts'

const videoId = 'nrEloCfycjk'
const videoQuality = 'hd1440'

// deno-lint-ignore no-explicit-any
function getYT(window: any) {
  if ('YT' in window) return window.YT
}

export default function DemoVideo() {
  const youtube_script_loaded = useSignal(false)
  const youtube_demo_iframe_on_page = useSignal(false)
  const autoplay = useSignal(false)
  // deno-lint-ignore no-explicit-any
  const player = useSignal<any>(null)
  const open = useSignal(false)

  function onYouTubePlayerAPIReady() {
    assert('YT' in globalThis, 'YouTube API not loaded')
    const el = document.getElementById('youtube_demo_iframe')
    assert(el)
    const YT = getYT(globalThis)!
    return new YT.Player('youtube_demo_iframe', {
      height: '390',
      width: '640',
      videoId,
      playerVars: {
        playsinline: 1,
      },
    })
  }

  useEffect(() => {
    // Weirdly, even if YT is loaded, the YT.Player might not be yet
    function checkIfPlayerPresent() {
      if (getYT(globalThis).Player) {
        youtube_script_loaded.value = true
      } else {
        requestAnimationFrame(checkIfPlayerPresent)
      }
    }

    const hash = globalThis.location.hash
    if (hash === '#demo') {
      open.value = true
    }
    self.addEventListener('hashchange', () => {
      open.value = globalThis.location.hash === '#demo'
      autoplay.value = true
    })

    if (getYT(globalThis)) return checkIfPlayerPresent()

    self.addEventListener('load', (event) => {
      if (
        event.target === document
      ) {
        return youtube_script_loaded.value = true
      }
      if (
        event.target instanceof HTMLScriptElement &&
        event.target.src === 'https://youtube.com/iframe_api'
      ) {
        checkIfPlayerPresent()
      }
    })
  }, [])

  // Sets youtube_demo_iframe_on_page when the youtube demo iframe is added to the page
  effect(() => {
    if (!youtube_script_loaded.value) return
    if (document.getElementById('youtube_demo_iframe')) {
      return youtube_demo_iframe_on_page.value = true
    }

    const observer = new MutationObserver(
      function handleInsertion(mutationsList, observer) {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (
                node instanceof HTMLElement &&
                node.querySelector('#youtube_demo_iframe')
              ) {
                youtube_demo_iframe_on_page.value = true
                observer.disconnect()
              }
            })
          }
        }
      },
    )

    observer.observe(document.body, { childList: true, subtree: true })
  })

  effect(() => {
    if (
      youtube_demo_iframe_on_page.value && youtube_script_loaded.value &&
      !player.value
    ) {
      player.value = onYouTubePlayerAPIReady()
    }
  })

  effect(() => {
    function checkIfCanPlayThenPlay() {
      if (player.value.playVideo) {
        player.value.playVideo(videoId, 0, videoQuality)
      } else {
        requestAnimationFrame(checkIfCanPlayThenPlay)
      }
    }

    if (open.value && player.value && autoplay.value) {
      checkIfCanPlayThenPlay()
    }
  })

  effect(() => {
    if (!open.value) {
      youtube_demo_iframe_on_page.value = false
      player.value = null
    }
  })

  return (
    <Transition.Root show={open.value} as={Fragment}>
      <Dialog
        className='relative z-10'
        onClose={() => globalThis.location.hash = ''}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full justify-center p-4 text-center items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform rounded-lg shadow-xl transition-all max-h-screen max-w-screen'>
                <div
                  id='youtube_demo_iframe'
                  className='embed-responsive-item'
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
