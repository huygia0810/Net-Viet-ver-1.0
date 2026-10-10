import { CostumeId, HeritageClaim, HeritageGuardAudit, EvaluatedClaimCheck, OutfitResult, StylingPreferences, ClaimVerdict, GuardOverallStatus } from '../types';
import { getCostumeHeritageClaims } from '../data/heritageCore';

export interface AuditEvaluationInput {
  costumeId: CostumeId;
  preferences: StylingPreferences;
  proposedOutfit: Partial<OutfitResult>;
  customClaims?: HeritageClaim[];
}

export interface EvaluationOutcome {
  originalOutfit: Partial<OutfitResult>;
  guardAudit: HeritageGuardAudit;
  adjustedOutfit: Partial<OutfitResult> | null;
}

/**
 * Universal tokenization to extract meaningful conceptual terms without punctuation
 */
function extractConceptTerms(text: string): string[] {
  const stopWords = new Set([
    'và', 'là', 'của', 'có', 'cho', 'trong', 'với', 'các', 'những', 'được', 'một',
    'khi', 'thì', 'ở', 'đã', 'này', 'đó', 'từ', 'như', 'đến', 'lại', 'thể',
    'theo', 'vào', 'về', 'nhưng', 'cũng', 'hay', 'ra', 'qua', 'nên', 'do', 'để',
    'cần', 'chỉ', 'sẽ', 'mà', 'rồi', 'nào', 'ai', 'gì', 'sao', 'rất',
    'the', 'and', 'is', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by'
  ]);

  const clean = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”]/g, ' ');
  const words = clean.split(/\s+/).filter((w) => w.length >= 2 && !stopWords.has(w));

  // Also include 2-word n-grams to capture core Vietnamese terminology (e.g. "quai thao", "dải bao", "vị trí", "mớ ba")
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]} ${words[i + 1]}`);
  }

  // Domain synonym mapping for traditional costume terms
  const lowerText = text.toLowerCase();
  if (lowerText.includes('khuy') && !tokens.includes('cúc')) {
    tokens.push('cúc', 'vị trí cúc');
  }
  if (lowerText.includes('cúc') && !tokens.includes('khuy')) {
    tokens.push('khuy');
  }
  if (lowerText.includes('tả nhậm')) {
    tokens.push('trái', 'cúc trái', 'vị trí cúc', 'khuy trái');
  }
  if (lowerText.includes('hữu nhậm')) {
    tokens.push('phải', 'cúc phải', 'vị trí cúc', 'khuy phải');
  }

  return tokens;
}

/**
 * Calculates semantic topic overlap between claim text and proposed outfit/prompt
 */
function calculateSubjectOverlap(claimText: string, contextText: string): number {
  const claimTerms = new Set(extractConceptTerms(claimText));
  const contextTerms = extractConceptTerms(contextText);
  if (claimTerms.size === 0 || contextTerms.length === 0) return 0;

  const matched = new Set<string>();
  for (const term of contextTerms) {
    if (claimTerms.has(term)) {
      matched.add(term);
    }
  }

  return matched.size / Math.min(claimTerms.size, 6);
}

/**
 * Checks if the context provides or adheres to a specific historical reference
 * Accounts for negative context like "không cần reference", "không reference", "không viện dẫn mẫu hiện vật"
 */
function hasSpecificReference(text: string): boolean {
  const lower = text.toLowerCase();

  // If the context explicitly negates having a reference, return false
  const negativeRefPhrases = [
    'không cần reference', 'không reference', 'không cần tư liệu', 'không có reference',
    'không viện dẫn', 'không cần dựa theo', 'tự ý ấn định', 'tự chọn', 'không theo mẫu'
  ];
  if (negativeRefPhrases.some((phrase) => lower.includes(phrase))) {
    return false;
  }

  const refMarkers = [
    'theo mẫu', 'quy chuẩn mẫu', 'hiện vật thế kỷ', 'tư liệu thế kỷ', 'bảo tàng',
    'triều nguyễn', 'khâm định', 'đại nam thực lục', 'nguồn khảo sát', 'reference cụ thể'
  ];
  return refMarkers.some((marker) => lower.includes(marker));
}

/**
 * Detects universalizing language that strips historical scope
 */
function hasUniversalizingLanguage(text: string): boolean {
  const universalMarkers = [
    'toàn bộ', 'mọi thời kỳ', 'mọi thời đại', 'toàn quốc', 'mọi phụ nữ',
    'mọi bối cảnh', 'luôn luôn', 'bắt buộc trong mọi', 'quy chuẩn bất biến cho mọi',
    'quốc phục của mọi', 'ở mọi giai đoạn', 'chân lý phổ quát', 'toàn bộ lãnh thổ',
    'mọi hoàn cảnh', 'bắt buộc của toàn bộ'
  ];
  const lower = text.toLowerCase();
  return universalMarkers.some((marker) => lower.includes(marker));
}

/**
 * Detects language asserting an unverified, disputed, or interpretation claim as absolute historical fact
 */
function hasAbsoluteFactAssertion(text: string): boolean {
  const assertionMarkers = [
    'chắc chắn là', 'chính là sự thật', 'khẳng định là fact', 'khẳng định chắc chắn',
    'chứng minh là gốc từ', 'tổ tiên trực tiếp từ', 'đã có từ ngàn năm',
    'nguyên bản cổ xưa là', 'quy chuẩn duy nhất', 'khẳng định', 'chắc chắn',
    'hậu duệ trực tiếp', 'truyền thừa trực tiếp'
  ];
  const lower = text.toLowerCase();
  return assertionMarkers.some((marker) => lower.includes(marker));
}

export class HeritageGuardEngine {
  /**
   * Lấy danh sách claims hợp lệ cho một costume từ dataset
   */
  static getClaimsForCostume(costumeId: CostumeId, customClaims?: HeritageClaim[]): HeritageClaim[] {
    if (customClaims && customClaims.length > 0) {
      return customClaims.filter((claim) => claim.costume === costumeId);
    }
    return getCostumeHeritageClaims(costumeId);
  }

  /**
   * Đánh giá liêm chính di sản ĐỘNG (DATA-DRIVEN) dựa hoàn toàn trên:
   * - claim.status (SUPPORTED_WITH_SCOPE, SOURCE_VARIANCE_DISPUTED, CULTURAL_INTERPRETATION, UNVERIFIED, INCORRECT, VERIFIED)
   * - claim.ai_access (GREEN, YELLOW, RED)
   * - claim.ai_rule
   * - claim.time
   * - claim.region_context
   *
   * TUYỆT ĐỐI KHÔNG có logic hard-code theo claim ID hay keyword cố định.
   */
  static evaluate(input: AuditEvaluationInput): HeritageGuardAudit {
    const outcome = this.evaluateAndSanitize(input);
    return outcome.guardAudit;
  }

  /**
   * Tách Styling và Heritage Check:
   * Flow: User Input -> Gemini Stylist -> Proposed Outfit -> Heritage Evaluation -> Final Result
   *
   * KHÔNG FAKE AUTO-REWRITE:
   * Trả về rõ ràng originalOutfit, guardAudit, và optionalAdjustedOutfit.
   * Nếu chưa có bước rewrite thực tế: adjustedOutfit = null.
   */
  static evaluateAndSanitize(input: AuditEvaluationInput): EvaluationOutcome {
    const { costumeId, preferences, proposedOutfit, customClaims } = input;
    const claims = this.getClaimsForCostume(costumeId, customClaims);

    const originalOutfit = { ...proposedOutfit };
    const adjustedOutfit: Partial<OutfitResult> | null = null;

    // CRITICAL: Không được tạo audit PASS chỉ vì danh sách claim rỗng
    if (!claims || claims.length === 0) {
      const blockedAudit: HeritageGuardAudit = {
        overallStatus: 'BLOCKED',
        integrityScore: 0,
        evaluatedClaims: [],
        culturalWarnings: [
          'Trang phục chưa có bộ dữ liệu Heritage Core chính thức được phê duyệt. Hệ thống từ chối cấp chứng nhận khi danh sách claim rỗng.',
        ],
        suggestedCorrections: [
          'Cần bổ sung và phê duyệt bộ dữ liệu Heritage Core chính thức cho trang phục này trước khi tiến hành thẩm định.',
        ],
        guardSummary:
          'Bị chặn bởi Heritage Guard: Chưa có bộ dữ liệu Heritage Core chính thức. Hệ thống từ chối cấp chứng nhận PASS cho trang phục chưa nghiên cứu hoặc danh sách claim rỗng.',
        evaluationMode: 'HEURISTIC_FALLBACK',
      };

      return {
        originalOutfit,
        adjustedOutfit: null,
        guardAudit: blockedAudit,
      };
    }

    const userPrompt = preferences.customPrompt || '';
    const outfitFullProse = [
      proposedOutfit.title || '',
      proposedOutfit.tagline || '',
      proposedOutfit.concept || '',
      proposedOutfit.pieces?.mainPiece?.name || '',
      proposedOutfit.pieces?.mainPiece?.description || '',
      ...(proposedOutfit.preservedTraditionalElements?.map((e) => `${e.title} ${e.explanation}`) || []),
      ...(proposedOutfit.modernRemixInterventions?.map((e) => `${e.title} ${e.explanation}`) || []),
      userPrompt,
    ].join(' ');

    const evaluatedClaims: EvaluatedClaimCheck[] = [];
    const culturalWarnings: string[] = [];
    let integrityScore = 100;
    let hasBlocked = false;
    let hasWarning = false;

    // Duyệt động qua từng claim trong Heritage Core
    for (const claim of claims) {
      const claimText = claim.claim;
      const overlapScore = calculateSubjectOverlap(claimText, outfitFullProse);
      const isClaimTopicPresent = overlapScore > 0.25;

      let verdict: ClaimVerdict = 'PASS';
      let scopeIssue: string | undefined = undefined;
      let feedback = `[${claim.ai_access} - ${claim.status}] Tuân thủ quy tắc: ${claim.ai_rule}`;

      // =====================================================================
      // 1. KIỂM TRA THEO TRẠNG THÁI STATUS (DỮ LIỆU ĐẶC THÙ)
      // =====================================================================

      // Case A: SOURCE_VARIANCE_DISPUTED
      // Không được tự chọn một phía; nếu không có reference cụ thể -> WARNING; nếu user yêu cầu khẳng định tuyệt đối -> BLOCKED/WARNING
      if (claim.status === 'SOURCE_VARIANCE_DISPUTED') {
        const isAssertingAbsolute = hasAbsoluteFactAssertion(userPrompt) || hasAbsoluteFactAssertion(outfitFullProse);
        if (isClaimTopicPresent && isAssertingAbsolute) {
          verdict = 'BLOCKED';
          scopeIssue = 'Tự ý áp đặt một phía khi nguồn có dị bản mà không dẫn chiếu tư liệu.';
          feedback = `[SOURCE VARIANCE - BLOCKED] Tư liệu lịch sử có dị bản giữa các nguồn. Tuyệt đối không được khẳng định độc tôn một phía khi không có reference cụ thể. Quy tắc: ${claim.ai_rule}`;
          culturalWarnings.push(`Dị bản nguồn lịch sử: ${claim.ai_rule}`);
          integrityScore -= 25;
          hasBlocked = true;
        } else if (isClaimTopicPresent) {
          const hasRef = hasSpecificReference(outfitFullProse) || hasSpecificReference(userPrompt);
          if (!hasRef) {
            // Xuất hiện chủ đề có dị bản nguồn nhưng chưa gắn reference rõ ràng
            verdict = 'WARNING';
            scopeIssue = 'Chưa nêu rõ reference tư liệu khảo cứu hoặc chưa thông báo sự khác biệt nguồn.';
            feedback = `[SOURCE VARIANCE - CẢNH BÁO DỊ BẢN] Nguồn tư liệu có sự khác biệt. Phải thông báo nguồn có khác biệt hoặc tuân theo reference cụ thể, không tự đoán. Quy tắc: ${claim.ai_rule}`;
            culturalWarnings.push(`Lưu ý dị bản: ${claim.ai_rule}`);
            integrityScore -= 10;
            hasWarning = true;
          } else {
            feedback = `[SOURCE VARIANCE - TUÂN THỦ REFERENCE] Đã bám theo reference lịch sử cụ thể, không tự đoán trái/phải. Quy tắc: ${claim.ai_rule}`;
          }
        }
      }

      // Case B: CULTURAL_INTERPRETATION
      // Cho phép làm cảm hứng / diễn giải văn hóa, nhưng tuyệt đối không trình bày như historical fact
      else if (claim.status === 'CULTURAL_INTERPRETATION') {
        const isClaimPresentedAsFact = (hasAbsoluteFactAssertion(userPrompt) || hasAbsoluteFactAssertion(outfitFullProse)) && isClaimTopicPresent;
        if (isClaimPresentedAsFact) {
          verdict = 'WARNING';
          scopeIssue = 'Biến quan niệm biểu trưng/diễn giải văn hóa thành sự thật lịch sử đã chứng minh.';
          feedback = `[CULTURAL INTERPRETATION - CẢNH BÁO DIỄN GIẢI] Đây là diễn giải văn hóa/biểu tượng, không phải historical fact đã chứng minh. Chỉ dùng làm cảm hứng truyền thông/văn hóa có gắn nhãn. Quy tắc: ${claim.ai_rule}`;
          culturalWarnings.push(`Giới hạn diễn giải văn hóa: ${claim.ai_rule}`);
          integrityScore -= 15;
          hasWarning = true;
        }
      }

      // Case C: SUPPORTED_WITH_SCOPE
      // Cho phép dùng trong đúng scope; nếu output universalize hoặc vượt scope -> WARNING
      else if (claim.status === 'SUPPORTED_WITH_SCOPE') {
        const isOverScope = hasUniversalizingLanguage(outfitFullProse) && isClaimTopicPresent;
        if (isOverScope) {
          verdict = 'WARNING';
          scopeIssue = `Suy rộng phạm vi vượt ngoài mốc thời gian (${claim.time}) hoặc vùng miền (${claim.region_context}).`;
          feedback = `[SUPPORTED WITH SCOPE - CẢNH BÁO VƯỢT PHẠM VI] Dữ kiện chỉ có giá trị trong scope (${claim.time}, ${claim.region_context}). Không được suy rộng thành quy chuẩn toàn quốc hoặc mọi thời kỳ. Quy tắc: ${claim.ai_rule}`;
          culturalWarnings.push(`Cảnh báo phạm vi: ${claim.ai_rule}`);
          integrityScore -= 10;
          hasWarning = true;
        }
      }

      // Case D: INCORRECT
      // Khẳng định như fact -> BLOCKED
      else if (claim.status === 'INCORRECT') {
        const isAssertingIncorrect = (hasAbsoluteFactAssertion(userPrompt) || hasAbsoluteFactAssertion(outfitFullProse) || userPrompt.toLowerCase().includes('khẳng định')) && isClaimTopicPresent;
        if (isAssertingIncorrect) {
          verdict = 'BLOCKED';
          scopeIssue = 'Khẳng định nhận định sai lệch lịch sử (INCORRECT) như một sự thật.';
          feedback = `[INCORRECT - BỊ CHẶN (BLOCKED)] Nhận định đã được xác định là INCORRECT. Bằng chứng: ${claim.evidence}. Quy tắc: ${claim.ai_rule}`;
          culturalWarnings.push(`Chặn nhận định sai lệch lịch sử: ${claim.ai_rule}`);
          integrityScore -= 25;
          hasBlocked = true;
        }
      }

      // Case E: UNVERIFIED
      // Không được biến thành fact -> WARNING hoặc BLOCKED
      else if (claim.status === 'UNVERIFIED') {
        const isAssertingUnverified = (hasAbsoluteFactAssertion(userPrompt) || hasAbsoluteFactAssertion(outfitFullProse)) && isClaimTopicPresent;
        if (isAssertingUnverified) {
          verdict = 'BLOCKED';
          scopeIssue = 'Khẳng định giả thuyết chưa đủ chứng cứ xác minh (UNVERIFIED) thành sự thật lịch sử.';
          feedback = `[UNVERIFIED - BỊ CHẶN (BLOCKED)] Nhận định chưa đủ dữ liệu xác lập chuỗi bằng chứng liên tục (UNVERIFIED). Không được trình bày như fact lịch sử. Quy tắc: ${claim.ai_rule}`;
          culturalWarnings.push(`Chặn suy diễn chưa xác minh: ${claim.ai_rule}`);
          integrityScore -= 20;
          hasBlocked = true;
        }
      }

      // =====================================================================
      // 2. KIỂM TRA THEO TẦNG AI_ACCESS
      // =====================================================================
      if (claim.ai_access === 'GREEN' && verdict === 'PASS') {
        feedback = `[GREEN - ĐẠT CHUẨN] Được dùng trực tiếp trong styling theo scope đã xác định. Quy tắc: ${claim.ai_rule}`;
      } else if (claim.ai_access === 'YELLOW' && verdict === 'PASS') {
        feedback = `[YELLOW - GIỮ ĐÚNG BỐI CẢNH] Tuân thủ bối cảnh và reference (${claim.time}, ${claim.region_context}). Quy tắc: ${claim.ai_rule}`;
      } else if (claim.ai_access === 'RED' && verdict === 'PASS') {
        feedback = `[RED - LIÊM CHÍNH LỊCH SỬ] Không trình bày như historical fact. Quy tắc: ${claim.ai_rule}`;
      }

      evaluatedClaims.push({
        claimId: claim.id,
        claimText: claim.claim,
        access: claim.ai_access,
        verdict,
        guardFeedback: feedback,
        scopeIssue,
      });
    }

    // Tạo danh sách suggestedCorrections cụ thể dựa trên các lỗi phát hiện
    const suggestedCorrections: string[] = [];
    for (const item of evaluatedClaims) {
      if (item.verdict === 'BLOCKED') {
        suggestedCorrections.push(`[Sửa Claim ${item.claimId}]: Loại bỏ hoàn toàn ngôn ngữ khẳng định tuyệt đối; chỉ giữ lại trong phạm vi nguồn đã khảo cứu hoặc nêu rõ giả thuyết chưa được xác nhận.`);
      } else if (item.verdict === 'WARNING') {
        if (item.scopeIssue) {
          suggestedCorrections.push(`[Điều chỉnh Claim ${item.claimId}]: Giới hạn lại ngữ cảnh mô tả (${item.scopeIssue}); không dùng từ ngữ mang tính phổ quát hóa cho mọi thời kỳ.`);
        } else {
          suggestedCorrections.push(`[Bổ sung Claim ${item.claimId}]: Thêm chú dẫn reference cụ thể hoặc ghi chú tồn tại dị bản nguồn tư liệu.`);
        }
      }
    }

    // Xác định trạng thái tổng thể (PASS / WARNING / BLOCKED)
    let overallStatus: GuardOverallStatus = 'PASS';
    let guardSummary = 'Đạt chuẩn Heritage Guard. Thiết kế tôn trọng đúng các phạm vi, bối cảnh và quy tắc trong Heritage Core.';

    if (hasBlocked) {
      overallStatus = 'BLOCKED';
      guardSummary = 'Bị chặn bởi Heritage Guard: Phát hiện yêu cầu khẳng định nhận định sai lệch lịch sử (INCORRECT/UNVERIFIED) hoặc tự đoán khi có dị bản nguồn (SOURCE_VARIANCE).';
    } else if (hasWarning || integrityScore < 90) {
      overallStatus = 'WARNING';
      guardSummary = 'Heritage Guard phát hiện chi tiết cần lưu ý: Cần giữ đúng phạm vi thời gian/không gian hoặc có dị bản nguồn chưa được chỉ định reference.';
    }

    const guardAudit: HeritageGuardAudit = {
      overallStatus,
      integrityScore: Math.max(40, Math.min(100, integrityScore)),
      evaluatedClaims,
      culturalWarnings,
      suggestedCorrections: suggestedCorrections.length > 0 ? suggestedCorrections : undefined,
      guardSummary,
      evaluationMode: 'HEURISTIC_FALLBACK',
    };

    return {
      originalOutfit,
      guardAudit,
      adjustedOutfit, // = null vì không fake auto-rewrite khi chưa có bước rewrite thực tế
    };
  }
}
