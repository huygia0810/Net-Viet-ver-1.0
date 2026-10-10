import React, { useState } from 'react';
import { OutfitResult, CostumeMeta, HeritageGuardAudit } from '../types';
import { LookbookSilhouette } from './LookbookSilhouette';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Music,
  Check,
  Copy,
  ArrowRight,
  Info,
} from 'lucide-react';

interface BlockedAuditViewProps {
  audit: HeritageGuardAudit;
  costumeMeta?: CostumeMeta;
  onModifyPreferences?: () => void;
  onStressTestTrigger?: () => void;
}

/**
 * Dedicated BlockedAuditView component:
 * When an outfit is BLOCKED by Heritage Guard, ONLY audit details are rendered.
 * Strictly avoids rendering silhouette, color palette, materials, outfit pieces, concept, or lookbook tabs.
 */
export const BlockedAuditView: React.FC<BlockedAuditViewProps> = ({
  audit,
  costumeMeta,
  onModifyPreferences,
  onStressTestTrigger,
}) => {
  return (
    <div className="w-full bg-[#120f13] border-2 border-rose-500/60 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rose-900/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest text-rose-400 font-semibold font-mono">
              HERITAGE GUARD AUDIT · REJECTED
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 font-mono">
              {costumeMeta?.vietnameseTitle || 'Việt phục'}
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-rose-200 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
            <span>Thiết Kế Bị Chặn (BLOCKED)</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 rounded-full text-rose-300 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>TỪ CHỐI / BLOCKED ({audit.integrityScore}/100)</span>
          </div>
        </div>
      </div>

      {/* Main Notice */}
      <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-100 space-y-3">
        <p className="text-sm text-rose-100 leading-relaxed font-medium">
          Thiết kế này <strong>không được phê duyệt</strong> vì vi phạm các nguyên tắc cốt lõi trong Human-Reviewed Heritage Core. 
          Toàn bộ chi tiết tạo hình, bảng màu và lookbook bị ẩn hoàn toàn để bảo toàn liêm chính di sản.
        </p>
        <div className="p-4 rounded-xl bg-black/50 border border-rose-500/30 text-xs font-mono text-rose-200">
          <strong className="text-rose-300 block mb-1">Lý do từ chối:</strong>
          {audit.guardSummary}
        </div>
      </div>

      {/* Cultural Warnings if any */}
      {audit.culturalWarnings && audit.culturalWarnings.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-xs text-amber-300 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Cảnh Báo Di Sản & Bối Cảnh Vi Phạm:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-100/90 leading-relaxed">
            {audit.culturalWarnings.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Itemized Claims Evaluation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-neutral-300 font-semibold">
            Chi Tiết Thẩm Định Từng Claim Di Sản ({audit.evaluatedClaims.length} Quy Tắc):
          </h3>
          <span className="text-[11px] font-mono text-neutral-500">
            {audit.evaluationMode || 'HERITAGE_GUARD'}
          </span>
        </div>

        <div className="space-y-3">
          {audit.evaluatedClaims.map((claim, idx) => {
            const isBlocked = claim.verdict === 'BLOCKED';
            const isWarning = claim.verdict === 'WARNING';
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                  isBlocked
                    ? 'bg-rose-950/30 border-rose-800/60'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-800/40'
                    : 'bg-[#151822] border-[#272d3e]'
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        claim.access === 'GREEN'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : claim.access === 'YELLOW'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {claim.claimId} [{claim.access}]
                    </span>
                    <span className="font-medium text-white">{claim.claimText}</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    {claim.guardFeedback}
                  </p>
                  {claim.scopeIssue && (
                    <div className="text-[10px] text-amber-300 font-mono bg-amber-950/40 px-2 py-0.5 rounded inline-block">
                      Phạm vi / Bối cảnh liên quan: {claim.scopeIssue}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <span
                    className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full ${
                      isBlocked
                        ? 'bg-rose-900/60 text-rose-200 border border-rose-500/60'
                        : isWarning
                        ? 'bg-amber-900/40 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isBlocked ? '⛔ BLOCKED' : isWarning ? '⚠ WARNING' : '✓ PASS'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Corrections */}
      {audit.suggestedCorrections && audit.suggestedCorrections.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#1b1924] border border-[#3d2f44] space-y-2">
          <div className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Gợi Ý Điều Chỉnh Để Đạt Chuẩn (Suggested Corrections):</span>
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-300">
            {audit.suggestedCorrections.map((corr, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{corr}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 border-t border-rose-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        {onModifyPreferences && (
          <button
            onClick={onModifyPreferences}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Điều chỉnh lại yêu cầu & tùy chọn thiết kế</span>
          </button>
        )}

        {onStressTestTrigger && (
          <button
            onClick={onStressTestTrigger}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mở Giả Lập Stress-Test Heritage Guard</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface ResultDisplayProps {
  outfit: OutfitResult | null;
  costumeMeta?: CostumeMeta;
  error?: { code?: string; message: string } | null;
  onStressTestTrigger?: () => void;
  onModifyPreferences?: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  outfit,
  costumeMeta,
  error,
  onStressTestTrigger,
  onModifyPreferences,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'lookbook' | 'pieces' | 'heritage' | 'guard'>('lookbook');

  // 1. Error state display
  if (error) {
    return (
      <div className="w-full bg-[#181114] border-2 border-rose-500/50 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 text-rose-400">
          <ShieldAlert className="w-7 h-7 shrink-0" />
          <h3 className="font-editorial text-2xl font-bold text-white">
            Từ Chối Tạo Outfit ({error.code || 'ERROR'})
          </h3>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">
          {error.message}
        </p>
        {onModifyPreferences && (
          <div className="pt-4 border-t border-[#332228]">
            <button
              onClick={onModifyPreferences}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Chọn lại cổ phục hoặc tùy chỉnh thông số ↑
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. Empty state when no outfit has been generated yet
  if (!outfit) {
    return (
      <div className="w-full bg-[#101218] border border-[#232734] rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#d4af37] flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-editorial text-2xl font-bold text-white">Chưa Có Bản Thiết Kế</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Chọn một dòng cổ phục tại Bước 1, thiết lập phong cách tại Bước 2 và nhấn{' '}
            <strong className="text-white">Khởi Tạo Thiết Kế Remix & Duyệt Di Sản</strong> để AI Stylist sáng tạo cùng Heritage Guard thẩm định.
          </p>
        </div>
        {onModifyPreferences && (
          <button
            onClick={onModifyPreferences}
            className="px-6 py-2.5 rounded-xl bg-[#1b1f2c] border border-[#2d3448] text-xs font-semibold text-[#d4af37] hover:text-white hover:bg-[#252b3d] transition-colors cursor-pointer"
          >
            Đến bảng điều khiển sáng tạo ↑
          </button>
        )}
      </div>
    );
  }

  // 3. Enforce BLOCKED isolation: Render ONLY the BlockedAuditView component
  if (outfit.heritageGuardAudit.overallStatus === 'BLOCKED') {
    return (
      <BlockedAuditView
        audit={outfit.heritageGuardAudit}
        costumeMeta={costumeMeta}
        onModifyPreferences={onModifyPreferences}
        onStressTestTrigger={onStressTestTrigger}
      />
    );
  }

  // 4. Approved Outfit Lookbook (PASS or WARNING)
  const { pieces, preservedTraditionalElements, modernRemixInterventions, heritageNotes, heritageGuardAudit } = outfit;

  const handleCopySummary = () => {
    const summary = `[NÉT VIỆT - Việt phục Remix]
Outfit: ${outfit.title}
Concept: ${outfit.concept}
Áo chính: ${pieces.mainPiece.name}
Quần/Váy: ${pieces.bottomPiece.name}
Điểm nhấn truyền thống: ${preservedTraditionalElements.map((e) => e.title).join(', ')}
Điểm nhấn hiện đại: ${modernRemixInterventions.map((e) => e.title).join(', ')}
Heritage Guard: ${heritageGuardAudit.overallStatus} (Điểm di sản: ${heritageGuardAudit.integrityScore}/100)`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isHeuristicFallback = heritageGuardAudit.evaluationMode === 'HEURISTIC_FALLBACK';
  const isTestMock = heritageGuardAudit.evaluationMode === 'TEST_MOCK';
  const isEvaluatedWarning = !isHeuristicFallback && !isTestMock && heritageGuardAudit.overallStatus === 'WARNING';
  const isApprovedPass = heritageGuardAudit.evaluationMode === 'GEMINI_EVALUATOR' && heritageGuardAudit.overallStatus === 'PASS';

  // Can only copy/share if officially passed by semantic evaluator (never for TEST_MOCK or fallback)
  const canShare = isApprovedPass;

  const getGuardStatusBadge = () => {
    if (isTestMock) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-500/15 border border-neutral-500/40 rounded-full text-neutral-300 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-neutral-400" />
          <span>MÔ PHỎNG KIỂM THỬ — TEST MOCK PIPELINE ({heritageGuardAudit.integrityScore}/100)</span>
        </div>
      );
    }
    if (isHeuristicFallback) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 rounded-full text-amber-300 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>BẢN THAM KHẢO — CHƯA HOÀN TẤT SEMANTIC REVIEW ({heritageGuardAudit.integrityScore}/100)</span>
        </div>
      );
    }
    if (isEvaluatedWarning) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 rounded-full text-amber-300 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>ĐÃ ĐÁNH GIÁ — CÒN CẢNH BÁO, CHƯA ĐẠT PASS ({heritageGuardAudit.integrityScore}/100)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold">
        <ShieldCheck className="w-4 h-4" />
        <span>HERITAGE GUARD PASS ({heritageGuardAudit.integrityScore}/100)</span>
      </div>
    );
  };

  const getHeaderSubTitle = () => {
    if (isHeuristicFallback) {
      return {
        text: 'BẢN THIẾT KẾ THAM KHẢO — CHƯA HOÀN TẤT SEMANTIC REVIEW',
        color: 'text-amber-400',
      };
    }
    if (isEvaluatedWarning) {
      return {
        text: 'THIẾT KẾ ĐÃ ĐÁNH GIÁ — CÒN CẢNH BÁO BỐI CẢNH (CHƯA ĐẠT PASS)',
        color: 'text-amber-300',
      };
    }
    return {
      text: 'BẢN THIẾT KẾ LOOKBOOK HERITAGE GUARD PASS',
      color: 'text-[#d4af37]',
    };
  };

  const headerStatus = getHeaderSubTitle();

  return (
    <div className="w-full bg-[#101218] border border-[#232734] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-10">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222736]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs uppercase tracking-widest font-semibold ${headerStatus.color}`}>
              {headerStatus.text}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 font-mono">
              {costumeMeta?.vietnameseTitle || 'Việt phục'}
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {outfit.title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 italic mt-1 font-light">
            “{outfit.tagline}”
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {getGuardStatusBadge()}

          {canShare ? (
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[#181c26] hover:bg-[#222838] border border-[#2e3547] rounded-xl transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Chia sẻ Outfit'}</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 text-[11px] font-medium text-neutral-400 bg-[#161822] border border-[#262c3e] rounded-xl">
              {isHeuristicFallback ? 'Chưa hoàn tất semantic review' : 'Cần xử lý cảnh báo trước khi chia sẻ'}
            </div>
          )}
        </div>
      </div>

      {/* Cultural Warning Banner if any warning triggered */}
      {heritageGuardAudit.culturalWarnings.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-200">
          <div className="flex items-center gap-2 font-semibold text-sm mb-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Thông Báo Heritage Guard Về Bối Cảnh Lịch Sử:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-100/90 leading-relaxed">
            {heritageGuardAudit.culturalWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid: Visual Silhouette + Concept Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: SVG Silhouette Lookbook Board */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <LookbookSilhouette
              costumeId={outfit.costumeId}
              palette={pieces.colorScheme}
              remixLevel={2}
            />
          </div>

          {/* Music Vibe Chip */}
          <div className="p-4 rounded-xl bg-[#151720] border border-[#262a38] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#b93828]/20 border border-[#b93828]/30 flex items-center justify-center text-[#e5b94c]">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                Giai Điệu & Mood Phù Hợp
              </div>
              <div className="text-xs font-medium text-white">{outfit.musicVibe}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Concept, Silhouette, and Color Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {/* Concept Card */}
          <div className="p-6 rounded-2xl bg-[#141620] border border-[#262a38]">
            <h3 className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-2">
              Ý Niệm Thiết Kế (Design Philosophy)
            </h3>
            <p className="text-sm text-neutral-200 leading-relaxed mb-4">
              {outfit.concept}
            </p>

            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">
              Phom Dáng Tổng Thể (Silhouette)
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {outfit.silhouette}
            </p>
          </div>

          {/* Color Palette Breakdown */}
          <div className="p-6 rounded-2xl bg-[#141620] border border-[#262a38]">
            <h3 className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-3">
              Bảng Màu & Ý Nghĩa Văn Hóa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pieces.colorScheme.map((color, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#191d29] border border-[#2a3042] flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-semibold text-white truncate">{color.name}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 leading-snug">
                    {color.culturalMeaning}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="p-6 rounded-2xl bg-[#141620] border border-[#262a38]">
            <h3 className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-2">
              Vật Liệu & Xử Lý Bề Mặt
            </h3>
            <div className="flex flex-wrap gap-2">
              {pieces.materials.map((mat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-[#191d29] border border-[#2d3446] text-xs text-neutral-200"
                >
                  {mat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION TABS FOR DEEP EXPLORATION */}
      <div className="pt-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#252936] pb-3">
          <button
            onClick={() => setActiveTab('lookbook')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'lookbook'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-[#151720]'
            }`}
          >
            A. Bóc Tách Từng Món (Outfit Pieces)
          </button>
          <button
            onClick={() => setActiveTab('pieces')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pieces'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-[#151720]'
            }`}
          >
            B & C. Yếu Tố Bảo Lưu vs. Remix
          </button>
          <button
            onClick={() => setActiveTab('heritage')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'heritage'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-[#151720]'
            }`}
          >
            D. Heritage Notes (Dữ Kiện Lịch Sử)
          </button>
          <button
            onClick={() => setActiveTab('guard')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'guard'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-[#151720]'
            }`}
          >
            E. Heritage Guard Audit Report
          </button>
        </div>
      </div>

      {/* TAB A: OUTFIT PIECES BREAKDOWN */}
      {activeTab === 'lookbook' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Main Piece */}
            <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
              <div className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
                ÁO CHÍNH (HERO PIECE)
              </div>
              <h4 className="font-editorial text-lg font-bold text-white mb-2">
                {pieces.mainPiece.name}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                {pieces.mainPiece.description}
              </p>
              {pieces.mainPiece.heritageOrigin && (
                <div className="p-2.5 rounded-lg bg-[#191d29] text-[11px] text-neutral-400 border border-[#292f40]">
                  <strong className="text-neutral-300">Gốc gác lịch sử:</strong> {pieces.mainPiece.heritageOrigin}
                </div>
              )}
            </div>

            {/* Bottom Piece */}
            <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
              <div className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
                QUẦN / VÁY PHỐI KÈM
              </div>
              <h4 className="font-editorial text-lg font-bold text-white mb-2">
                {pieces.bottomPiece.name}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                {pieces.bottomPiece.description}
              </p>
              {pieces.bottomPiece.materialUsed && (
                <div className="p-2.5 rounded-lg bg-[#191d29] text-[11px] text-neutral-400 border border-[#292f40]">
                  <strong className="text-neutral-300">Chất liệu:</strong> {pieces.bottomPiece.materialUsed}
                </div>
              )}
            </div>

            {/* Layering Piece */}
            {pieces.layeringPiece && (
              <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
                <div className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
                  PHỐI LỚP / ÁO LÓT (LAYERING)
                </div>
                <h4 className="font-editorial text-lg font-bold text-white mb-2">
                  {pieces.layeringPiece.name}
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                  {pieces.layeringPiece.description}
                </p>
              </div>
            )}

            {/* Footwear */}
            <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
              <div className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
                GIÀY DÉP (FOOTWEAR)
              </div>
              <h4 className="font-editorial text-lg font-bold text-white mb-2">
                {pieces.footwear.name}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {pieces.footwear.description}
              </p>
            </div>
          </div>

          {/* Accessories list */}
          {pieces.accessories && pieces.accessories.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
              <div className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold mb-3">
                PHỤ KIỆN ĐỒNG BỘ (ACCESSORIES)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pieces.accessories.map((acc, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#191d29] border border-[#2a3042]">
                    <div className="font-semibold text-xs text-white mb-1">{acc.name}</div>
                    <div className="text-[11px] text-neutral-300">{acc.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Styling Tips */}
          {outfit.stylingTips && outfit.stylingTips.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#161a25] border border-[#2a3144]">
              <div className="text-xs uppercase tracking-wider text-[#e5b94c] font-semibold mb-2">
                GỢI Ý TẠO DÁNG & DIỆN TRANG PHỤC (STYLING TIPS)
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {outfit.stylingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#d4af37] font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB B: PRESERVED TRADITIONAL VS MODERN REMIX */}
      {activeTab === 'pieces' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Anchors */}
          <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="font-editorial text-lg font-bold text-white">
                B. Các Yếu Tố Truyền Thống Bảo Lưu
              </h3>
            </div>
            <div className="space-y-4">
              {preservedTraditionalElements.map((elem, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#191d29] border border-[#272d3e]">
                  <h4 className="text-xs font-bold text-emerald-300 mb-1">
                    {elem.title}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                    {elem.explanation}
                  </p>
                  <span className="text-[10px] font-mono text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20">
                    {elem.heritageRuleReference}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modern Remix Interventions */}
          <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e5b94c]" />
              <h3 className="font-editorial text-lg font-bold text-white">
                C. Các Yếu Tố Hiện Đại Được Remix
              </h3>
            </div>
            <div className="space-y-4">
              {modernRemixInterventions.map((remix, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#191d29] border border-[#272d3e]">
                  <h4 className="text-xs font-bold text-[#e5b94c] mb-1">
                    {remix.title}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                    {remix.explanation}
                  </p>
                  <div className="text-[11px] text-neutral-400 italic">
                    <strong>Động lực thiết kế:</strong> {remix.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB D: HERITAGE NOTES */}
      {activeTab === 'heritage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Scoped Facts */}
            <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
              <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">
                01. Dữ Kiện Có Phạm Vi
              </div>
              <p className="text-[11px] text-neutral-400 mb-4">
                Thông tin chuẩn xác nhưng gắn với thời gian, sắc lệnh hoặc vùng miền nhất định.
              </p>
              <ul className="space-y-2 text-xs text-neutral-200">
                {heritageNotes.scopedFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#d4af37]">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contextual Mandates */}
            <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                02. Bối Cảnh Cần Giữ Đúng
              </div>
              <p className="text-[11px] text-neutral-400 mb-4">
                Những ranh giới văn hóa không được phép làm sai lệch khi sáng tạo thời trang.
              </p>
              <ul className="space-y-2 text-xs text-neutral-200">
                {heritageNotes.contextualMandates.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Uncertainties */}
            <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                03. Điều AI Không Nên Khẳng Định
              </div>
              <p className="text-[11px] text-neutral-400 mb-4">
                Giới hạn của trí tuệ nhân tạo: không bịa đặt nguồn gốc và không biến giả thuyết thành chân lý.
              </p>
              <ul className="space-y-2 text-xs text-neutral-200">
                {heritageNotes.aiUncertainties.map((u, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB E: HERITAGE GUARD AUDIT REPORT */}
      {activeTab === 'guard' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#141620] border border-[#2a3042]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252938]">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                  HỆ THỐNG GIÁM SÁT DI SẢN TỰ ĐỘNG
                </span>
                <h3 className="font-editorial text-xl font-bold text-white mt-1">
                  Heritage Guard Inspection Report
                </h3>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-[#d4af37]">
                  {heritageGuardAudit.integrityScore}/100
                </div>
                <div className="text-[11px] text-neutral-400">Chỉ số liêm chính di sản</div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mt-4 italic leading-relaxed">
              “{heritageGuardAudit.guardSummary}”
            </p>

            {heritageGuardAudit.suggestedCorrections && heritageGuardAudit.suggestedCorrections.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-[#1b1f2c] border border-[#2d364c] space-y-2">
                <div className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Đề Xuất Sửa Đổi Của Heritage Guard (Suggested Corrections - Chưa Thông Qua):</span>
                </div>
                <ul className="space-y-1 text-xs text-neutral-300">
                  {heritageGuardAudit.suggestedCorrections.map((corr, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{corr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Itemized Claims Check */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Chi Tiết Đánh Giá Từng Claim Trong Heritage Core ({heritageGuardAudit.evaluatedClaims.length} Quy Tắc):
            </h4>

            {heritageGuardAudit.evaluatedClaims.map((claim, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#151822] border border-[#272d3e] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        claim.access === 'GREEN'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : claim.access === 'YELLOW'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {claim.access} CLAIM
                    </span>
                    <span className="font-medium text-white">{claim.claimText}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {claim.guardFeedback}
                  </p>
                </div>

                <div className="shrink-0">
                  <span
                    className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full ${
                      claim.verdict === 'PASS'
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40'
                        : claim.verdict === 'WARNING'
                        ? 'bg-amber-900/40 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-900/40 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {claim.verdict === 'PASS'
                      ? '✓ PASS'
                      : claim.verdict === 'WARNING'
                      ? '⚠ WARNING'
                      : '⛔ BLOCKED'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA to stress-test Heritage Guard */}
          {onStressTestTrigger && (
            <div className="p-5 rounded-2xl bg-[#1b171f] border border-[#3d273a] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-rose-300 mb-1">
                  Dành Cho Ban Giám Khảo AI Arena: Thử Thách Phòng Thủ Văn Hóa
                </div>
                <div className="text-[11px] text-neutral-400">
                  Kích hoạt các tình huống vi phạm có chủ đích (Tả nhậm, ngụy tạo Hùng Vương...) để xem Heritage Guard phản ứng thế nào.
                </div>
              </div>
              <button
                onClick={onStressTestTrigger}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Mở Giả Lập Stress-Test
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="pt-6 border-t border-[#222736] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onModifyPreferences}
          className="text-xs text-[#d4af37] hover:text-[#f3cd66] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>← Thay đổi tùy chọn hoặc chọn cổ phục khác</span>
        </button>

        <div className="text-xs text-neutral-500 font-mono">
          NÉT VIỆT · VIỆT PHỤC REMIX PROTOTYPE 2026
        </div>
      </div>
    </div>
  );
};
