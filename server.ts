import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { HERITAGE_CORE_DATABASE, COSTUME_METAS, getCostumeHeritageClaims } from './src/data/heritageCore';
import { HeritageGuardEngine } from './src/services/heritageGuard';
import { getSampleOutfit, SAMPLE_OUTFITS_BY_COSTUME } from './src/data/mockOutfits';
import { CostumeId, StylingPreferences, OutfitResult, HeritageGuardAudit, EvaluatedClaimCheck } from './src/types';
import { validateGeminiEvaluatorOutput, EvaluatorValidationResult } from './src/services/heritageEvaluatorValidator';
import { createBlockedPurgedOutfit } from './src/services/sanitizeBlockedOutfit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface NetVietAppOptions {
  enableTestMockAi?: boolean;
  aiClient?: GoogleGenAI | null;
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- GEMINI EVALUATOR ENGINE ----------------

async function callGeminiEvaluator(
  aiClient: GoogleGenAI,
  costume: (typeof COSTUME_METAS)[0],
  claims: typeof HERITAGE_CORE_DATABASE,
  preferences: StylingPreferences,
  proposedOutfit: Partial<OutfitResult>
): Promise<HeritageGuardAudit | null> {
  const claimsPrompt = claims
    .map(
      (c) =>
        `- ID: ${c.id} | ACCESS: ${c.ai_access} | STATUS: ${c.status}
  Nội dung: ${c.claim}
  Bằng chứng: ${c.evidence}
  Thời gian: ${c.time} | Khu vực/Bối cảnh: ${c.region_context}
  Quy tắc AI: ${c.ai_rule}`
    )
    .join('\n');

  const requiredIds = claims.map((c) => c.id).join(', ');

  const systemInstruction = `Bạn là Chuyên gia Đánh giá Liêm chính Di sản Văn hóa của NÉT VIỆT (Heritage Guard Evaluator).
Nhiệm vụ: Đánh giá bộ trang phục được đề xuất (proposed outfit) dựa trên dữ liệu Heritage Core chính thức.

QUY TẮC ĐÁNH GIÁ NGHIÊM NGẶT:
1. CHỈ ĐÁNH GIÁ DỰA TRÊN HERITAGE CORE ĐƯỢC CUNG CẤP. Không tự tạo thêm nguồn hoặc historical facts ngoài danh sách claims.
2. KIỂM TRA NỘI DUNG THỰC TẾ của outfit (cấu trúc, cách phối, thuật ngữ, bối cảnh sử dụng), KHÔNG CHỈ DỰA VÀO TỪ KHÓA.
3. PHÂN LOẠI QUY TẮC THEO STATUS VÀ AI_ACCESS:
   - GREEN (PASS trong phạm vi): Được phép dùng trong styling.
   - YELLOW / SUPPORTED_WITH_SCOPE: Kiểm tra xem output có bị suy rộng thời gian/vùng/bối cảnh (universalize) không. Nếu vượt scope -> WARNING với lý do và scopeIssue cụ thể.
   - SOURCE_VARIANCE_DISPUTED: Nguồn có khác biệt. Nếu output hoặc prompt tự ý chọn/khẳng định một phía mà không có reference cụ thể -> WARNING (hoặc BLOCKED nếu ép buộc như chân lý duy nhất).
   - CULTURAL_INTERPRETATION: Chỉ cho phép dùng khi được gắn nhãn là diễn giải văn hóa/cảm hứng, không được trình bày như historical fact. Nếu trình bày như fact -> WARNING.
   - INCORRECT hoặc UNVERIFIED: Nếu bị khẳng định như sự thật lịch sử -> BLOCKED.
4. XÁC ĐỊNH OVERALL STATUS, INTEGRITY SCORE VÀ TỔNG QUAN:
   - overallStatus:
     + BLOCKED: Nếu có bất kỳ vi phạm nghiêm trọng nào (khẳng định INCORRECT/UNVERIFIED như fact, ép buộc một phía trong tranh chấp không bằng chứng).
     + WARNING: Nếu có cảnh báo về scope, thiếu reference cho dị bản, hoặc diễn giải văn hóa chưa gắn nhãn rõ.
     + PASS: Nếu toàn bộ nội dung tuân thủ đúng phạm vi của Heritage Core.
   - integrityScore: Điểm từ 0 đến 100 phản ánh mức độ liêm chính di sản (100 nếu toàn bộ PASS, 60-85 nếu có WARNING, dưới 50 nếu BLOCKED).
   - guardSummary: Nhận định tổng quan súc tích, giải thích ngắn gọn lý do PASS, WARNING hoặc BLOCKED.
   - culturalWarnings: Danh sách các cảnh báo văn hóa cụ thể (nếu có, để trống [] nếu PASS hoàn hảo).
   - suggestedCorrections: Đưa ra các gợi ý chỉnh sửa cụ thể nếu có WARNING hoặc BLOCKED (để trống [] nếu PASS).
5. BẮT BUỘC ĐÁNH GIÁ CHÍNH XÁC MỌI CLAIM:
   - checks: Mảng chứa đúng một kết quả cho TỪNG claim ID trong danh sách Heritage Core (không thiếu, không thừa, không lặp). BẮT BUỘC phải chứa ĐỦ ${claims.length} phần tử tương ứng chính xác với từng ID trong danh sách: [${requiredIds}]. Mỗi check gồm claimId, verdict (PASS|WARNING|BLOCKED), reason (string), và scopeIssue (string, nếu có).
6. Trả về đúng JSON theo schema.`;

  const userContent = `ĐÁNH GIÁ BỘ TRANG PHỤC SAU:
- Trang phục: ${costume.vietnameseTitle} (${costume.id})
- Yêu cầu của người dùng (User Prompt): "${preferences.customPrompt || 'Không có'}"
- Dịp: ${preferences.occasion} | Phong cách: ${preferences.styleVibe}
- Proposed Outfit:
  + Tiêu đề: ${proposedOutfit.title || ''}
  + Tagline: ${proposedOutfit.tagline || ''}
  + Ý niệm (Concept): ${proposedOutfit.concept || ''}
  + Phom dáng: ${proposedOutfit.silhouette || ''}
  + Áo chính: ${proposedOutfit.pieces?.mainPiece?.name || ''} - ${proposedOutfit.pieces?.mainPiece?.description || ''}
  + Áo phối/lớp: ${proposedOutfit.pieces?.layeringPiece?.name || 'Không có'} - ${proposedOutfit.pieces?.layeringPiece?.description || ''}
  + Quần/Váy: ${proposedOutfit.pieces?.bottomPiece?.name || ''} - ${proposedOutfit.pieces?.bottomPiece?.description || ''}
  + Yếu tố bảo tồn truyền thống: ${proposedOutfit.preservedTraditionalElements?.map((e) => `${e.title}: ${e.explanation}`).join('; ') || 'Không có'}
  + Yếu tố cách tân đương đại: ${proposedOutfit.modernRemixInterventions?.map((e) => `${e.title}: ${e.explanation}`).join('; ') || 'Không có'}

DANH SÁCH HERITAGE CORE CHÍNH THỨC (${claims.length} CLAIMS - BẮT BUỘC KIỂM TRA ĐỦ MỌI CLAIM TỪ ${requiredIds}):
${claimsPrompt}`;

  try {
    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: userContent,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStatus: {
              type: Type.STRING,
              enum: ['PASS', 'WARNING', 'BLOCKED'],
            },
            integrityScore: {
              type: Type.NUMBER,
              description: 'Điểm liêm chính di sản từ 0 đến 100',
            },
            guardSummary: {
              type: Type.STRING,
              description: 'Đánh giá tổng quan súc tích',
            },
            culturalWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Danh sách các cảnh báo văn hóa',
            },
            suggestedCorrections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Gợi ý điều chỉnh để đạt chuẩn di sản',
            },
            checks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claimId: { type: Type.STRING },
                  verdict: { type: Type.STRING, enum: ['PASS', 'WARNING', 'BLOCKED'] },
                  reason: { type: Type.STRING },
                  scopeIssue: { type: Type.STRING },
                },
                required: ['claimId', 'verdict', 'reason'],
              },
              description: 'Kết quả đánh giá đối với từng claim ID bắt buộc',
            },
          },
          required: ['overallStatus', 'integrityScore', 'guardSummary', 'culturalWarnings', 'suggestedCorrections', 'checks'],
        },
      },
    });

    if (!response.text) return null;

    // Use shared fail-closed validator module
    const validationResult = validateGeminiEvaluatorOutput(response.text, claims);
    if (!validationResult.isValid) {
      console.warn('Gemini Evaluator output failed strict validation:', validationResult.errorReason);
      return null;
    }

    const { evaluatedClaims, overallStatus, integrityScore, guardSummary, culturalWarnings, suggestedCorrections } =
      validationResult;

    const audit: HeritageGuardAudit = {
      overallStatus,
      integrityScore,
      evaluatedClaims,
      culturalWarnings,
      suggestedCorrections,
      guardSummary,
      evaluationMode: 'GEMINI_EVALUATOR',
    };

    return audit;
  } catch (err) {
    console.warn('Gemini Evaluator API call failed:', err);
    return null;
  }
}

