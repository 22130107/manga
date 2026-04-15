import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { Navigation } from '../components/Navigation'
import { fetchComicDetail } from '../services/otruyen'

export function ComicDetailPage() {
  const { slug = '' } = useParams()
  const [detail, setDetail] = React.useState<Awaited<ReturnType<typeof fetchComicDetail>> | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchComicDetail(slug)
        setDetail(result)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Không tải được truyện')
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [slug])

  return (
    <div className="min-h-screen bg-[rgb(11,12,29)] text-white">
      <div className="overflow-x-hidden bg-[rgb(11,12,29)]">
        <Header />
        <Navigation />
        <div className="h-px w-full bg-white/6" />
        <div className="h-[100.8px]" />

        <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : detail ? (
            <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside>
                <img src={detail.imageUrl} alt={detail.name} className="w-full rounded-2xl border border-white/10 object-cover shadow-2xl" />
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/70">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{detail.status ?? 'unknown'}</span>
                  {detail.categories.slice(0, 3).map((category) => (
                    <span key={category.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {category.name}
                    </span>
                  ))}
                </div>
              </aside>

              <section className="space-y-8">
                <div>
                  <p className="text-sm text-[rgb(211,115,255)]">
                    <Link to="/" className="hover:underline">Trang chủ</Link> / {detail.name}
                  </p>
                  <h1 className="mt-2 text-4xl font-semibold">{detail.name}</h1>
                  <p className="mt-2 text-white/60">{detail.originNames.filter(Boolean).join(' - ')}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 leading-8 text-white/75" dangerouslySetInnerHTML={{ __html: detail.content ?? '<p>Không có mô tả.</p>' }} />

                <div>
                  <h2 className="text-xl font-semibold uppercase tracking-wide">Danh sách chương</h2>
                  <div className="mt-4 space-y-2">
                    {detail.chapters.map((chapter) => (
                      <Link
                        key={chapter.chapterId}
                        to={`/truyen/${detail.slug}/chuong/${chapter.chapterId}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                      >
                        <div>
                          <p className="font-semibold">{chapter.filename}</p>
                          <p className="text-sm text-white/60">{chapter.chapterTitle || `Chapter ${chapter.chapterName}`}</p>
                        </div>
                        <span className="text-sm text-white/50">Đọc</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          ) : null}
        </main>

      </div>
    </div>
  )
}
