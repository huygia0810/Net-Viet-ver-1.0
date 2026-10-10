import React from 'react';
import { CostumeId, CostumeMeta } from '../types';
import { Check, Info, ShieldCheck, ChevronRight } from 'lucide-react';
import { HERITAGE_CORE_DATABASE } from '../data/heritageCore';

interface CostumeSelectorProps {
  costumes: CostumeMeta[];
  selectedCostumeId: CostumeId;
  onSelectCostume: (id: CostumeId) => void;
  onPeekCostumeClaims: (id: CostumeId) => void;
}

export const CostumeSelector: React.FC<CostumeSelectorProps> = ({
  costumes,
  selectedCostumeId,
  onSelectCostume,
  onPeekCostumeClaims,
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
            BƯỚC 01 · NỀN TẢNG DI SẢN
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
            Chọn Dòng Việt Phục
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Mỗi loại trang phục mang một cấu trúc ADN riêng biệt được bảo vệ bởi Heritage Core.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {costumes.map((costume) => {
          const isSelected = costume.id === selectedCostumeId;
          const isNotResearched = costume.heritageStatus === 'NOT_RESEARCHED';
          const claims = isNotResearched ? [] : HERITAGE_CORE_DATABASE.filter((c) => c.costume === costume.id);
          const greenCount = claims.filter((c) => c.ai_access === 'GREEN').length;
          const yellowCount = claims.filter((c) => c.ai_access === 'YELLOW').length;
          const redCount = claims.filter((c) => c.ai_access === 'RED').length;

          return (
            <div
              key={costume.id}
              onClick={() => onSelectCostume(costume.id)}
              className={`relative rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1b1f2b] to-[#12141c] border-[#d4af37] shadow-xl shadow-[#d4af37]/10 ring-1 ring-[#d4af37]/40'
                  : 'bg-[#12141a] border-[#242834] hover:border-[#383f52] hover:bg-[#161922]'
              }`}
            >
              {/* Selected indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono tracking-wider text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/20">
                    {costume.historicalEra}
                  </span>
                  {costume.heritageStatus === 'NOT_RESEARCHED' ? (
                    <span className="text-[10px] font-mono tracking-wider text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-full border border-neutral-700">
                      NOT_RESEARCHED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      OFFICIAL CORE
                    </span>
                  )}
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-[#d4af37] border-[#d4af37] text-black'
                      : 'border-neutral-600 bg-transparent text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-5">
                <h3 className="font-editorial text-xl font-bold text-white mb-1.5">
                  {costume.name}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                  {costume.originOverview}
                </p>
              </div>

              {/* Anatomical Pillars */}
              <div className="mb-5 space-y-2 pt-4 border-t border-[#222736]">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Cấu trúc nhận diện cốt lõi:
                </div>
                {isNotResearched ? (
                  <div className="text-[11px] text-neutral-400 italic py-1">
                    Chưa công bố bộ thông số chính thức trong Heritage Core.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 text-[11px] text-neutral-300">
                    {costume.keyStructuralAnatomy.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#d4af37] font-bold mt-0.5">•</span>
                        <span>
                          <strong className="text-neutral-200">{item.part}:</strong> {item.description}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Heritage Guard Status Bar */}
              <div className="pt-4 border-t border-[#222736] flex items-center justify-between">
                {isNotResearched ? (
                  <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                    <span>CHƯA XÁC LẬP CLAIMS</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {greenCount} GREEN
                    </span>
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {yellowCount} YELLOW
                    </span>
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {redCount} RED
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPeekCostumeClaims(costume.id);
                  }}
                  className="text-xs text-[#d4af37] hover:text-[#f3cd66] flex items-center gap-0.5 underline-offset-4 hover:underline cursor-pointer"
                >
                  <span>Chi tiết claim</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
