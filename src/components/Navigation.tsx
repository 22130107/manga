import React from 'react';
import { ChevronDown, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="items-center flex justify-center overflow-hidden w-full mt-[-5.4px] bg-[rgba(9,16,26,0.8)] gap-[28.8px] pt-[7.92px] pr-[28.8px] pb-[7.92px] pl-[28.8px]">
      <Link 
        to="/" 
        className="items-center flex font-semibold justify-center text-center whitespace-nowrap text-[17px] leading-[21.25px] pt-[3.6px] pr-[7.2px] pb-[3.6px] pl-[7.2px] shrink-0 rounded-[0.3375rem]"
      >
        Trang chủ
      </Link>

      <Link
        to="/gioi-thieu"
        className="items-center flex font-semibold justify-center text-center whitespace-nowrap text-[17px] leading-[21.25px] pt-[3.6px] pr-[7.2px] pb-[3.6px] pl-[7.2px] shrink-0 rounded-[0.3375rem]"
      >
        Giới thiệu
      </Link>
      
      <div className="whitespace-nowrap shrink-0">
        <button 
          type="button"
          className="items-center flex justify-start text-center bg-transparent text-[17px] gap-[3.6px] leading-[24.2857px] border-none cursor-pointer"
        >
          <div className="font-semibold text-center leading-[21.25px]">Thể loại</div>
          <span className="flex text-center">
            <ChevronDown className="w-[14.4px] h-[14.4px]" />
          </span>
        </button>
      </div>

      <button
        type="button"
        className="items-center flex font-semibold justify-center text-center whitespace-nowrap text-[17px] leading-[21.25px] pt-[3.6px] pr-[7.2px] pb-[3.6px] pl-[7.2px] shrink-0 rounded-[0.3375rem]"
      >
        <Shuffle className="w-[14.4px] h-[14.4px] mr-[3.6px]" />
        Random
      </button>
    </nav>
  );
}