// ---------------- APP FACTORY & API ROUTES ----------------
export function createNetVietApp(options: NetVietAppOptions = {}): express.Express {
  const app = express();
  app.use(express.json());
  const activeAi = options.aiClient !== undefined ? options.aiClient : ai;

  // GET /api/costumes
  app.get('/api/costumes', (_req: Request, res: Response) => {
  res.json({
    costumes: COSTUME_METAS,
    heritageClaims: HERITAGE_CORE_DATABASE,
  });
});

// POST /api/remix-outfit
app.post('/api/remix-outfit', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const preferences: StylingPreferences = body.preferences || body;
    const costumeId: CostumeId = body.costumeId || preferences.costumeId;

    if (!costumeId) {
      return res.status(400).json({
        code: 'INVALID_COSTUME_ID',
        error: 'Thiếu mã trang phục costumeId.',
      });
    }

    const costumeMeta = COSTUME_METAS.find((c) => c.id === costumeId);
    if (!costumeMeta) {
      return res.status(400).json({
        code: 'INVALID_COSTUME_ID',
        error: `Costume ID '${costumeId}' không tồn tại trong hệ thống.`,
      });
    }

    // CRITICAL: Enforce NOT_RESEARCHED guard
    // Reject generation immediately if costume is NOT_RESEARCHED. Do not fallback to mock/algorithmic.
    if (costumeMeta.heritageStatus === 'NOT_RESEARCHED') {
      return res.status(409).json({
        code: 'NOT_RESEARCHED',
        error: `Trang phục '${costumeMeta.name}' hiện ở trạng thái NOT_RESEARCHED. Chưa có Heritage Core chính thức được nhóm nghiên cứu phê duyệt, hệ thống từ chối tạo outfit để bảo toàn liêm chính di sản.`,
      });
    }

    // 1. Heritage Core Context (chỉ lấy claims nếu costume đã được research chính thức)
    const claims = getCostumeHeritageClaims(costumeId);
    if (!claims || claims.length === 0) {
      return res.status(409).json({
        code: 'NOT_RESEARCHED',
        error: `Trang phục '${costumeMeta.name}' chưa có bộ Heritage Core claims được phê duyệt. Hệ thống từ chối tạo outfit.`,
      });
    }

    // Helper to build heuristic fallback audit ensuring no unearned PASS
    const buildHeuristicFallbackAudit = (proposed: Partial<OutfitResult>): HeritageGuardAudit => {
      const outcome = HeritageGuardEngine.evaluateAndSanitize({
        costumeId,
        preferences,
        proposedOutfit: proposed,
      });
      const audit = { ...outcome.guardAudit };
      audit.evaluationMode = 'HEURISTIC_FALLBACK';
      if (audit.overallStatus === 'PASS') {
        audit.overallStatus = 'WARNING';
        audit.integrityScore = Math.min(audit.integrityScore, 80);
      }
      audit.culturalWarnings = [
        'CƠ CHẾ DỰ PHÒNG (HEURISTIC FALLBACK): Đánh giá ngữ nghĩa chưa hoàn tất. Kết quả chưa được phê duyệt chính thức bởi Heritage Guard.',
        ...audit.culturalWarnings,
      ];
      audit.guardSummary = `[HEURISTIC FALLBACK] ${audit.guardSummary}`;
      return audit;
    };

    // SECURITY PATCH (VER 10.1 - P0 & P1): Đóng hoàn toàn Mock Evaluator trong app thông thường.
    // 1. Chỉ instance app được tạo với options.enableTestMockAi === true bởi test harness mới được phép kích hoạt mock.
    // 2. Không dùng req.hostname hay Host header; dùng địa chỉ socket thực tế và xử lý IPv4-mapped IPv6.
    // 3. Nhánh mock trong test harness gắn nhãn evaluationMode: 'TEST_MOCK' (không giả mạo GEMINI_EVALUATOR).
    const remoteAddr = req.socket?.remoteAddress || '';
    const normalizedAddr = remoteAddr.startsWith('::ffff:') ? remoteAddr.slice(7) : remoteAddr;
    const isLoopbackSocket = normalizedAddr === '127.0.0.1' || normalizedAddr === '::1';

    const isTestMockAllowed = options.enableTestMockAi === true && isLoopbackSocket;

    const testMockMode = isTestMockAllowed ? (req.headers['x-test-mock-ai'] as string) : undefined;
    if (testMockMode) {
      const mockOutfit = generateAlgorithmicOutfit(costumeMeta, preferences);
      let guardAudit: HeritageGuardAudit;

      if (testMockMode === 'BLOCKED') {
        const mockBlockedJson = JSON.stringify({
          overallStatus: 'BLOCKED',
          integrityScore: 25,
          guardSummary: 'Mock AI Evaluator: Phát hiện vi phạm nghiêm trọng quy chuẩn di sản.',
          culturalWarnings: ['Cảnh báo: Vi phạm quy chuẩn đối chiếu tư liệu lịch sử.'],
          suggestedCorrections: ['Loại bỏ nội dung xuyên tạc hoặc độc tôn sai lệch.'],
          checks: claims.map((c, i) => ({
            claimId: c.id,
            verdict: i === 0 ? 'BLOCKED' : 'PASS',
            reason: i === 0 ? 'Vi phạm nghiêm trọng quy chuẩn tư liệu' : 'Phù hợp tư liệu',
            scopeIssue: i === 0 ? 'Vi phạm phạm vi chứng cứ' : undefined,
          })),
        });

        const validation = validateGeminiEvaluatorOutput(mockBlockedJson, claims);
        if (validation.isValid) {
          guardAudit = {
            overallStatus: validation.overallStatus,
            integrityScore: validation.integrityScore,
            evaluatedClaims: validation.evaluatedClaims,
            culturalWarnings: validation.culturalWarnings,
            suggestedCorrections: validation.suggestedCorrections,
            guardSummary: `[TEST MOCK] ${validation.guardSummary}`,
            evaluationMode: 'TEST_MOCK',
          };
        } else {
          guardAudit = buildHeuristicFallbackAudit(mockOutfit);
        }
      } else if (testMockMode === 'PASS') {
        const mockPassJson = JSON.stringify({
          overallStatus: 'PASS',
          integrityScore: 96,
          guardSummary: 'Mock AI Evaluator: Thiết kế tuân thủ hoàn hảo Heritage Core.',
          culturalWarnings: [],
          suggestedCorrections: [],
          checks: claims.map((c) => ({
            claimId: c.id,
            verdict: 'PASS',
            reason: 'Tuân thủ đúng quy chuẩn',
          })),
        });

        const validation = validateGeminiEvaluatorOutput(mockPassJson, claims);
        if (validation.isValid) {
          guardAudit = {
            overallStatus: validation.overallStatus,
            integrityScore: validation.integrityScore,
            evaluatedClaims: validation.evaluatedClaims,
            culturalWarnings: validation.culturalWarnings,
            suggestedCorrections: validation.suggestedCorrections,
            guardSummary: `[TEST MOCK] ${validation.guardSummary}`,
            evaluationMode: 'TEST_MOCK',
          };
        } else {
          guardAudit = buildHeuristicFallbackAudit(mockOutfit);
        }
      } else if (testMockMode === 'INVALID_EVALUATOR') {
        const invalidJson = JSON.stringify({ invalidStructure: true });
        const validation = validateGeminiEvaluatorOutput(invalidJson, claims);
        if (validation.isValid) {
          guardAudit = {
            overallStatus: validation.overallStatus,
            integrityScore: validation.integrityScore,
            evaluatedClaims: validation.evaluatedClaims,
            culturalWarnings: validation.culturalWarnings,
            suggestedCorrections: validation.suggestedCorrections,
            guardSummary: `[TEST MOCK] ${validation.guardSummary}`,
            evaluationMode: 'TEST_MOCK',
          };
        } else {
          guardAudit = buildHeuristicFallbackAudit(mockOutfit);
        }
      } else {
        guardAudit = buildHeuristicFallbackAudit(mockOutfit);
      }

      if (guardAudit.overallStatus === 'BLOCKED') {
        return res.json(createBlockedPurgedOutfit(costumeId, guardAudit));
      }

      return res.json({
        ...mockOutfit,
        heritageGuardAudit: guardAudit,
        originalOutfit: { ...mockOutfit },
        adjustedOutfit: null,
      });
    }

    // If Gemini is available, attempt AI generation with strict cultural grounding
    if (activeAi) {
      try {
        const generatedOutfit = await callGeminiStylist(activeAi, costumeMeta, claims, preferences);
        if (generatedOutfit) {
          // Pass through Heritage Guard (Tách riêng styling và evaluation)
          // 1. Chạy Gemini Evaluator
          const geminiAudit = await callGeminiEvaluator(activeAi, costumeMeta, claims, preferences, generatedOutfit);
          
          let guardAudit: HeritageGuardAudit;
          if (geminiAudit) {
            guardAudit = geminiAudit;
          } else {
            // Heuristic Fallback
            guardAudit = buildHeuristicFallbackAudit(generatedOutfit);
          }

          // CRITICAL (VER 6.1 & 7.1): Không trả nội dung outfit bị BLOCKED qua API.
          // Khi audit là BLOCKED, response không được chứa outfit gốc, concept, silhouette, pieces, bảng màu
          // hoặc nội dung lookbook như kết quả sử dụng được. Chỉ trả trạng thái kiểm duyệt, lý do, claim vi phạm và đề xuất sửa.
          if (guardAudit.overallStatus === 'BLOCKED') {
            return res.json(createBlockedPurgedOutfit(costumeId, guardAudit));
          }

          const finalOutfit: OutfitResult = {
            ...generatedOutfit,
            heritageGuardAudit: guardAudit,
            originalOutfit: { ...generatedOutfit },
            adjustedOutfit: null,
          };

          return res.json(finalOutfit);
        }
      } catch (geminiError) {
        console.warn('Gemini API call warning, falling back to algorithmic stylist:', geminiError);
      }
    }

    // Algorithmic Fallback Stylist (always guaranteed to work & culturally safe)
    const fallbackOutfit = generateAlgorithmicOutfit(costumeMeta, preferences);
    let guardAudit: HeritageGuardAudit;

    if (activeAi) {
      const geminiAudit = await callGeminiEvaluator(activeAi, costumeMeta, claims, preferences, fallbackOutfit);
      if (geminiAudit) {
        guardAudit = geminiAudit;
      } else {
        guardAudit = buildHeuristicFallbackAudit(fallbackOutfit);
      }
    } else {
      guardAudit = buildHeuristicFallbackAudit(fallbackOutfit);
    }

    // CRITICAL (VER 6.1 & 7.1): Không trả nội dung outfit bị BLOCKED qua API.
    if (guardAudit.overallStatus === 'BLOCKED') {
      return res.json(createBlockedPurgedOutfit(costumeId, guardAudit));
    }

    const finalOutfit: OutfitResult = {
      ...fallbackOutfit,
      heritageGuardAudit: guardAudit,
      originalOutfit: { ...fallbackOutfit },
      adjustedOutfit: null,
    };

    return res.json(finalOutfit);
  } catch (error) {
    console.error('Error generating outfit:', error);
    res.status(500).json({ error: 'Không thể tạo outfit vào lúc này. Vui lòng thử lại.' });
  }
});

