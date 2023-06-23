
export type HeaderProps = {
  title: string,
  imageUrl?: string
  isShowNav?: boolean
}

export function Header({ title, imageUrl, isShowNav = true }: HeaderProps) {
  return (
    <nav class="bg-gray-800">
      <div class="max-w-7xl w-full">
        <div class="relative flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            {isShowNav && (
              <a class='back' onClick={() => window.history.back()}>
                <svg
                  class='back-arrow w-4 h-4'
                  viewBox='0 0 16 16'
                >
                  <path
                    d='M16 7H3.83L9.42 1.41L8 0L0 8L8 16L9.41 14.59L3.83 9H16V7Z'
                    fill='white'
                  >
                  </path>
                </svg>
              </a>
            )}
            <h6 class="text-xl">{title}</h6>
          </div>
          <div class="absolute inset-y-0 right-0 flex gap-4 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button type="button" class="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
              <span class="sr-only">View notifications</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            {imageUrl && (
              <button type="button" class="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                <span class="sr-only">Open user menu</span>
                <img class="h-8 w-8 rounded-full" src={imageUrl} alt="user avatar" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
