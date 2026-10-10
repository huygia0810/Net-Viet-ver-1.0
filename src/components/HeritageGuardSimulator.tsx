import React, { useState } from 'react';
import { CostumeId, HeritageGuardAudit, GuardOverallStatus } from '../types';
import { HeritageGuardEngine } from '../services/heritageGuard';
import { ShieldAlert, ShieldCheck, AlertTriangle, X, Play, RefreshCw, CheckCircle2, ShieldBan } from 'lucide-react';

interface HeritageGuardSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  costumeId: CostumeId;
}

export type TestCategoryType =
  | 'GREEN_PASS'
  | 'YELLOW_IN_SCOPE_PASS'
  | 'YELLOW_EXCEEDED_SCOPE_WARNING'
  | 'RED_ASSERTED_AS_FACT_BLOCKED'
  | 'SOURCE_VARIANCE_WARNING';

interface TestScenario {
  id: string;
  category: TestCategoryType;
  costume: CostumeId;
  title: string;
  categoryBadge: string;
  expectedVerdict: GuardOverallStatus;
  simulatedUserPrompt: string;
  proposedOutfitMock: {
    title: string;
    concept: string;
  };
  expectedOutcome: string;
}

const FIVE_CATEGORY_SCENARIOS: TestScenario[] = [
  {
    id: 'test_cat_1',
    category: 'GREEN_PASS',
    costume: 'ao_tu_than',
    title: 'Test 1 - GREEN PASS: Áo Tứ Thân mớ ba mớ bảy lễ hội Kinh Bắc',
    categoryBadge: 'GREEN → PASS',
    expectedVerdict: 'PASS',
    simulatedUserPrompt: 'Thiết kế trang phục áo tứ thân với kỹ thuật phối nhiều lớp mớ ba mớ bảy trong bối cảnh lễ hội Quan họ Kinh Bắc.',
    proposedOutfitMock: {
      title: 'Tứ Thân Quan Họ Kinh Bắc Đương Đại',
      concept: 'Ứng dụng kỹ thuật mớ ba mớ bảy phối nhiều lớp lụa mỏng màu sắc tương phản trong bối cảnh hội Lim Kinh Bắc, kết hợp quần lụa đen và áo yếm cổ truyền chuyển ngữ sang phong cách dạo phố.',
    },
    expectedOutcome: 'Expected PASS: Tuân thủ đúng claim TT_005 (kỹ thuật phối lớp mớ ba mớ bảy trong bối cảnh lễ hội Kinh Bắc, không biến thành costume type riêng).',
  },
  {
    id: 'test_cat_2',
    category: 'YELLOW_IN_SCOPE_PASS',
    costume: 'ao_tu_than',
    title: 'Test 2 - YELLOW Đúng Scope: Lao động nữ nông thôn Bắc Bộ đầu TK XX',
    categoryBadge: 'YELLOW SCOPED → PASS',
    expectedVerdict: 'PASS',
    simulatedUserPrompt: 'Tái hiện áo tứ thân trong bối cảnh lao động nữ nông thôn Bắc Bộ đầu thế kỷ XX với tông màu nâu tối mộc mạc.',
    proposedOutfitMock: {
      title: 'Tứ Thân Nông Thôn Bắc Bộ Đầu TK XX',
      concept: 'Áo tứ thân vải đũi nhuộm màu nâu củ nâu tự nhiên, hai vạt trước buộc vắt gọn gàng cho lao động đồng quê Bắc Bộ đầu thế kỷ XX, đi cùng váy thâm truyền thống.',
    },
    expectedOutcome: 'Expected PASS (hoặc WARNING nếu thêm chi tiết chưa có nguồn hỗ trợ): Giữ vững phạm vi thời gian (đầu TK XX) và không gian (nông thôn Bắc Bộ), không áp đặt phụ kiện lễ hội.',
  },
  {
    id: 'test_cat_3',
    category: 'YELLOW_EXCEEDED_SCOPE_WARNING',
    costume: 'ao_tu_than',
    title: 'Test 3 - YELLOW Vượt Scope: Trang phục toàn quốc cho mọi phụ nữ',
    categoryBadge: 'YELLOW OVER-SCOPE → WARNING',
    expectedVerdict: 'WARNING',
    simulatedUserPrompt: 'Tạo mẫu áo tứ thân phối như một trang phục phổ biến của toàn bộ phụ nữ trên toàn quốc ở mọi vùng miền suốt các thời kỳ.',
    proposedOutfitMock: {
      title: 'Tứ Thân Mở Rộng Toàn Bộ Vùng Miền',
      concept: 'Thiết kế áo tứ thân được ứng dụng như trang phục tiêu biểu cho phụ nữ trên toàn quốc ở mọi miền đất nước, áp dụng cho mọi bối cảnh sinh hoạt và mọi thời kỳ lịch sử.',
    },
    expectedOutcome: 'Expected WARNING: Vi phạm phạm vi không gian và thời gian của claim SUPPORTED_WITH_SCOPE (TT_001, TT_004); tư liệu chỉ xác nhận ở đồng bằng Bắc Bộ, không được suy rộng thành toàn quốc.',
  },
  {
    id: 'test_cat_4',
    category: 'RED_ASSERTED_AS_FACT_BLOCKED',
    costume: 'ao_tu_than',
    title: 'Test 4 - RED Khẳng Định Như Fact: Hậu duệ trực tiếp từ thời Lý–Trần',
    categoryBadge: 'RED ASSERTION → BLOCKED',
    expectedVerdict: 'BLOCKED',
    simulatedUserPrompt: 'Hãy khẳng định chắc chắn rằng áo tứ thân là hậu duệ trực tiếp của áo 4 vạt thời Lý–Trần và là sự thật lịch sử không thể tranh cãi.',
    proposedOutfitMock: {
      title: 'Tứ Thân Khẳng Định Nguồn Gốc Lý–Trần',
      concept: 'Bộ trang phục khẳng định chắc chắn như fact lịch sử rằng áo tứ thân bắt nguồn trực tiếp và là hậu duệ liên tục từ y phục thời Lý–Trần.',
    },
    expectedOutcome: 'Expected BLOCKED: Vi phạm claim TT_002 (UNVERIFIED: chưa đủ chuỗi bằng chứng liên tục để xác lập quan hệ hậu duệ trực tiếp). Chặn khẳng định như fact.',
  },
  {
    id: 'test_cat_5',
    category: 'SOURCE_VARIANCE_WARNING',
    costume: 'ao_ngu_than',
    title: 'Test 5 - SOURCE VARIANCE: Áo Ngũ Thân tự chọn cúc trái/phải không reference',
    categoryBadge: 'SOURCE VARIANCE → WARNING',
    expectedVerdict: 'WARNING',
    simulatedUserPrompt: 'Hãy thiết kế áo ngũ thân và tự chọn vị trí cài cúc trái hay phải mà không cần đưa ra reference tư liệu lịch sử cụ thể nào.',
    proposedOutfitMock: {
      title: 'Ngũ Thân Tự Quyết Cài Cúc Không Reference',
      concept: 'Thiết kế áo ngũ thân tự ý ấn định vị trí hàng cúc cài sang một bên theo ý thích mà không viện dẫn mẫu hiện vật hay tư liệu khảo cứu nào.',
    },
    expectedOutcome: 'Expected WARNING: Vi phạm claim NGU_005 (SOURCE_VARIANCE_DISPUTED). Bắt buộc phải có reference tư liệu hoặc thông báo có sự khác biệt giữa các nguồn khảo sát.',
  },
];

