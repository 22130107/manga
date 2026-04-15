import React from 'react'
import { MangaCard } from './MangaCard'
import type { Manga } from '../types/manga'

interface HotMangaMarqueeProps {
  items: Manga[]
}

export function HotMangaMarquee({ items }: HotMangaMarqueeProps) {
  if (!items || items.length === 0) {
    return <div className="py-12 text-center text-white/60">Không có dữ liệu</div>
  }

  const loopItems = [...items, ...items]

  return (
    <div className="overflow-hidden">
      <div className="hot-marquee flex w-max flex-nowrap gap-[10.8px] pr-[10.8px] motion-reduce:animate-none">
        {loopItems.map((item, index) => (
          <MangaCard
            key={`${item.id}-${index}`}
            title={item.title}
            chapter={item.chapter}
            imageUrl={item.imageUrl}
            imageAlt={item.imageAlt}
            href={item.href}
            badge={item.badge}
            isHot={item.isHot}
            isScaled={false}
            compact
          />
        ))}
      </div>
    </div>
  )
}