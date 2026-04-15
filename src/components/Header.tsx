import React from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SEARCH_GENRES } from '../constants/genres'
import { fetchSearchSuggestions } from '../services/otruyen'
import type { Manga } from '../types/manga'

const e = React.createElement

function normalizeGenreList(genres: string[]) {
  return Array.from(
    new Set(
      genres
        .map((genre) => genre.trim())
        .filter(Boolean),
    ),
  )
}

function buildSearchPath(keyword: string, genres: string[]) {
  const searchParams = new URLSearchParams()
  const normalizedKeyword = keyword.trim()
  const normalizedGenres = normalizeGenreList(genres)

  if (normalizedKeyword) {
    searchParams.set('keyword', normalizedKeyword)
  }

  if (normalizedGenres.length > 0) {
    searchParams.set('genres', normalizedGenres.join(','))
  }

  return `/tim-kiem${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchValue, setSearchValue] = React.useState('')
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const [selectedGenres, setSelectedGenres] = React.useState([] as string[])
  const [suggestions, setSuggestions] = React.useState([] as Manga[])
  const [suggestionsLoading, setSuggestionsLoading] = React.useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false)
  const [suggestionsError, setSuggestionsError] = React.useState(null as string | null)
  const [isHiddenOnScroll, setIsHiddenOnScroll] = React.useState(false)
  const suggestionRequestIdRef = React.useRef(0)
  const searchBoxRef = React.useRef(null as HTMLDivElement | null)
  const isSearchRoute = location.pathname === '/tim-kiem'

  function handleLogoClick() {
    window.location.assign('/')
  }

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    setSearchValue(searchParams.get('keyword')?.trim() ?? '')
    setSelectedGenres(normalizeGenreList(searchParams.get('genres')?.split(',') ?? []))
    setSuggestionsOpen(false)
  }, [location.search])

  React.useEffect(() => {
    setAdvancedOpen(false)
  }, [location.pathname, location.search])

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null

      if (!target || searchBoxRef.current?.contains(target)) {
        return
      }

      setSuggestionsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  React.useEffect(() => {
    const normalizedKeyword = searchValue.trim()

    if (normalizedKeyword.length < 2) {
      setSuggestions([])
      setSuggestionsLoading(false)
      setSuggestionsError(null)
      return
    }

    const timeoutId = window.setTimeout(async () => {
      const requestId = suggestionRequestIdRef.current + 1
      suggestionRequestIdRef.current = requestId

      try {
        setSuggestionsLoading(true)
        setSuggestionsError(null)
        const suggestionItems = await fetchSearchSuggestions(normalizedKeyword, selectedGenres)

        if (requestId !== suggestionRequestIdRef.current) {
          return
        }

        setSuggestions(suggestionItems)
      } catch (error) {
        if (requestId !== suggestionRequestIdRef.current) {
          return
        }

        setSuggestions([])
        setSuggestionsError(error instanceof Error ? error.message : 'Không tải được gợi ý')
      } finally {
        if (requestId === suggestionRequestIdRef.current) {
          setSuggestionsLoading(false)
        }
      }
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchValue, selectedGenres])

  React.useEffect(() => {
    if (!isSearchRoute) {
      return
    }

    const nextPath = buildSearchPath(searchValue, selectedGenres)
    const currentPath = `/tim-kiem${location.search ? location.search : ''}`

    if (nextPath === currentPath) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      navigate(nextPath, { replace: true })
    }, 350)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isSearchRoute, location.search, navigate, searchValue, selectedGenres])

  React.useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>('[data-app-scroll-container="true"]')
    const isContainerScrollable = Boolean(scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight + 1)
    const scrollSource: Window | HTMLElement = isContainerScrollable ? scrollContainer as HTMLElement : window

    const hideThreshold = 12
    const directionThreshold = 6
    let previousScrollTop = isContainerScrollable && scrollContainer ? scrollContainer.scrollTop : window.scrollY

    function updateHeaderVisibility() {
      const currentScrollTop = isContainerScrollable && scrollContainer ? scrollContainer.scrollTop : window.scrollY
      const scrollDelta = currentScrollTop - previousScrollTop

      if (currentScrollTop <= hideThreshold) {
        setIsHiddenOnScroll(false)
      } else if (scrollDelta > directionThreshold) {
        setIsHiddenOnScroll(true)
      } else if (scrollDelta < -directionThreshold) {
        setIsHiddenOnScroll(false)
      }

      previousScrollTop = currentScrollTop
    }

    updateHeaderVisibility()
    scrollSource.addEventListener('scroll', updateHeaderVisibility, { passive: true })

    return () => {
      scrollSource.removeEventListener('scroll', updateHeaderVisibility)
    }
  }, [])

  function runSearch(nextKeyword = searchValue, nextGenres = selectedGenres, options?: { replace?: boolean; closeAdvancedPanel?: boolean }) {
    const nextPath = buildSearchPath(nextKeyword, nextGenres)

    navigate(nextPath, { replace: options?.replace ?? false })
    setSuggestionsOpen(false)

    if (options?.closeAdvancedPanel !== false) {
      setAdvancedOpen(false)
    }
  }

  function handleSecretPortalOpen() {
    const password = window.prompt('Tính năng này cần mật khẩu để truy cập,nhập pass hoặc liên hệ admin:')

    if (password === null) {
      return
    }

    if (password.trim() === 'huynh2ten') {
      window.location.assign('https://2ten.vercel.app/')
      return
    }

    window.alert('Mật khẩu không đúng.')
  }

  function handleSearchInputChange(value: string) {
    setSearchValue(value)

    if (value.trim().length >= 2) {
      setSuggestionsOpen(true)
      return
    }

    setSuggestionsOpen(false)
  }

  function toggleGenre(genreSlug: string) {
    setSelectedGenres((currentGenres: string[]) => {
      if (currentGenres.includes(genreSlug)) {
        return currentGenres.filter((item: string) => item !== genreSlug)
      }

      return [...currentGenres, genreSlug]
    })
  }

  function createGenreButton(genre: { label: string; slug: string }) {
    const active = selectedGenres.includes(genre.slug)

    return e(
      'button',
      {
        key: genre.slug,
        type: 'button',
        onClick: () => toggleGenre(genre.slug),
        className: `rounded-2xl border px-3 py-2 text-left text-sm transition-colors ${active ? 'border-[rgb(211,115,255)] bg-[rgba(211,115,255,0.18)] text-[rgb(223,168,255)]' : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'}`,
      },
      genre.label,
    )
  }

  const showSuggestions = suggestionsOpen && searchValue.trim().length >= 2

  const suggestionPanel = showSuggestions
    ? e(
        'div',
        {
          className:
            'absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-2xl border border-white/10 bg-[rgba(9,16,26,0.98)] shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl',
        },
        suggestionsLoading
          ? e('div', { className: 'px-4 py-3 text-sm text-white/65' }, 'Đang tìm gợi ý...')
          : suggestionsError
            ? e('div', { className: 'px-4 py-3 text-sm text-red-300/90' }, suggestionsError)
            : suggestions.length === 0
              ? e('div', { className: 'px-4 py-3 text-sm text-white/65' }, 'Không có đề xuất phù hợp')
              : e(
                  'div',
                  { className: 'max-h-[340px] overflow-y-auto' },
                  ...suggestions.map((item: Manga) =>
                    e(
                      Link,
                      {
                        key: item.id,
                        to: item.href,
                        onClick: () => setSuggestionsOpen(false),
                        className: 'flex items-center gap-3 border-b border-white/5 px-3 py-2 text-left transition-colors hover:bg-white/5 last:border-b-0',
                      },
                      e('img', {
                        src: item.imageUrl,
                        alt: item.imageAlt,
                        loading: 'lazy',
                        decoding: 'async',
                        className: 'h-14 w-10 shrink-0 rounded-md object-cover',
                      }),
                      e(
                        'div',
                        { className: 'min-w-0 grow' },
                        e('div', { className: 'truncate text-sm font-semibold text-white' }, item.title),
                        e('div', { className: 'mt-1 truncate text-xs text-white/60' }, item.chapter ?? 'Đang cập nhật'),
                      ),
                    ),
                  ),
                  e(
                    'button',
                    {
                      type: 'button',
                      onClick: () => runSearch(),
                      className: 'w-full border-t border-white/10 px-4 py-2 text-left text-sm font-semibold text-[rgb(223,168,255)] hover:bg-white/5',
                    },
                    `Xem tất cả kết quả cho "${searchValue.trim()}"`,
                  ),
                ),
      )
    : null

  const advancedPanel = advancedOpen
    ? e(
        'div',
        {
          className:
            'absolute left-1/2 top-[calc(100%+10px)] w-[min(960px,calc(100vw-24px))] -translate-x-1/2 rounded-[1.5rem] border border-white/10 bg-[rgba(9,16,26,0.98)] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl',
        },
        e(
          'div',
          { className: 'flex items-start justify-between gap-4 border-b border-white/10 pb-3' },
          e(
            'div',
            null,
            e('div', { className: 'text-sm font-semibold text-[rgb(223,168,255)]' }, 'Tìm kiếm nâng cao'),
            e('div', { className: 'mt-1 text-sm text-white/60' }, 'Chọn nhiều thể loại rồi tìm theo tên truyện.'),
          ),
          e(
            'button',
            {
              type: 'button',
              onClick: () => setAdvancedOpen(false),
              className: 'rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10',
              'aria-label': 'Đóng tìm kiếm nâng cao',
            },
            e(X, { className: 'h-4 w-4' }),
          ),
        ),
        e(
          'div',
          { className: 'mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]' },
          e(
            'div',
            null,
            e('label', { className: 'mb-2 block text-sm font-medium text-white/80' }, 'Từ khóa'),
            e('input', {
              type: 'text',
              value: searchValue,
              onChange: (event: { target: { value: string } }) => setSearchValue(event.target.value),
              onKeyDown: (event: { key: string; preventDefault: () => void }) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  runSearch()
                }
              },
              placeholder: 'Nhập tên truyện...',
              className:
                'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[rgba(211,115,255,0.55)]',
            }),
            selectedGenres.length > 0
              ? e(
                  'div',
                  { className: 'mt-4 flex flex-wrap gap-2' },
                  ...selectedGenres.map((genreSlug: string) => {
                    const genreLabel = SEARCH_GENRES.find((genre) => genre.slug === genreSlug)?.label ?? genreSlug

                    return e(
                      'button',
                      {
                        key: genreSlug,
                        type: 'button',
                        onClick: () => toggleGenre(genreSlug),
                        className:
                          'rounded-full border border-[rgba(211,115,255,0.35)] bg-[rgba(211,115,255,0.14)] px-3 py-2 text-sm text-[rgb(223,168,255)]',
                      },
                      `${genreLabel} ×`,
                    )
                  }),
                )
              : null,
            e(
              'div',
              { className: 'mt-4 flex flex-wrap gap-2' },
              e(
                'button',
                {
                  type: 'button',
                  onClick: () => setSelectedGenres([]),
                  className: 'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:bg-white/10',
                },
                'Xóa thể loại',
              ),
              e(
                'button',
                {
                  type: 'button',
                  onClick: () => runSearch(),
                  className: 'rounded-full bg-[rgb(211,115,255)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90',
                },
                'Tìm kiếm',
              ),
            ),
          ),
          e(
            'div',
            null,
            e('div', { className: 'mb-2 text-sm font-medium text-white/80' }, 'Thể loại'),
            e(
              'div',
              { className: 'grid max-h-[260px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3' },
              ...SEARCH_GENRES.map((genre) => createGenreButton(genre)),
            ),
          ),
        ),
      )
    : null

  return e(
    React.Fragment,
    null,
    e(
      'div',
      {
        className: `fixed left-0 right-0 top-0 z-50 h-[100.8px] transition-transform duration-300 ease-out motion-reduce:transition-none ${isHiddenOnScroll ? '-translate-y-full pointer-events-none' : 'translate-y-0'}`,
      },
      e(
        'div',
        {
          className:
            'items-center self-stretch flex justify-between overflow-visible relative backdrop-blur-sm bg-[rgba(9,16,26,0.9)] shadow-[rgba(0,0,0,0.1)_0px_10px_15px_-3px,_rgba(0,0,0,0.1)_0px_4px_6px_-4px] pt-[9px] pr-0 pb-[7.2px] pl-0',
        },
        e(
          'div',
          { className: 'relative w-full' },
          e(
            'div',
            {
              className:
                'mx-auto flex w-full max-w-[1182.72px] flex-col gap-3 px-4 py-2 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4',
            },
            e(
              'div',
              { className: 'items-center flex shrink-0' },
              e(
                'button',
                {
                  type: 'button',
                  onClick: handleLogoClick,
                  className: 'block',
                },
                e(
                  'div',
                  { className: 'flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2' },
                  e('span', { className: 'text-lg font-black tracking-[0.3em] text-[rgb(223,168,255)]' }, 'HyunManga'),
                ),
              ),
            ),
            e(
              'div',
              { className: 'flex w-full flex-col gap-2 lg:absolute lg:left-1/2 lg:max-w-[520px] lg:-translate-x-1/2 lg:flex-row lg:items-center lg:gap-[10.8px]' },
              e(
                'div',
                { className: 'relative w-full', ref: searchBoxRef },
                e(
                  'form',
                  {
                    className:
                      'items-center flex w-full bg-[rgb(32,38,54)] gap-[7.2px] rounded-[0.675rem] px-4 py-2',
                    onSubmit: (event: { preventDefault: () => void }) => {
                      event.preventDefault()
                      runSearch()
                    },
                  },
                  e(
                    'button',
                    {
                      type: 'submit',
                      'aria-label': 'Tìm kiếm',
                      className: 'items-center flex justify-center w-[18px] h-[18px] text-[rgb(115,121,141)] shrink-0',
                    },
                    e(Search, { className: 'w-[18px] h-[18px]' }),
                  ),
                  e('input', {
                    type: 'text',
                    value: searchValue,
                    onChange: (event: { target: { value: string } }) => handleSearchInputChange(event.target.value),
                    onFocus: () => {
                      if (searchValue.trim().length >= 2) {
                        setSuggestionsOpen(true)
                      }
                    },
                    onKeyDown: (event: { key: string }) => {
                      if (event.key === 'Escape') {
                        setSuggestionsOpen(false)
                      }
                    },
                    placeholder: 'Tìm truyện...',
                    className:
                      'block grow font-medium overflow-clip bg-transparent text-[rgb(115,121,141)] basis-0 outline-none border-none',
                  }),
                ),
                suggestionPanel,
              ),
              e(
                'button',
                {
                  type: 'button',
                  'aria-label': 'Tìm kiếm nâng cao',
                  onClick: () => setAdvancedOpen((currentOpen: boolean) => !currentOpen),
                  className:
                    'items-center flex w-full justify-center font-semibold bg-[rgba(32,38,54,0.8)] border-[rgb(192,132,252)] border text-[rgb(224,178,255)] text-[10.8px] gap-[3.6px] leading-[14.4px] px-3 py-2 shrink-0 rounded-full lg:w-auto',
                },
                e(SlidersHorizontal, { className: 'w-[14.4px] h-[14.4px] text-[rgb(192,132,252)]' }),
                e('span', { className: 'block' }, 'Tìm kiếm nâng cao'),
              ),
            ),
          ),
          advancedPanel,
        ),
      ),
      e('div', { className: 'h-px w-full bg-white/6' }),
    ),
    e(
      'button',
      {
        type: 'button',
        onClick: handleSecretPortalOpen,
        'aria-label': 'Mở liên kết bí mật',
        title: 'Nhập mật khẩu để mở liên kết',
        className:
          'fixed bottom-5 right-5 z-[95] flex h-14 w-14 items-center justify-center rounded-full border-2 border-black/55 bg-[#d6ca67] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(223,168,255)]',
      },
      e(
        'span',
        { className: 'relative block h-8 w-8 rounded-full bg-black' },
        e('span', { className: 'absolute -top-1 left-[3px] h-3 w-3 rotate-[-34deg] rounded-tl-[10px] rounded-br-[4px] bg-black' }),
        e('span', { className: 'absolute -top-1 right-[3px] h-3 w-3 rotate-[34deg] rounded-tr-[10px] rounded-bl-[4px] bg-black' }),
        e('span', { className: 'absolute left-[9px] top-[11px] h-1.5 w-1.5 rounded-full bg-white' }),
        e('span', { className: 'absolute right-[9px] top-[11px] h-1.5 w-1.5 rounded-full bg-white' }),
      ),
    ),
  )
}