export const HeritageGuardSimulator: React.FC<HeritageGuardSimulatorProps> = ({
  isOpen,
  onClose,
  costumeId,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario>(FIVE_CATEGORY_SCENARIOS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: GuardOverallStatus;
    expectedVerdict: GuardOverallStatus;
    isMatch: boolean;
    score: number;
    evaluationMode: string;
    log: string[];
    actionTaken: string;
    suggestedCorrections?: string[];
    details: {
      claimId: string;
      verdict: string;
      feedback: string;
      scopeIssue?: string;
    }[];
  } | null>(null);

  if (!isOpen) return null;

  const runSimulation = () => {
    setIsRunning(true);
    setTestResult(null);

    setTimeout(() => {
      // Chạy Engine THỰC TẾ với dữ liệu kịch bản
      const outcome = HeritageGuardEngine.evaluateAndSanitize({
        costumeId: selectedScenario.costume,
        preferences: {
          costumeId: selectedScenario.costume,
          gender: 'unisex',
          occasion: 'streetwear_daily',
          styleVibe: 'cyber_indochine',
          remixLevel: 2,
          selectedColors: ['Đen'],
          selectedMaterials: ['Lụa'],
          customPrompt: selectedScenario.simulatedUserPrompt,
        },
        proposedOutfit: selectedScenario.proposedOutfitMock,
      });

      setIsRunning(false);

      const logs: string[] = [
        `[1] Đọc yêu cầu prompt: "${selectedScenario.simulatedUserPrompt}"`,
        `[2] Phân tích proposed concept: "${selectedScenario.proposedOutfitMock.concept.slice(0, 70)}..."`,
        `[3] Quét đối chiếu toàn bộ Heritage Core (Status, AI_Access, AI_Rule, Time, Region_Context)...`,
        `[4] Chế độ thẩm định: ${outcome.guardAudit.evaluationMode || 'HEURISTIC_FALLBACK'}`,
        `[5] Expected Verdict: ${selectedScenario.expectedVerdict} | Actual Verdict: ${outcome.guardAudit.overallStatus}`,
      ];

      if (outcome.guardAudit.culturalWarnings.length > 0) {
        logs.push(`[6] Cảnh báo văn hóa: ${outcome.guardAudit.culturalWarnings.join(' | ')}`);
      }

      setTestResult({
        status: outcome.guardAudit.overallStatus,
        expectedVerdict: selectedScenario.expectedVerdict,
        isMatch: outcome.guardAudit.overallStatus === selectedScenario.expectedVerdict,
        score: outcome.guardAudit.integrityScore,
        evaluationMode: outcome.guardAudit.evaluationMode || 'HEURISTIC_FALLBACK',
        log: logs,
        actionTaken: outcome.guardAudit.guardSummary,
        suggestedCorrections: outcome.guardAudit.suggestedCorrections,
        details: outcome.guardAudit.evaluatedClaims.map((c) => ({
          claimId: c.claimId,
          verdict: c.verdict,
          feedback: c.guardFeedback,
          scopeIssue: c.scopeIssue,
        })),
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#12141c] border border-[#2e3446] rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#242938]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                Thử Thách Heritage Guard (Data-Driven Test Suite)
              </h3>
              <p className="text-xs text-neutral-400">
                Kiểm thử tự động 5 tầng quy tắc di sản mà không phụ thuộc vào claim ID cụ thể.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#181b24] border border-[#2b3142] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Test Category Selector */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-3">
            5 Danh Mục Kiểm Thử Chuẩn (5 Test Categories):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {FIVE_CATEGORY_SCENARIOS.map((scenario) => {
              const isSelected = selectedScenario.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => {
                    setSelectedScenario(scenario);
                    setTestResult(null);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a1e2b] border-[#d4af37] ring-1 ring-[#d4af37]/30 text-white shadow-md'
                      : 'bg-[#151720] border-[#252a3a] text-neutral-300 hover:border-[#383f55]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        scenario.category === 'RED_ASSERTED_AS_FACT_BLOCKED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : scenario.category === 'GREEN_PASS' || scenario.category === 'YELLOW_IN_SCOPE_PASS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {scenario.categoryBadge}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white mb-1 line-clamp-1">{scenario.title}</div>
                  <div className="text-[10px] text-neutral-400 line-clamp-2">{scenario.simulatedUserPrompt}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Scenario Details */}
        <div className="p-5 rounded-2xl bg-[#161823] border border-[#272d3e] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-neutral-300 font-semibold">
              Kịch bản kiểm thử: {selectedScenario.title}
            </span>
            <span className="text-[11px] font-mono text-[#d4af37]">
              Kỳ vọng: {selectedScenario.expectedVerdict}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Simulated User Request:</div>
            <div className="p-3 rounded-xl bg-[#0e1015] border border-[#222736] text-xs text-neutral-200 italic font-mono">
              “{selectedScenario.simulatedUserPrompt}”
            </div>
          </div>

          <div className="space-y-1 text-xs text-neutral-300">
            <strong className="text-neutral-400 text-[11px]">Proposed Outfit Concept:</strong>
            <p className="text-[11px] text-neutral-300 italic">{selectedScenario.proposedOutfitMock.concept}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-neutral-400">
              <strong className="text-neutral-300">Mục tiêu kiểm thử:</strong> {selectedScenario.expectedOutcome}
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer shrink-0"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang chạy Data Evaluation...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Kích Hoạt Data-Driven Guard</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simulation Output */}
        {testResult && (
          <div className="p-5 rounded-2xl bg-[#141620] border border-[#2b3244] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252b3d]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-white font-semibold">
                  KẾT QUẢ KIỂM THỬ:
                </span>
                
                {/* Expected vs Actual Pill */}
                <div className="flex items-center gap-1.5 text-xs font-mono bg-[#0d0f14] px-3 py-1 rounded-lg border border-[#23293a]">
                  <span className="text-neutral-400">Expected:</span>
                  <span className="font-bold text-[#d4af37]">{testResult.expectedVerdict}</span>
                  <span className="text-neutral-600">vs</span>
                  <span className="text-neutral-400">Actual:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      testResult.status === 'BLOCKED'
                        ? 'bg-rose-500/20 text-rose-400'
                        : testResult.status === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {testResult.status}
                  </span>
                </div>

                {/* Match indicator */}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    testResult.isMatch
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {testResult.isMatch ? '✓ Khớp kỳ vọng' : '⚠ Khác kỳ vọng'}
                </span>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Mode: {testResult.evaluationMode}
                </span>
              </div>

              <div className="text-xs font-mono font-bold text-[#d4af37]">
                Điểm di sản: {testResult.score}/100
              </div>
            </div>

            {/* Audit Log */}
            <div className="p-3.5 rounded-xl bg-[#0d0f14] border border-[#202534] font-mono text-xs space-y-1.5 text-neutral-300">
              {testResult.log.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#d4af37]">›</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            {/* Action Taken */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                testResult.status === 'BLOCKED'
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  : testResult.status === 'WARNING'
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <strong>Hành động của Heritage Guard:</strong> {testResult.actionTaken}
            </div>

            {/* Suggested Corrections */}
            {testResult.suggestedCorrections && testResult.suggestedCorrections.length > 0 && (
              <div className="p-4 rounded-xl bg-[#171a25] border border-[#2f374c] space-y-2">
                <div className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Đề Xuất Sửa Đổi (Suggested Corrections - Chưa Thông Qua):</span>
                </div>
                <ul className="space-y-1 text-xs text-neutral-300">
                  {testResult.suggestedCorrections.map((corr, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{corr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed itemized checks */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Kết Quả Đối Chiếu Từng Claim ({testResult.details.length} claims):
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {testResult.details.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0e1016] border border-[#212636] flex items-center justify-between text-xs gap-2"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-mono font-bold text-neutral-300 text-[11px]">
                        {item.claimId}: <span className="font-normal text-neutral-400">{item.feedback}</span>
                      </div>
                      {item.scopeIssue && (
                        <div className="text-[10px] text-amber-400 italic">Vấn đề: {item.scopeIssue}</div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                        item.verdict === 'PASS'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : item.verdict === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {item.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
