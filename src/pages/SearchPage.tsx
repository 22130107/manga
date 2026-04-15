import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { MangaGrid } from '../components/MangaGrid'
import { Navigation } from '../components/Navigation'
import { SectionHeader } from '../components/SectionHeader'
import { SEARCH_GENRES } from '../constants/genres'
import { fetchSearchPage } from '../services/otruyen'
import type { Manga } from '../types/manga'

const PAGE_WINDOW_SIZE = 5

function getPageRange(currentPage: number, totalPages: number, windowSize: number) {
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const halfWindow = Math.floor(windowSize / 2)
  let startPage = Math.max(1, currentPage - halfWindow)
  let endPage = startPage + windowSize - 1

  if (endPage > totalPages) {
    endPage = totalPages
    startPage = Math.max(1, endPage - windowSize + 1)
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
}

function normalizeGenres(searchValue: string | null) {
  if (!searchValue) {
    return []
  }

  return searchValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('keyword')?.trim() ?? ''
  const genres = React.useMemo(() => normalizeGenres(searchParams.get('genres')), [searchParams])
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const [items, setItems] = React.useState<Manga[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [pageRanges, setPageRanges] = React.useState(PAGE_WINDOW_SIZE)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    async function loadSearchResults() {
      try {
        setLoading(true)
        setError(null)

        const result = await fetchSearchPage(keyword, page, genres)

        if (!active) {
          return
        }

        setItems(result.items)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
        setPageRanges(result.pageRanges)
      } catch (fetchError) {
        if (!active) {
          return
        }

        setError(fetchError instanceof Error ? fetchError.message : 'Không tải được dữ liệu tìm kiếm')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSearchResults()

    return () => {
      active = false
    }
  }, [genres, keyword, page])

  const pageNumbers = getPageRange(page, totalPages, pageRanges)
  const showInitialLoading = loading && items.length === 0 && !error
  const selectedGenreLabels = genres
    .map((genreSlug) => SEARCH_GENRES.find((genre) => genre.slug === genreSlug)?.label ?? genreSlug)

  function updateSearchParams(nextParams: Record<string, string | number | undefined>) {
    const currentParams = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(nextParams)) {
      if (value === undefined || value === '') {
        currentParams.delete(key)
      } else {
        currentParams.set(key, String(value))
      }
    }

    currentParams.set('page', '1')
    setSearchParams(currentParams)
  }

  function goToPage(nextPage: number) {
    const currentParams = new URLSearchParams(searchParams)
    currentParams.set('page', String(nextPage))
    setSearchParams(currentParams)
  }

  return (
    <div
      className="min-h-screen bg-[rgb(11,12,29)] text-white text-[14.4px] leading-[21.6px]"
      style={{
        fontFamily: '"Inter Tight", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        backgroundImage: 'url("https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F688666dc118ec47ec99834c7a9e190317cfef350.webp?generation=1776222735715056&alt=media"), radial-gradient(at 50% 0%, rgba(25, 23, 88, 0.3), rgba(11, 12, 29, 0) 45%, rgba(11, 12, 29, 0))',
        backgroundBlendMode: 'normal, normal',
        backgroundClip: 'border-box, border-box',
        backgroundOrigin: 'padding-box, padding-box',
        backgroundRepeat: 'repeat-y, no-repeat',
        backgroundPosition: '50% 0%, 50% 0%',
        backgroundSize: '100%, 120% 100%',
      }}
    >
      <div
        data-app-scroll-container="true"
        className="overflow-x-hidden overflow-y-auto bg-[rgb(11,12,29)]"
        style={{
          backgroundImage: 'url("https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F688666dc118ec47ec99834c7a9e190317cfef350.webp?generation=1776222735715056&alt=media"), radial-gradient(at 50% 0%, rgba(25, 23, 88, 0.3), rgba(11, 12, 29, 0) 45%, rgba(11, 12, 29, 0))',
          backgroundBlendMode: 'normal, normal',
          backgroundClip: 'border-box, border-box',
          backgroundOrigin: 'padding-box, padding-box',
          backgroundRepeat: 'repeat-y, no-repeat',
          backgroundPosition: '50% 0%, 50% 0%',
          backgroundSize: '100%, 120% 100%',
        }}
      >
        <header className="flex flex-col w-full">
          <Header />
          <Navigation />
          <div className="h-px w-full bg-white/6" />
          <div className="h-[100.8px]" />
        </header>

        <main className="mx-auto w-full max-w-[1182.72px] px-4 py-6 sm:px-6 lg:px-8">
          <SectionHeader title="Kết quả tìm kiếm" />

          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
            <div className="flex flex-wrap items-center gap-2">
              <span>Từ khóa:</span>
              <strong className="text-white">{keyword || 'Tất cả'}</strong>
              <span>·</span>
              <span>{totalItems} kết quả</span>
            </div>

            {selectedGenreLabels.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span>Thể loại:</span>
                {selectedGenreLabels.map((label) => (
                  <span key={label} className="rounded-full border border-[rgba(211,115,255,0.35)] bg-[rgba(211,115,255,0.14)] px-3 py-1 text-[12px] text-[rgb(223,168,255)]">
                    {label}
                  </span>
                ))}
                <Link
                  to="/tim-kiem"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] text-white/75 hover:bg-white/10"
                >
                  Xóa lọc
                </Link>
              </div>
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {SEARCH_GENRES.slice(0, 8).map((genre) => {
              const active = genres.includes(genre.slug)

              return (
                <button
                  key={genre.slug}
                  type="button"
                  onClick={() => {
                    const nextGenres = active ? genres.filter((item) => item !== genre.slug) : [...genres, genre.slug]
                    updateSearchParams({ genres: nextGenres.join(',') })
                  }}
                  className={`rounded-full border px-3 py-2 text-sm transition-colors ${active ? 'border-[rgb(211,115,255)] bg-[rgba(211,115,255,0.18)] text-[rgb(223,168,255)]' : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'}`}
                >
                  {genre.label}
                </button>
              )
            })}
          </div>

          <section>{showInitialLoading ? <Loading /> : error ? <ErrorMessage message={error} /> : <MangaGrid items={items} />}</section>

          {loading && items.length > 0 && !error && (
            <div className="mt-3 text-center text-xs text-white/60">Đang cập nhật kết quả...</div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={loading || page <= 1}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => goToPage(pageNumber)}
                disabled={loading}
                className={`rounded-full px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${pageNumber === page ? 'bg-[rgb(211,115,255)] text-black' : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'}`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={loading || page >= totalPages}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
