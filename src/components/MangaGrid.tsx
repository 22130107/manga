import React from 'react';
import { MangaCard } from './MangaCard';
import { Manga } from '../types/manga';

interface MangaGridProps {
  items: Manga[];
}

export function MangaGrid({ items }: MangaGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-hidden overflow-y-auto">
        <div className="grid grid-cols-2 gap-[10.8px] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((item) => (
            <MangaCard
              key={item.id}
              title={item.title}
              chapter={item.chapter}
              imageUrl={item.imageUrl}
              imageAlt={item.imageAlt}
              href={item.href}
              badge={item.badge}
              isHot={item.isHot}
              isScaled={item.isScaled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}