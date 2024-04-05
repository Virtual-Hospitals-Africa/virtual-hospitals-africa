import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useEffect } from 'preact/hooks'
import { effect, useSignal } from '@preact/signals'
import { assert } from 'std/assert/assert.ts'

const videoId = '8aB1BibAl18'
const videoQuality = 'hd1440'

export default function DemoVideo() {
  const youtube_script_loaded = useSignal(false)
  const youTubeIframeOnPage = useSignal(false)
  const player = useSignal<any>(null)
  const open = useSignal(false)

  function onYouTubePlayerAPIReady() {
    assert('YT' in window, 'YouTube API not loaded')
    const YT = window.YT as unknown as any
    const el = document.getElementById('youTubeIframe')
    assert(el)
    return new YT.Player('youTubeIframe', {
      height: '390',
      width: '640',
      videoId,
      playerVars: {
        playsinline: 1,
      },
    })
  }

  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#demo') {
      open.value = true
    }
    self.addEventListener('hashchange', () => {
      open.value = window.location.hash === '#demo'
    })
    if ('YT' in window) {
      youtube_script_loaded.value = true
    } else {
      self.addEventListener('load', (event) => {
        if (
          event.target instanceof HTMLScriptElement &&
          event.target.src === 'https://youtube.com/iframe_api'
        ) {
          youtube_script_loaded.value = true
        }
      })
    }
  }, [])

  effect(() => {
    if (!youtube_script_loaded.value) return
    if (document.getElementById('youTubeIframe')) {
      youTubeIframeOnPage.value = true
    } else {
      // Select the target node
      const targetNode = document.body // You can specify any parent element you want to observe

      // Options for the observer (which mutations to observe)
      const config = { childList: true, subtree: true }

      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(
        function handleInsertion(mutationsList, observer) {
          for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (
                  node instanceof HTMLElement &&
                  node.querySelector('#youTubeIframe')
                ) {
                  youTubeIframeOnPage.value = true
                  observer.disconnect() // Disconnect the observer if needed
                }
              })
            }
          }
        },
      )

      // Start observing the target node for configured mutations
      observer.observe(targetNode, config)
    }
  })

  effect(() => {
    if (youTubeIframeOnPage.value && !player.value) {
      player.value = onYouTubePlayerAPIReady()
    }
  })

  effect(() => {
    if (open.value && player.value) {
      setTimeout(() => {
        console.log('IN HERE', player.value, player.value!.playVideo)
        player.value!.playVideo()
      }, 200)
    }
  })

  effect(() => {
    if (!open.value) {
      youTubeIframeOnPage.value = false
      player.value = null
    }
  })

  return (
    <Transition.Root show={open.value} as={Fragment}>
      <Dialog
        className='relative z-10'
        onClose={() => window.location.hash = ''}
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
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform rounded-lg shadow-xl transition-all max-h-screen'>
                <div className='embed-responsive-item' id='youTubeIframe' />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
