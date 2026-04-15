import React from 'react'
import { ErrorMessage } from '../components/ErrorMessage'
import { HotMangaMarquee } from '../components/HotMangaMarquee'
import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { MangaGrid } from '../components/MangaGrid'
import { Navigation } from '../components/Navigation'
import { SectionHeader } from '../components/SectionHeader'
import { fetchCuratedHotSpotlight, fetchNewReleasePage } from '../services/otruyen'
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

export function HomePage() {
  const [hotManga, setHotManga] = React.useState<Manga[]>([])
  const [newManga, setNewManga] = React.useState<Manga[]>([])
  const [newPage, setNewPage] = React.useState(1)
  const [newTotalPages, setNewTotalPages] = React.useState(1)
  const [newPageRanges, setNewPageRanges] = React.useState(PAGE_WINDOW_SIZE)
  const [selectedCategory, setSelectedCategory] = React.useState('Tất cả')
  const [loading, setLoading] = React.useState(true)
  const [newLoading, setNewLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [newSectionError, setNewSectionError] = React.useState<string | null>(null)

  const categoryOptions = React.useMemo(() => {
    const categorySet = new Set<string>()

    for (const item of [...hotManga, ...newManga]) {
      for (const category of item.categories ?? []) {
        categorySet.add(category)
      }
    }

    return ['Tất cả', ...Array.from(categorySet).sort((left, right) => left.localeCompare(right))]
  }, [hotManga, newManga])

  const filteredHotManga = React.useMemo(() => {
    if (selectedCategory === 'Tất cả') {
      return hotManga
    }

    return hotManga.filter((item) => item.categories?.includes(selectedCategory))
  }, [hotManga, selectedCategory])

  React.useEffect(() => {
    async function loadSpotlight() {
      try {
        setLoading(true)
        setError(null)

        const hotResult = await fetchCuratedHotSpotlight()
        setHotManga(hotResult)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Không tải được dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    loadSpotlight()
  }, [])

  React.useEffect(() => {
    async function loadPage() {
      try {
        setNewLoading(true)
        setNewSectionError(null)

        const result = await fetchNewReleasePage(newPage, selectedCategory === 'Tất cả' ? [] : [selectedCategory])
        setNewManga(result.items)
        setNewTotalPages(result.totalPages)
        setNewPageRanges(result.pageRanges)
      } catch (fetchError) {
        setNewSectionError(fetchError instanceof Error ? fetchError.message : 'Không tải được dữ liệu')
      } finally {
        setNewLoading(false)
      }
    }

    loadPage()
  }, [newPage, selectedCategory])

  const pageNumbers = getPageRange(newPage, newTotalPages, newPageRanges)

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
          <SectionHeader title="Truyện HOT" icon="flame" />
          <section>{loading ? <Loading /> : error ? <ErrorMessage message={error} /> : <HotMangaMarquee items={filteredHotManga} />}</section>

          <div className="h-8 sm:h-10" />

          <div className="mb-4 flex flex-wrap gap-2 px-0 sm:px-[3.6px]">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category)
                  setNewPage(1)
                }}
                className={`rounded-full border px-3 py-2 text-sm transition-colors ${selectedCategory === category ? 'border-[rgb(211,115,255)] bg-[rgba(211,115,255,0.18)] text-[rgb(223,168,255)]' : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 pb-[10.8px] pl-0 pr-0 pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pl-[3.6px] sm:pr-[3.6px]">
            <SectionHeader title="Truyện mới cập nhật" />
            <div className="text-white/55 text-sm sm:text-right">
              Trang {newPage} / {newTotalPages} · 30 truyện/trang
            </div>
          </div>

          <section>{newLoading ? <Loading /> : newSectionError ? <ErrorMessage message={newSectionError} onRetry={() => setNewPage(1)} /> : <MangaGrid items={newManga} />}</section>

          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setNewPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={newLoading || newPage <= 1}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setNewPage(pageNumber)}
                disabled={newLoading}
                className={`rounded-full px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${pageNumber === newPage ? 'bg-[rgb(211,115,255)] text-black' : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'}`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setNewPage((currentPage) => Math.min(newTotalPages, currentPage + 1))}
              disabled={newLoading || newPage >= newTotalPages}
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
