import React from 'react'
import { Link } from 'react-router-dom'
import { fetchComicDetail } from '../services/otruyen'

export function IntroPage() {
  const [startChapterLink, setStartChapterLink] = React.useState('/truyen/yugo-ke-thuong-thuyet')

  React.useEffect(() => {
    async function loadFirstChapter() {
      try {
        const detail = await fetchComicDetail('yugo-ke-thuong-thuyet')
        const firstChapter = detail.chapters.at(-1)

        if (firstChapter) {
          setStartChapterLink(`/truyen/${detail.slug}/chuong/${firstChapter.chapterId}`)
        }
      } catch {
        setStartChapterLink('/truyen/yugo-ke-thuong-thuyet')
      }
    }

    loadFirstChapter()
  }, [])

  return (
    <div className="min-h-screen bg-[rgb(11,12,29)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="grid gap-8 rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_24px_120px_rgba(0,0,0,0.35)] backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-12">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[rgb(211,115,255)]/40 bg-[rgba(211,115,255,0.14)] px-4 py-2 text-sm font-semibold text-[rgb(223,168,255)]">
              Giới thiệu
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Trang đọc truyện nội bộ, không cần rời ứng dụng.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
              Đây là điểm vào của ứng dụng manga. Từ đây bạn có thể vào danh sách truyện mới, mở trang chi tiết của từng truyện và đọc trực tiếp các chapter từ OTruyen.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/" className="rounded-full bg-[rgb(211,115,255)] px-5 py-3 font-semibold text-black">
                Vào trang chủ
              </Link>
              <Link to={startChapterLink} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90">
                Đọc từ đầu
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[24px] border border-white/10 bg-[rgba(8,10,24,0.6)] p-6 text-sm text-white/75">
            <div>
              <p className="font-semibold text-white">Tính năng</p>
              <p className="mt-2 leading-7">Trang chủ có 30 truyện mới mỗi trang, trang chi tiết có danh sách chapter, và trang đọc chapter render ảnh theo từng trang.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Luồng sử dụng</p>
              <p className="mt-2 leading-7">Chọn truyện từ trang chủ, mở chi tiết, chọn chapter bất kỳ, rồi đọc truyện ngay trong app.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Dữ liệu</p>
              <p className="mt-2 leading-7">Tất cả nội dung được lấy từ API OTruyen và hiển thị bằng giao diện riêng của bạn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
