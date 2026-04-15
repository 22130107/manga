import React from 'react';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[rgb(11,12,29)] border-[rgb(45,56,75)] border-t">
      <div className="w-[1182.72px] ml-[176.64px] mr-[176.64px] pt-[43.2px] pr-[28.8px] pb-[43.2px] pl-[28.8px]">
        {/* Main Footer Grid */}
        <div className="grid gap-[36px]" style={{ gridTemplateColumns: '200px 1fr 1fr 220px' }}>
          {/* Column 1: Logo and Main Menu */}
          <div className="flex flex-col gap-[18px]">
            <a href="https://vinahentai.me/" aria-label="Vinahentai trang chủ" className="block">
              <img 
                alt="Vinahentai – Đọc truyện hentai 18+" 
                src="https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F5f3767bf0e7037ff9b1d93fb91ebb93c0fad0413.webp?generation=1776222739698500&alt=media" 
                className="block max-w-full overflow-clip align-middle w-[158.4px] h-9" 
              />
            </a>
            
            <nav aria-label="Menu chính">
              <ul className="flex flex-col gap-[5.4px]">
                <li className="list-none">
                  <a href="https://vinahentai.me/gioi-thieu" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Giới thiệu
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/danh-sach" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Danh sách truyện hentai
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/genres" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Thể loại hentai 18+
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/leaderboard" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Bảng xếp hạng truyện hentai
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/cam-nang" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Cẩm nang
                  </a>
                </li>
              </ul>
            </nav>
            
            <p className="text-[10.8px] leading-[14.4px]">© 2025 Vinahentai</p>
          </div>

          {/* Column 2: About */}
          <div className="flex flex-col gap-[10.8px]">
            <p className="font-semibold text-[12.6px] leading-[18px]">Giới thiệu</p>
            <p className="text-[rgb(115,121,141)] text-[12.6px] leading-[20.475px]">
              Đọc truyện hentai 18+ tiếng Việt miễn phí, không quảng cáo. VinaHentai cập nhật mỗi ngày nhiều truyện tranh sex, hentai vietsub Nhật Bản, manga hentai và anime hentai với nội dung hấp dẫn.
            </p>
            <p className="text-[rgb(115,121,141)] text-[12.6px] leading-[20.475px]">
              Chúng tôi tôn trọng bản quyền, xem thêm tại{' '}
              <a href="https://vinahentai.me/dmca" className="font-medium text-pink-400">
                DMCA
              </a>
              .
            </p>
          </div>

          {/* Column 3: Quick Links */}
          <div className="flex flex-col gap-[10.8px]">
            <p className="font-semibold text-[12.6px] leading-[18px]">Liên kết nhanh</p>
            <nav aria-label="Liên kết nhanh">
              <ul className="flex flex-col gap-[5.4px]">
                <li className="list-none">
                  <a href="https://vinahentai.me/danh-sach" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Truyện mới
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/danh-sach" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Truyện hoàn thành
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/genres/hentai-khong-che" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Hentai không che
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/genres/manhwa" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Manhwa 18+
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/genres/3d-hentai" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Hentai 3D
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/genres/hentaivn" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    Hentaivn
                  </a>
                </li>
                <li className="list-none">
                  <a href="https://vinahentai.me/genres/ntr" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                    NTR
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: Policy and Contact */}
          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-[10.8px]">
              <p className="font-semibold text-[12.6px] leading-[18px]">Chính sách</p>
              <nav aria-label="Chính sách">
                <ul className="flex flex-col gap-[5.4px]">
                  <li className="list-none">
                    <a href="https://vinahentai.me/dmca" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                      DMCA & Bản quyền
                    </a>
                  </li>
                  <li className="list-none">
                    <a href="https://vinahentai.me/dieu-khoan" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                      Điều khoản sử dụng
                    </a>
                  </li>
                  <li className="list-none">
                    <a href="https://vinahentai.me/chinh-sach" className="font-medium text-[rgb(115,121,141)] text-[12.6px] leading-[18px]">
                      Chính sách riêng tư
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            
            <div className="flex flex-col gap-[7.2px]">
              <p className="font-semibold text-[12.6px] leading-[18px]">Liên hệ</p>
              <a href="mailto:vinahentai.contact@gmail.com" className="items-center flex font-medium text-[rgb(115,121,141)] text-[12.6px] gap-[5.4px] leading-[18px]">
                <Mail className="w-[14.4px] h-[14.4px] shrink-0" />
                vinahentai.contact@gmail.com
              </a>
            </div>
          </div>

          {/* Telegram Ad */}
          <p className="text-center mt-[7.2px] text-white/55 text-[12.6px] leading-[18px]" style={{ gridArea: '2 / 2 / 3 / 4' }}>
            Liên hệ quảng cáo Telegram{' '}
            <a href="https://t.me/phuckhang888" className="font-medium text-center text-white/65">
              @phuckhang888
            </a>
          </p>
        </div>

        {/* Reference Links Section */}
        <div>
          <div className="text-center mt-[28.8px] border-white/8 pt-[21.6px] pr-0 pb-0 pl-0 border-t">
            <p className="font-medium text-center uppercase mb-[10.8px] text-white/60 text-[13px] tracking-[1.04px] leading-[19.5px]">
              Liên kết tham khảo
            </p>
            
            <div className="items-center flex flex-wrap justify-center text-center gap-[7.2px]">
              {/* Reference links - có thể thay bằng data từ API */}
              <a href="#" className="items-center flex text-center bg-white/5 text-white/60 text-[12px] leading-[18px] pt-[3.6px] pr-[7.2px] pb-[3.6px] pl-[7.2px] rounded-[0.3375rem]">
                <span className="block text-center">Link 1</span>
              </a>
              <a href="#" className="items-center flex text-center bg-white/5 text-white/60 text-[12px] leading-[18px] pt-[3.6px] pr-[7.2px] pb-[3.6px] pl-[7.2px] rounded-[0.3375rem]">
                <span className="block text-center">Link 2</span>
              </a>
              <a href="#" className="items-center flex text-center bg-white/5 text-white/60 text-[12px] leading-[18px] pt-[3.6px] pr-[7.2px] pb-[3.6px] pl-[7.2px] rounded-[0.3375rem]">
                <span className="block text-center">Link 3</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
