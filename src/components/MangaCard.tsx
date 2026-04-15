import React from 'react';
import { Link } from 'react-router-dom';

interface MangaCardProps {
  title: string;
  chapter?: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  badge?: string;
  isHot?: boolean;
  isScaled?: boolean;
  compact?: boolean;
}

export function MangaCard({ 
  title, 
  chapter, 
  imageUrl, 
  imageAlt, 
  href, 
  badge,
  isHot = true,
  isScaled = false,
  compact = false,
}: MangaCardProps) {
  const widthClass = compact ? 'w-[220px] shrink-0 sm:w-[240px]' : 'w-full min-w-0';

  return (
    <div className={widthClass}>
      <div className="relative w-full">
        <Link 
          to={href} 
          className={`block overflow-hidden relative bg-[rgb(11,12,29)] border-[rgb(45,56,75)] border rounded-[0.675rem] ${isScaled ? 'scale-105' : ''}`}
        >
          {/* Image Container */}
          <div className="overflow-hidden relative w-full aspect-[2/3] bg-black">
            <div className="overflow-hidden absolute w-full left-0 top-0 aspect-[3/4]">
              {/* Hot Badge */}
              {isHot && (
                <span 
                  className="block font-semibold pointer-events-none absolute left-0 top-0 bg-size-[200%_100%] rounded-br-[0.45rem] border-[rgba(248,113,113,0.45)] rounded-tl-[0.675rem] border shadow-[rgba(0,0,0,0.55)_0px_1px_6px_0px] text-[12.6px] leading-[18px] pt-[1.8px] pr-[7.2px] pb-[1.8px] pl-[7.2px] z-[4]"
                  style={{
                    backgroundImage: 'linear-gradient(100deg, rgba(244, 63, 94, 0.35) 0%, rgba(244, 63, 94, 0.95) 20%, rgba(244, 63, 94, 0.35) 40%, rgba(244, 63, 94, 0.95) 60%, rgba(244, 63, 94, 0.35) 80%)'
                  }}
                >
                  Hot
                </span>
              )}
              
              {/* Main Image */}
              <img 
                alt={imageAlt} 
                src={imageUrl} 
                loading="lazy"
                decoding="async"
                className="block size-full max-w-full object-cover object-top overflow-clip pointer-events-none align-middle" 
              />
              
              {/* Bottom Gradient */}
              <div 
                className="pointer-events-none absolute h-[9%] left-0 right-0 bottom-0 z-[1]" 
                style={{
                  backgroundImage: 'linear-gradient(to top, oklab(0 0 0 / 0.4) 0%, oklab(0 0 0 / 0.3) 50%, oklab(0 none none / 0) 100%)'
                }}
              />
              
              {/* Purple Border Line */}
              <div className="h-px pointer-events-none absolute left-0 right-0 bottom-0 bg-[rgba(211,115,255,0.3)] z-[3]" />
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div 
            className="pointer-events-none absolute h-[25%] left-[-10px] right-[-10px] bottom-[-10px] rounded-bl-[0.3125rem] rounded-br-[0.3125rem] min-h-[58px] z-[1]" 
            style={{
              backgroundImage: 'linear-gradient(to top, oklab(0.163838 0.00565 -0.0350177 / 0.95) 0%, oklab(0.163838 0.00565 -0.0350177 / 0.9) 50%, oklab(0 none none / 0) 100%)'
            }}
          />
          
          {/* Content */}
          <div className="absolute left-0 right-0 bottom-0 z-[2]">
            {/* Chapter Info */}
            <div className="items-center flex text-white/90 text-[10.8px] gap-[7.2px] leading-[14.4px] pt-[7.2px] pr-[7.2px] pb-[3.6px] pl-[7.2px]">
              <span className="block grow font-semibold truncate text-[14.4px] leading-[20px]">
                {chapter}
              </span>
              
              {/* Badge */}
              {badge === 'END' && (
                <span className="items-center flex font-semibold ml-auto h-[21.6px] bg-[rgb(42,18,22)] border-red-500/45 border text-[rgb(217,69,69)] pt-0 pr-[7.2px] pb-0 pl-[7.2px] rounded-full">
                  END!
                </span>
              )}
              
              {badge === 'Oneshot' && (
                <span className="items-center flex font-semibold h-[21.6px] bg-[rgb(38,19,67)] border-[rgba(211,115,255,0.45)] border text-[rgb(223,168,255)] pt-0 pr-[7.2px] pb-0 pl-[7.2px] rounded-full">
                  Oneshot
                </span>
              )}
            </div>
            
            {/* Title */}
            <div className="pt-0 pr-[7.2px] pb-[7.2px] pl-[7.2px]">
              <h3 className="font-semibold truncate mt-[5.4px] leading-[18px]">
                {title}
              </h3>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
