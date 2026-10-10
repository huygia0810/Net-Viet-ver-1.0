import React from 'react';
import { ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { NetVietLogo } from './NetVietLogo';

interface HeaderProps {
  onOpenHeritageCore: () => void;
  onOpenStressTest: () => void;
  onScrollToStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHeritageCore,
  onOpenStressTest,
  onScrollToStudio,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0c0d10]/90 border-b border-[#212530]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand identity: Logo ngang chính thức Nét Việt */}
        <div className="flex items-center gap-3 shrink-0">
          <NetVietLogo className="h-7 sm:h-8 md:h-9 w-auto" withParchmentBadge={true} />
          <p className="text-[11px] text-[#9ca3af] hidden xl:block italic font-light pl-2 border-l border-[#2a2f3e]">
            “Mặc hiện đại, nhưng hiểu mình đang mặc gì.”
          </p>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onOpenHeritageCore}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#161922] hover:bg-[#1e2330] border border-[#2b3140] rounded-lg transition-colors cursor-pointer"
            title="Khám phá kho dữ liệu di sản văn hóa"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden md:inline">Thư Viện</span> Heritage Core
          </button>

          <button
            onClick={onOpenStressTest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#161922] hover:bg-[#1e2330] border border-[#2b3140] rounded-lg transition-colors cursor-pointer"
            title="Thử thách hệ thống bảo vệ văn hóa"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Thử Thách</span> Heritage Guard
          </button>

          <button
            onClick={onScrollToStudio}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#b93828] to-[#93281b] hover:from-[#c93f2e] hover:to-[#a32e20] rounded-lg shadow-md shadow-[#b93828]/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Phối Đồ Ngay</span>
          </button>
        </div>
      </div>
    </header>
  );
};
