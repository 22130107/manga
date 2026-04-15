import React from 'react';
import { Flame } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: 'flame';
}

export function SectionHeader({ title, icon }: SectionHeaderProps) {
  return (
    <div className="items-center flex gap-[7.2px] pt-0 pr-[3.6px] pb-[10.8px] pl-[3.6px]">
      {icon === 'flame' && (
        <Flame className="w-[18px] h-[18px] text-red-400 fill-red-400" />
      )}
      <h2 className="font-semibold uppercase text-[18px] leading-[25.2px]">
        {title}
      </h2>
    </div>
  );
}
