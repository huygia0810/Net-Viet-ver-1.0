import React from 'react';
import { ArrowDown, Sparkles, Shield, Compass, History } from 'lucide-react';

interface HeroSectionProps {
  onStartStyling: () => void;
  onExploreHeritageCore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartStyling,
  onExploreHeritageCore,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#212530]">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#a83226]/15 via-[#a83226]/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Arena Pill */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161922] border border-[#2e3444] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#e5b94c] font-medium tracking-wide">
              AI ARENA: VIET NAM 2026
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-300">
              Next-Gen Cultural Stylist Prototype
            </span>
          </div>
        </div>

        {/* Hero Title & Tagline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#f5f0e6] leading-[1.1] mb-6">
            Mặc hiện đại, <br />
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#e5b94c] via-[#f7d486] to-[#b93828]">
              nhưng hiểu mình đang mặc gì.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            AI Stylist đầu tiên đưa cổ phục Việt hòa nhập vào đời sống đương đại
            của thế hệ Gen Z — không chỉ dừng lại ở tạo hình thời trang bắt mắt,
            mà có hệ thống <span className="text-[#e5b94c] font-medium">Heritage Guard</span> độc
            quyền bảo vệ trọn vẹn các chuẩn mực văn hóa và bằng chứng lịch sử.
          </p>
        </div>

        {/* Interactive Architecture Flow Preview */}
        <div className="max-w-4xl mx-auto mb-12 p-4 sm:p-5 rounded-2xl bg-[#13151c]/80 border border-[#252936] shadow-xl backdrop-blur-sm">
          <div className="text-[11px] uppercase tracking-widest text-[#d4af37] font-semibold text-center mb-4">
            QUY TRÌNH BẢO VỆ DI SẢN (HERITAGE ARCHITECTURE)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-[#181c26] border border-[#2a3040]">
              <div className="text-neutral-400 text-[10px] uppercase">Bước 01</div>
              <div className="font-medium text-white mt-1">Lựa Chọn Cổ Phục</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#181c26] border border-[#2a3040]">
              <div className="text-neutral-400 text-[10px] uppercase">Bước 02</div>
              <div className="font-medium text-white mt-1">Gu Phong Cách</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#181c26] border border-[#2a3040]">
              <div className="text-[#e5b94c] text-[10px] uppercase">Bước 03</div>
              <div className="font-medium text-[#f5f0e6] mt-1">Heritage Core</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#181c26] border border-[#2a3040]">
              <div className="text-neutral-400 text-[10px] uppercase">Bước 04</div>
              <div className="font-medium text-white mt-1">Gemini Stylist</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#181c26] border border-[#2a3040] ring-1 ring-emerald-500/30">
              <div className="text-emerald-400 text-[10px] uppercase font-bold">Bước 05</div>
              <div className="font-semibold text-emerald-300 mt-1">Heritage Guard</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#181c26] border border-[#2a3040]">
              <div className="text-[#e5b94c] text-[10px] uppercase">Kết Quả</div>
              <div className="font-medium text-[#f5f0e6] mt-1">Lookbook & Note</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onStartStyling}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#b93828] to-[#8d2216] hover:from-[#cb4030] hover:to-[#a1291d] shadow-lg shadow-[#b93828]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Thiết Kế Outfit Ngay</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreHeritageCore}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-sm text-neutral-300 hover:text-white bg-[#151821] hover:bg-[#1d222e] border border-[#2b3140] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-[#d4af37]" />
            <span>Xem Kho Dữ Liệu Heritage Core</span>
          </button>
        </div>
      </div>
    </section>
  );
};
