import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { Navigation } from '../components/Navigation'
import { fetchChapterReader, fetchComicDetail } from '../services/otruyen'

export function ChapterReaderPage() {
  const { slug = '' } = useParams()
  const { chapterId = '' } = useParams()
  const [detail, setDetail] = React.useState<Awaited<ReturnType<typeof fetchComicDetail>> | null>(null)
  const [chapter, setChapter] = React.useState<Awaited<ReturnType<typeof fetchChapterReader>> | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadReader() {
      try {
        setLoading(true)
        setError(null)

        const [detailResult, chapterResult] = await Promise.all([
          fetchComicDetail(slug),
          fetchChapterReader(chapterId),
        ])

        setDetail(detailResult)
        setChapter(chapterResult)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Không tải được chapter')
      } finally {
        setLoading(false)
      }
    }

    loadReader()
  }, [chapterId, slug])

  const currentIndex = detail?.chapters.findIndex((item) => item.chapterId === chapterId) ?? -1
  const previousChapter = currentIndex > 0 ? detail?.chapters[currentIndex - 1] : undefined
  const nextChapter = currentIndex >= 0 ? detail?.chapters[currentIndex + 1] : undefined

  return (
    <div className="min-h-screen bg-[rgb(11,12,29)] text-white">
      <div className="overflow-x-hidden bg-[rgb(11,12,29)]">
        <Header />
        <Navigation />
        <div className="h-px w-full bg-white/6" />
        <div className="h-[100.8px]" />

        <main className="pb-20 pt-8">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : detail && chapter ? (
            <div className="space-y-8">
              <div className="mx-auto max-w-4xl px-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-[rgb(211,115,255)]">
                    <Link to={`/truyen/${detail.slug}`} className="hover:underline">{detail.name}</Link>
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold">{chapter.chapterName}</h1>
                  <p className="mt-1 text-white/60">{chapter.chapterTitle ?? ''}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {previousChapter ? (
                      <Link
                        to={`/truyen/${detail.slug}/chuong/${previousChapter.chapterId}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85"
                      >
                        Chapter trước
                      </Link>
                    ) : null}
                    <Link
                      to={`/truyen/${detail.slug}`}
                      className="rounded-full bg-[rgb(211,115,255)] px-4 py-2 text-sm font-semibold text-black"
                    >
                      Về trang truyện
                    </Link>
                    {nextChapter ? (
                      <Link
                        to={`/truyen/${detail.slug}/chuong/${nextChapter.chapterId}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85"
                      >
                        Chapter sau
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
                {chapter.images.map((imageUrl, index) => (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={`${chapter.chapterName} - trang ${index + 1}`}
                    className="block w-full m-0 rounded-none border-0 bg-transparent"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </main>

      </div>
    </div>
  )
}