// POST /api/stress-test-guard
// Educational tool for AI Arena judges to verify Heritage Guard defenses
app.post('/api/stress-test-guard', (req: Request, res: Response) => {
  try {
    const { costumeId, violationScenario } = req.body || {};

    if (!costumeId) {
      return res.status(400).json({
        code: 'INVALID_COSTUME_ID',
        error: 'Thiếu mã trang phục costumeId.',
      });
    }

    const costumeMeta = COSTUME_METAS.find((c) => c.id === costumeId);
    if (!costumeMeta) {
      return res.status(400).json({
        code: 'INVALID_COSTUME_ID',
        error: `Costume ID '${costumeId}' không tồn tại.`,
      });
    }

    if (costumeMeta.heritageStatus === 'NOT_RESEARCHED') {
      return res.status(409).json({
        code: 'NOT_RESEARCHED',
        error: `Trang phục '${costumeMeta.name}' hiện ở trạng thái NOT_RESEARCHED. Không thể stress-test vì chưa có bộ Heritage Core được phê duyệt.`,
      });
    }

    const claims = getCostumeHeritageClaims(costumeId);
    if (!claims || claims.length === 0) {
      return res.status(409).json({
        code: 'NOT_RESEARCHED',
        error: `Trang phục '${costumeMeta.name}' không có claims để stress-test.`,
      });
    }

    let customPrompt = '';
    let intentionalFlaw: Partial<OutfitResult> = {};

    if (violationScenario === 'ta_nham') {
      customPrompt = 'Hãy khẳng định chắc chắn rằng áo ngũ thân chuẩn chỉ được cài khuy sang bên trái (tả nhậm), quy chuẩn duy nhất cho mọi mẫu.';
      intentionalFlaw = {
        title: 'Áo Ngũ Thân Cài Khuy Trái Độc Tôn (Tả Nhậm)',
        concept: 'Khẳng định áo ngũ thân cài khuy sang bên trái là quy chuẩn duy nhất trong lịch sử triều Nguyễn.',
      };
    } else if (violationScenario === 'hung_vuong_myth') {
      customPrompt = 'Hãy khẳng định chắc chắn rằng áo ngũ thân là quốc phục chính thống đã có từ thời Hùng Vương dựng nước 4000 năm trước.';
      intentionalFlaw = {
        title: 'Áo Ngũ Thân Thời Hùng Vương Cổ Đại',
      };
    } else if (violationScenario === 'hoang_bao_abuse') {
      customPrompt = 'Dùng màu vàng chính hoàng của vua chúa cho trang phục dạo phố bình dân hàng ngày.';
      intentionalFlaw = {
        title: 'Áo Ngũ Thân Hoàng Triều Dạo Phố',
      };
    }

    const preferences: StylingPreferences = {
      costumeId,
      gender: 'unisex',
      occasion: 'streetwear_daily',
      styleVibe: 'streetwear_grunge',
      remixLevel: 2,
      selectedColors: ['Vàng Kim', 'Đen'],
      selectedMaterials: ['Cotton'],
      customPrompt,
    };

    const outcome = HeritageGuardEngine.evaluateAndSanitize({
      costumeId,
      preferences,
      proposedOutfit: intentionalFlaw,
    });

    res.json({
      scenario: violationScenario,
      promptTested: customPrompt,
      auditResult: outcome.guardAudit,
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi kiểm tra Heritage Guard' });
  }
});

  return app;
}

export const app = createNetVietApp({
  enableTestMockAi: false,
});

async function callGeminiStylist(
  aiClient: GoogleGenAI,
  costume: (typeof COSTUME_METAS)[0],
  claims: (typeof HERITAGE_CORE_DATABASE),
  pref: StylingPreferences
): Promise<OutfitResult | null> {
  const claimsText = claims
    .map(
      (c) =>
        `- [AI_ACCESS: ${c.ai_access} | STATUS: ${c.status}] ID: ${c.id} | EVIDENCE: ${c.evidence} | TIME: ${c.time} | REGION_CONTEXT: ${c.region_context}
  CLAIM: ${c.claim}
  AI_RULE: ${c.ai_rule}`
    )
    .join('\n');

  const systemPrompt = `Bạn là Giám đốc Sáng tạo kiêm AI Stylist của NÉT VIỆT - Việt phục Remix (AI Arena: Viet Nam 2026).
Tagline: “Mặc hiện đại, nhưng hiểu mình đang mặc gì.”
Nhiệm vụ: Sáng tạo một outfit thời trang đương đại (remix) cho thế hệ Gen Z dựa trên trang phục cổ truyền Việt Nam, ĐỒNG THỜI BẢO VỆ CHẶT CHẼ DI SẢN LỊCH SỬ.

QUY TẮC BẮT BUỘC (HERITAGE CORE & HERITAGE GUARD):
1. GREEN CLAIMS: AI được phép dùng claim trực tiếp trong styling trong phạm vi đã xác định.
2. YELLOW CLAIMS: AI được phép dùng nhưng PHẢI giữ đúng time/region/context/reference. KHÔNG được biến claim có scope thành fact phổ quát.
3. RED CLAIMS: AI TUYỆT ĐỐI KHÔNG được trình bày claim như historical fact. Nếu người dùng yêu cầu khẳng định claim RED, phải từ chối hoặc cảnh báo.
4. ĐẶC BIỆT THEO LOẠI VIỆT PHỤC:
   - Với Áo Ngũ Thân: Không tự khẳng định vị trí khuy là universal fact; không biến quan niệm "Ngũ thân phụ mẫu/Ngũ thường" thành historical fact (đây là cách diễn giải văn hóa); không suy rộng form áo thế kỷ XIX về năm 1744; giữ đúng phạm vi các claim có scope.
   - Với Áo Tứ Thân: Không biến "mớ ba mớ bảy" thành một loại costume riêng biệt (đây là cách thức phối lớp); không khẳng định yếm/dải bao/quai thao là bắt buộc trong mọi context; không dùng claim Lý - Trần là tổ tiên trực tiếp khi chưa được xác minh; không gọi áo tứ thân là quốc phục của mọi phụ nữ Việt Nam; không biến váy đụp thành fact có phạm vi rộng hơn bằng chứng.
5. Tuyệt đối không tự bịa đặt historical facts mới. Heritage Core là nguồn dữ liệu văn hóa của app.
6. Phân tách rành mạch giữa “traditional reference / yếu tố bảo lưu” và “modern remix / yếu tố cách tân”.

Trả về kết quả chuẩn JSON theo schema.`;

  const userPrompt = `Hãy sáng tạo outfit remix cho:
- Loại Việt phục: ${costume.vietnameseTitle} (${costume.id})
- Giới tính/Đối tượng: ${pref.gender}
- Dịp mặc: ${pref.occasion}
- Phong cách: ${pref.styleVibe}
- Mức độ hiện đại (1=Bảo tồn cao 80/20, 2=Cân bằng 50/50, 3=Phá cách đương đại 20/80): ${pref.remixLevel}
- Màu sắc ưu tiên: ${pref.selectedColors?.join(', ') || 'Tự do sáng tạo'}
- Chất liệu ưu tiên: ${pref.selectedMaterials?.join(', ') || 'Tự do sáng tạo'}
- Yêu cầu đặc biệt từ người dùng: ${pref.customPrompt || 'Không có'}

DANH SÁCH HERITAGE CORE DỮ LIỆU CỐT LÕI:
${claimsText}`;

  const response = await aiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Tên bộ trang phục thời trang đầy cảm hứng' },
          tagline: { type: Type.STRING, description: 'Câu slogan 1 câu súc tích' },
          concept: { type: Type.STRING, description: 'Ý niệm thiết kế chi tiết' },
          silhouette: { type: Type.STRING, description: 'Mô tả phom dáng tổng thể' },
          pieces: {
            type: Type.OBJECT,
            properties: {
              mainPiece: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  heritageOrigin: { type: Type.STRING },
                  materialUsed: { type: Type.STRING },
                },
                required: ['name', 'description'],
              },
              layeringPiece: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  materialUsed: { type: Type.STRING },
                },
              },
              bottomPiece: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  materialUsed: { type: Type.STRING },
                },
                required: ['name', 'description'],
              },
              accessories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ['name', 'description'],
                },
              },
              footwear: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['name', 'description'],
              },
              colorScheme: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    culturalMeaning: { type: Type.STRING },
                  },
                  required: ['name', 'hex', 'culturalMeaning'],
                },
              },
              materials: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['mainPiece', 'bottomPiece', 'footwear', 'colorScheme', 'materials'],
          },
          preservedTraditionalElements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                heritageRuleReference: { type: Type.STRING },
              },
              required: ['title', 'explanation', 'heritageRuleReference'],
            },
          },
          modernRemixInterventions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                rationale: { type: Type.STRING },
              },
              required: ['title', 'explanation', 'rationale'],
            },
          },
          heritageNotes: {
            type: Type.OBJECT,
            properties: {
              scopedFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
              contextualMandates: { type: Type.ARRAY, items: { type: Type.STRING } },
              aiUncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['scopedFacts', 'contextualMandates', 'aiUncertainties'],
          },
          stylingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          musicVibe: { type: Type.STRING },
        },
        required: [
          'title',
          'tagline',
          'concept',
          'silhouette',
          'pieces',
          'preservedTraditionalElements',
          'modernRemixInterventions',
          'heritageNotes',
          'stylingTips',
          'musicVibe',
        ],
      },
    },
  });

  if (!response.text) {
    return null;
  }

  const parsed = JSON.parse(response.text.trim()) as OutfitResult;
  parsed.id = `gemini_${Date.now()}`;
  parsed.costumeId = costume.id;
  parsed.createdAt = new Date().toISOString();
  return parsed;
}

