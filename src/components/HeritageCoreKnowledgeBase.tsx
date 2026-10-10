import React, { useState } from 'react';
import { CostumeId, HeritageClaim } from '../types';
import { HERITAGE_CORE_DATABASE, COSTUME_METAS } from '../data/heritageCore';
import { BookOpen, X, Filter, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

interface HeritageCoreKnowledgeBaseProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCostumeId?: CostumeId;
}

export const HeritageCoreKnowledgeBase: React.FC<HeritageCoreKnowledgeBaseProps> = ({
  isOpen,
  onClose,
  defaultCostumeId,
}) => {
  const [selectedCostume, setSelectedCostume] = useState<string>(defaultCostumeId || 'all');
  const [selectedAccess, setSelectedAccess] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL');

  if (!isOpen) return null;

  const filteredClaims = HERITAGE_CORE_DATABASE.filter((claim) => {
    const costumeMatch = selectedCostume === 'all' || claim.costume === selectedCostume;
    const accessMatch = selectedAccess === 'ALL' || claim.ai_access === selectedAccess;
    return costumeMatch && accessMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#11131a] border border-[#2b3040] rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232736]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl font-bold text-white">
                Kho Dữ Liệu Heritage Core
              </h3>
              <p className="text-xs text-neutral-400">
                Nguồn chân lý văn hóa & dữ kiện lịch sử được xác thực làm nền tảng cho Gemini Stylist.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#181b24] border border-[#2b3140] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#161822] border border-[#252a38]">
          {/* Costume Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mr-1">
              Trang phục:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCostume('all')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                  selectedCostume === 'all'
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'bg-[#1e2230] text-neutral-300 hover:text-white'
                }`}
              >
                Tất cả ({HERITAGE_CORE_DATABASE.length})
              </button>
              {COSTUME_METAS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCostume(c.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    selectedCostume === c.id
                      ? 'bg-[#d4af37] text-black font-semibold'
                      : 'bg-[#1e2230] text-neutral-300 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Access Level Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setSelectedAccess('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedAccess === 'ALL'
                  ? 'bg-neutral-200 text-black font-bold'
                  : 'bg-[#1e2230] text-neutral-400'
              }`}
            >
              TẤT CẢ
            </button>
            <button
              onClick={() => setSelectedAccess('GREEN')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedAccess === 'GREEN'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#1e2230] text-emerald-400'
              }`}
            >
              GREEN (Được dùng)
            </button>
            <button
              onClick={() => setSelectedAccess('YELLOW')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedAccess === 'YELLOW'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-[#1e2230] text-amber-400'
              }`}
            >
              YELLOW (Có phạm vi)
            </button>
            <button
              onClick={() => setSelectedAccess('RED')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedAccess === 'RED'
                  ? 'bg-rose-500 text-black font-bold'
                  : 'bg-[#1e2230] text-rose-400'
              }`}
            >
              RED (Không bịa đặt)
            </button>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4 overflow-y-auto pr-1">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="p-5 rounded-2xl bg-[#151720] border border-[#262b3a] space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${
                      claim.ai_access === 'GREEN'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : claim.ai_access === 'YELLOW'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    AI ACCESS: {claim.ai_access}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    STATUS: {claim.status}
                  </span>
                  <span className="font-semibold text-neutral-300 font-mono text-[11px]">
                    {claim.id}
                  </span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-[#d4af37] font-medium">
                    {COSTUME_METAS.find((c) => c.id === claim.costume)?.name || claim.costume}
                  </span>
                </div>

                <div className="text-[11px] text-neutral-400 font-mono">
                  {claim.time} ({claim.region_context})
                </div>
              </div>

              {/* Claim Statement */}
              <div className="text-sm font-medium text-white leading-relaxed">
                {claim.claim}
              </div>

              {/* Evidence & Sources */}
              <div className="p-3 rounded-xl bg-[#0e1016] border border-[#202534] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Tài liệu khảo cứu / Chứng cứ lịch sử:
                </div>
                <div className="text-xs text-neutral-300 italic">
                  {claim.evidence}
                </div>
              </div>

              {/* AI Rule */}
              <div className="text-[11px] text-[#e5b94c] bg-[#d4af37]/5 p-3 rounded-xl border border-[#d4af37]/20 leading-relaxed">
                <strong className="text-[#d4af37]">Quy tắc áp dụng cho AI Stylist & Heritage Guard:</strong>{' '}
                {claim.ai_rule}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