function generateAlgorithmicOutfit(
  costume: (typeof COSTUME_METAS)[0],
  pref: StylingPreferences
): OutfitResult {
  const list = SAMPLE_OUTFITS_BY_COSTUME[costume.id as CostumeId];
  const template = list && list.length > 0 ? list[0] : null;

  if (!template) {
    throw new Error(`Costume ${costume.id} không có dữ liệu mẫu để tạo trang phục.`);
  }

  // Deep clone template để không làm thay đổi sample gốc
  const outfit: OutfitResult = JSON.parse(JSON.stringify(template));
  outfit.id = `outfit_${costume.id}_${Date.now()}`;
  outfit.createdAt = new Date().toISOString();

  // Custom adjustments based on preferences
  if (pref.styleVibe === 'minimalist_zen') {
    outfit.title = `${outfit.title} · Thiền Định Tối Giản`;
    outfit.concept = `${outfit.concept} Tập trung vào đường nét mộc mạc, chất liệu tự nhiên không nhuộm màu hóa học.`;
  } else if (pref.styleVibe === 'streetwear_grunge') {
    outfit.title = `${outfit.title} · Deconstruct Streetwear`;
  }

  if (pref.customPrompt) {
    outfit.concept += ` Phối hợp theo ghi chú người dùng: "${pref.customPrompt}".`;
  }

  return outfit;
}

// ---------------- VITE MIDDLEWARE SETUP ----------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

// Only start dev/production server when run directly (not when imported in test harness)
const isMainModule =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  startServer();
}
