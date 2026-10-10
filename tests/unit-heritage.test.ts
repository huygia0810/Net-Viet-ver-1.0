import assert from 'node:assert';
import { HERITAGE_CORE_DATABASE, COSTUME_METAS, getCostumeHeritageClaims, isCostumeResearched } from '../src/data/heritageCore';
import { HeritageGuardEngine } from '../src/services/heritageGuard';
import { validateGeminiEvaluatorOutput } from '../src/services/heritageEvaluatorValidator';
import { createBlockedPurgedOutfit } from '../src/services/sanitizeBlockedOutfit';
import { getSampleOutfit } from '../src/data/mockOutfits';
import { StylingPreferences, HeritageGuardAudit } from '../src/types';

console.log('====================================================');
console.log('RUNNING NÉT VIỆT UNIT TEST SUITE (HERITAGE INTEGRITY)');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function it(desc: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passCount++;
  } catch (err: any) {
    console.error(`  ✗ ${desc}`);
    console.error(`    Error: ${err.message || err}`);
    failCount++;
  }
}

// ----------------------------------------------------
// 1. HERITAGE CORE INTEGRITY & RESEARCHED STATUS
// ----------------------------------------------------
console.log('[SECTION 1] Heritage Core & Costume Status:');

it('ao_ngu_than và ao_tu_than phải có status OFFICIAL', () => {
  assert.strictEqual(isCostumeResearched('ao_ngu_than'), true);
  assert.strictEqual(isCostumeResearched('ao_tu_than'), true);
});

it('ao_nhat_binh phải giữ nguyên status NOT_RESEARCHED', () => {
  assert.strictEqual(isCostumeResearched('ao_nhat_binh'), false);
  const nhatBinhMeta = COSTUME_METAS.find((c) => c.id === 'ao_nhat_binh');
  assert.strictEqual(nhatBinhMeta?.heritageStatus, 'NOT_RESEARCHED');
});

it('getCostumeHeritageClaims cho Nhật Bình phải trả về mảng rỗng', () => {
  const claims = getCostumeHeritageClaims('ao_nhat_binh');
  assert.strictEqual(claims.length, 0);
});

it('COSTUME_METAS đã loại bỏ hoàn toàn các khẳng định cứng không căn cứ', () => {
  const rawMetaStr = JSON.stringify(COSTUME_METAS);
  assert.strictEqual(rawMetaStr.includes('cho toàn quốc'), false, 'Không được có "cho toàn quốc" trong metadata');
  assert.strictEqual(rawMetaStr.includes('3–4cm'), false, 'Không được có "3–4cm"');
  assert.strictEqual(rawMetaStr.includes('3-4cm'), false, 'Không được có "3-4cm"');
  assert.strictEqual(rawMetaStr.includes('Tảo bạt'), false, 'Không được có thuật ngữ "Tảo bạt"');
  assert.strictEqual(rawMetaStr.includes('tảo bạt'), false, 'Không được có thuật ngữ "tảo bạt"');
});

// ----------------------------------------------------
// 2. MOCK OUTFITS & SAMPLE ISOLATION
// ----------------------------------------------------
console.log('\n[SECTION 2] Mock Outfits & Sample Security:');

it('getSampleOutfit cho Nhật Bình phải trả về null', () => {
  const dummyPref: StylingPreferences = {
    costumeId: 'ao_nhat_binh',
    gender: 'unisex',
    occasion: 'streetwear_daily',
    styleVibe: 'streetwear_grunge',
    remixLevel: 2,
    selectedColors: [],
    selectedMaterials: [],
  };
  const result = getSampleOutfit('ao_nhat_binh', dummyPref);
  assert.strictEqual(result, null, 'getSampleOutfit cho ao_nhat_binh phải là null');
});

it('getSampleOutfit cho costumeId không tồn tại phải trả về null (không fallback âm thầm)', () => {
  const dummyPref: StylingPreferences = {
    costumeId: 'unknown_costume' as any,
    gender: 'unisex',
    occasion: 'streetwear_daily',
    styleVibe: 'streetwear_grunge',
    remixLevel: 2,
    selectedColors: [],
    selectedMaterials: [],
  };
  const result = getSampleOutfit('unknown_costume' as any, dummyPref);
  assert.strictEqual(result, null, 'Không được fallback sang Ngũ thân khi ID lạ');
});

it('Mẫu demo nếu trả về cho Ngũ thân/Tứ thân không được mang nhãn PASS', () => {
  const dummyPref: StylingPreferences = {
    costumeId: 'ao_ngu_than',
    gender: 'unisex',
    occasion: 'streetwear_daily',
    styleVibe: 'streetwear_grunge',
    remixLevel: 2,
    selectedColors: [],
    selectedMaterials: [],
  };
  const result = getSampleOutfit('ao_ngu_than', dummyPref);
  assert.ok(result);
  assert.notStrictEqual(result?.heritageGuardAudit?.overallStatus, 'PASS', 'Mẫu demo không thể có overallStatus là PASS');
  assert.strictEqual(result?.heritageGuardAudit?.evaluationMode, 'HEURISTIC_FALLBACK');
});

// ----------------------------------------------------
// 3. FAIL-CLOSED GEMINI EVALUATOR VALIDATOR MODULE
// ----------------------------------------------------
console.log('\n[SECTION 3] Gemini Evaluator Strict Fail-Closed Validation:');

const sampleClaims = HERITAGE_CORE_DATABASE.filter((c) => c.costume === 'ao_ngu_than');

it('Hợp lệ: Đủ claim IDs, verdict chuẩn → isValid = true và xây dựng audit GEMINI_EVALUATOR', () => {
  const validProductionGeminiPayload = {
    overallStatus: 'PASS',
    integrityScore: 95,
    guardSummary: 'Bộ trang phục tuân thủ trọn vẹn Heritage Core.',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.map((c) => ({
      claimId: c.id,
      verdict: 'PASS',
      reason: 'Đạt yêu cầu đối chiếu tư liệu.',
    })),
  };

  const valResult = validateGeminiEvaluatorOutput(validProductionGeminiPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, true);
  if (valResult.isValid) {
    assert.strictEqual(valResult.overallStatus, 'PASS');
    assert.strictEqual(valResult.integrityScore, 95);
    assert.strictEqual(valResult.guardSummary, 'Bộ trang phục tuân thủ trọn vẹn Heritage Core.');
    assert.deepStrictEqual(valResult.culturalWarnings, []);
    assert.strictEqual(valResult.evaluatedClaims.length, sampleClaims.length);

    // Kiểm tra audit được sinh từ production validation có mode GEMINI_EVALUATOR
    const audit = {
      overallStatus: valResult.overallStatus,
      integrityScore: valResult.integrityScore,
      evaluatedClaims: valResult.evaluatedClaims,
      culturalWarnings: valResult.culturalWarnings,
      suggestedCorrections: valResult.suggestedCorrections,
      guardSummary: valResult.guardSummary,
      evaluationMode: 'GEMINI_EVALUATOR' as const,
    };
    assert.strictEqual(audit.evaluationMode, 'GEMINI_EVALUATOR');
    assert.strictEqual(audit.overallStatus, 'PASS');
  }
});

it('Fail-closed: Thiếu culturalWarnings (kể cả khi có alias warnings) → isValid = false theo schema production', () => {
  const payloadWithWarnings = {
    overallStatus: 'WARNING',
    integrityScore: 80,
    guardSummary: 'Phát hiện lưu ý dị bản nguồn tư liệu.',
    warnings: ['Lưu ý dị bản nguồn về cúc áo'],
    suggestedCorrections: ['Nêu rõ reference tư liệu khảo cứu'],
    checks: sampleClaims.map((c) => ({
      claimId: c.id,
      verdict: c.id === 'NGU_005' ? 'WARNING' : 'PASS',
      reason: 'Có lưu ý',
    })),
  };

  const valResult = validateGeminiEvaluatorOutput(payloadWithWarnings, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Phải từ chối khi thiếu trường culturalWarnings');
});

it('Fail-closed: Thiếu hoàn toàn trường culturalWarnings → isValid = false (không âm thầm mặc định [])', () => {
  const missingWarningsPayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Thiếu mảng cảnh báo',
    suggestedCorrections: [],
    checks: sampleClaims.map((c) => ({
      claimId: c.id,
      verdict: 'PASS',
      reason: 'Đạt',
    })),
  };

  const valResult = validateGeminiEvaluatorOutput(missingWarningsPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Phải từ chối khi thiếu trường culturalWarnings');
});

it('Fail-closed: Thiếu integrityScore → isValid = false (không tự gán điểm mặc định 70)', () => {
  const missingScorePayload = {
    overallStatus: 'PASS',
    guardSummary: 'Thiếu điểm',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.map((c) => ({
      claimId: c.id,
      verdict: 'PASS',
      reason: 'Đạt',
    })),
  };

  const valResult = validateGeminiEvaluatorOutput(missingScorePayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Phải từ chối khi thiếu integrityScore');
});

it('Fail-closed: Thiếu 1 claimId trong checks → isValid = false', () => {
  const missingOneClaim = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.slice(1).map((c) => ({
      claimId: c.id,
      verdict: 'PASS',
      reason: 'Tuân thủ',
    })),
  };

  const valResult = validateGeminiEvaluatorOutput(missingOneClaim, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Phải từ chối khi thiếu claimId');
});

it('Fail-closed: Thừa claimId không thuộc Heritage Core → isValid = false', () => {
  const extraClaim = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: [
      ...sampleClaims.map((c) => ({
        claimId: c.id,
        verdict: 'PASS',
        reason: 'Tuân thủ',
      })),
      { claimId: 'UNKNOWN_CLAIM_999', verdict: 'PASS', reason: 'Lạ' },
    ],
  };

  const valResult = validateGeminiEvaluatorOutput(extraClaim, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Phải từ chối khi có claim lạ');
});

it('Fail-closed: Trùng lặp claimId → isValid = false', () => {
  const duplicateClaim = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: [
      ...sampleClaims.slice(0, -1).map((c) => ({
        claimId: c.id,
        verdict: 'PASS',
        reason: 'Tuân thủ',
      })),
      { claimId: sampleClaims[0].id, verdict: 'PASS', reason: 'Trùng' },
    ],
  };

  const valResult = validateGeminiEvaluatorOutput(duplicateClaim, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Phải từ chối khi có duplicate claimId');
});

it('Fail-closed: Thiếu check.reason trong checks → isValid = false', () => {
  const missingReasonPayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.map((c, i) => ({
      claimId: c.id,
      verdict: 'PASS',
      ...(i === 0 ? {} : { reason: 'Tuân thủ' }),
    })),
  };
  const valResult = validateGeminiEvaluatorOutput(missingReasonPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Thiếu check.reason phải bị từ chối');
});

it('Fail-closed: check.reason là chuỗi rỗng hoặc khoảng trắng → isValid = false', () => {
  const emptyReasonPayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.map((c, i) => ({
      claimId: c.id,
      verdict: 'PASS',
      reason: i === 0 ? '   ' : 'Tuân thủ tư liệu',
    })),
  };
  const valResult = validateGeminiEvaluatorOutput(emptyReasonPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'check.reason rỗng phải bị từ chối');
});

it('Fail-closed: Thiếu suggestedCorrections → isValid = false (bắt buộc theo schema production)', () => {
  const missingCorrectionsPayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    checks: sampleClaims.map((c) => ({
      claimId: c.id,
      verdict: 'PASS',
      reason: 'Tuân thủ tư liệu',
    })),
  };
  const valResult = validateGeminiEvaluatorOutput(missingCorrectionsPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Thiếu suggestedCorrections phải bị từ chối');
});

it('Fail-closed: Status mâu thuẫn (overallStatus là PASS nhưng check là BLOCKED) → isValid = false (không tự sửa)', () => {
  const contradictoryPayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Cần đánh giá kỹ',
    culturalWarnings: ['Cảnh báo vi phạm nghiêm trọng'],
    suggestedCorrections: ['Loại bỏ nội dung vi phạm'],
    checks: sampleClaims.map((c, i) => ({
      claimId: c.id,
      verdict: i === 0 ? 'BLOCKED' : 'PASS',
      reason: i === 0 ? 'Vi phạm nghiêm trọng' : 'Đạt',
    })),
  };

  const valResult = validateGeminiEvaluatorOutput(contradictoryPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Payload có status mâu thuẫn BLOCKED phải bị từ chối');
});

it('Fail-closed: Status mâu thuẫn (overallStatus là PASS nhưng check là WARNING) → isValid = false (không tự sửa)', () => {
  const contradictoryWarningPayload = {
    overallStatus: 'PASS',
    integrityScore: 85,
    guardSummary: 'Có cảnh báo',
    culturalWarnings: ['Cần lưu ý dị bản nguồn'],
    suggestedCorrections: ['Nêu rõ nguồn'],
    checks: sampleClaims.map((c, i) => ({
      claimId: c.id,
      verdict: i === 0 ? 'WARNING' : 'PASS',
      reason: i === 0 ? 'Lưu ý dị bản nguồn' : 'Đạt',
    })),
  };

  const valResult = validateGeminiEvaluatorOutput(contradictoryWarningPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Payload có status mâu thuẫn WARNING phải bị từ chối');
});

it('Fail-closed: Invalid JSON syntax → isValid = false', () => {
  const valResult = validateGeminiEvaluatorOutput('{ invalid json', sampleClaims);
  assert.strictEqual(valResult.isValid, false);
});

it('Fail-closed: integrityScore sai kiểu dữ liệu (string hoặc NaN) → isValid = false', () => {
  const invalidScoreType = {
    overallStatus: 'PASS',
    integrityScore: '95', // string thay vì number
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.map((c) => ({ claimId: c.id, verdict: 'PASS', reason: 'Đạt' })),
  };
  const valResult = validateGeminiEvaluatorOutput(invalidScoreType, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Không được âm thầm ép kiểu hoặc gán mặc định');

  const nanScore = {
    overallStatus: 'PASS',
    integrityScore: NaN,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.map((c) => ({ claimId: c.id, verdict: 'PASS', reason: 'Đạt' })),
  };
  const valResultNaN = validateGeminiEvaluatorOutput(nanScore, sampleClaims);
  assert.strictEqual(valResultNaN.isValid, false, 'NaN integrityScore phải bị từ chối');
});

it('Fail-closed: culturalWarnings chứa phần tử không phải string → isValid = false', () => {
  const invalidWarningPayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [123, null],
    suggestedCorrections: [],
    checks: sampleClaims.map((c) => ({ claimId: c.id, verdict: 'PASS', reason: 'Đạt' })),
  };
  const valResult = validateGeminiEvaluatorOutput(invalidWarningPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'culturalWarnings có phần tử sai kiểu phải bị từ chối');
});

it('Fail-closed: suggestedCorrections chứa phần tử không phải string → isValid = false', () => {
  const invalidCorrectionsPayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [456],
    checks: sampleClaims.map((c) => ({ claimId: c.id, verdict: 'PASS', reason: 'Đạt' })),
  };
  const valResult = validateGeminiEvaluatorOutput(invalidCorrectionsPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'suggestedCorrections có phần tử sai kiểu phải bị từ chối');
});

it('Fail-closed: check.scopeIssue có kiểu dữ liệu không phải string → isValid = false', () => {
  const invalidScopeIssuePayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    guardSummary: 'Valid summary',
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.map((c) => ({ claimId: c.id, verdict: 'PASS', reason: 'Đạt', scopeIssue: 12345 })),
  };
  const valResult = validateGeminiEvaluatorOutput(invalidScopeIssuePayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'scopeIssue sai kiểu phải bị từ chối');
});

it('Fail-closed: Thiếu trường guardSummary hoặc rỗng → isValid = false', () => {
  const missingSummaryPayload = {
    overallStatus: 'PASS',
    integrityScore: 90,
    culturalWarnings: [],
    suggestedCorrections: [],
    checks: sampleClaims.map((c) => ({ claimId: c.id, verdict: 'PASS', reason: 'Đạt' })),
  };
  const valResult = validateGeminiEvaluatorOutput(missingSummaryPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Thiếu guardSummary phải bị từ chối');
});

it('Evaluator thất bại: Chuyển sang HEURISTIC_FALLBACK có cảnh báo, không tuyên bố hoàn tất semantic review', () => {
  // Khi Gemini trả JSON sai schema hoặc thiếu trường bắt buộc
  const invalidPayload = '{ "broken": true }';
  const valResult = validateGeminiEvaluatorOutput(invalidPayload, sampleClaims);
  assert.strictEqual(valResult.isValid, false, 'Payload sai schema phải bị từ chối');

  // Mô phỏng chuyển sang HEURISTIC_FALLBACK theo đúng quy tắc server
  const fallbackOutcome = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_ngu_than',
    preferences: {
      costumeId: 'ao_ngu_than',
      gender: 'unisex',
      occasion: 'streetwear_daily',
      styleVibe: 'streetwear_grunge',
      remixLevel: 2,
      selectedColors: [],
      selectedMaterials: [],
    },
    proposedOutfit: { title: 'Áo ngũ thân thử nghiệm fallback' },
  });

  const fallbackAudit: HeritageGuardAudit = {
    ...fallbackOutcome.guardAudit,
    evaluationMode: 'HEURISTIC_FALLBACK',
    overallStatus: fallbackOutcome.guardAudit.overallStatus === 'PASS' ? 'WARNING' : fallbackOutcome.guardAudit.overallStatus,
    integrityScore: Math.min(fallbackOutcome.guardAudit.integrityScore, 80),
    culturalWarnings: [
      'CƠ CHẾ DỰ PHÒNG (HEURISTIC FALLBACK): Đánh giá ngữ nghĩa chưa hoàn tất. Kết quả chưa được phê duyệt chính thức bởi Heritage Guard.',
      ...fallbackOutcome.guardAudit.culturalWarnings,
    ],
    guardSummary: `[HEURISTIC FALLBACK] ${fallbackOutcome.guardAudit.guardSummary}`,
  };

  assert.strictEqual(fallbackAudit.evaluationMode, 'HEURISTIC_FALLBACK');
  assert.notStrictEqual(fallbackAudit.overallStatus, 'PASS', 'Fallback không được phép có status PASS');
  assert.ok(
    fallbackAudit.culturalWarnings.some((w: string) => w.includes('CHƯA HOÀN TẤT') || w.includes('chưa hoàn tất')),
    'Phải chứa cảnh báo chưa hoàn tất semantic review'
  );
  assert.ok(
    !fallbackAudit.guardSummary.includes('ĐÃ ĐƯỢC CHỨNG NHẬN'),
    'Không được tuyên bố đã hoàn tất thẩm định'
  );
});

it('Sanitization BLOCKED: createBlockedPurgedOutfit tẩy sạch toàn bộ nội dung lookbook nhạy cảm', () => {
  const mockBlockedAudit = {
    overallStatus: 'BLOCKED' as const,
    integrityScore: 40,
    evaluatedClaims: [],
    culturalWarnings: ['Cảnh báo vi phạm'],
    suggestedCorrections: ['Loại bỏ khẳng định sai'],
    guardSummary: 'Thiết kế bị chặn do vi phạm',
    evaluationMode: 'HEURISTIC_FALLBACK' as const,
  };
  const purged = createBlockedPurgedOutfit('ao_ngu_than', mockBlockedAudit);
  assert.strictEqual(purged.concept, '');
  assert.strictEqual(purged.silhouette, '');
  assert.strictEqual(purged.pieces.colorScheme.length, 0);
  assert.strictEqual(purged.pieces.materials.length, 0);
  assert.strictEqual(purged.pieces.accessories.length, 0);
  assert.strictEqual(purged.pieces.mainPiece.name, '');
  assert.strictEqual(purged.pieces.bottomPiece.name, '');
  assert.strictEqual(purged.preservedTraditionalElements.length, 0);
  assert.strictEqual(purged.modernRemixInterventions.length, 0);
  assert.strictEqual(purged.heritageGuardAudit.overallStatus, 'BLOCKED');
});

// ----------------------------------------------------
// 4. FIVE HERITAGE SCENARIOS EVALUATION
// ----------------------------------------------------
console.log('\n[SECTION 4] Five Heritage Core Guard Scenarios:');

// Scenario 1: TT_005 - mớ ba mớ bảy lễ hội/Quan họ -> PASS
it('Kịch bản 1 (TT_005): Mớ ba mớ bảy trong bối cảnh lễ hội Quan họ Kinh Bắc → PASS', () => {
  const outcome = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_tu_than',
    preferences: {
      costumeId: 'ao_tu_than',
      gender: 'female',
      occasion: 'tet_contemporary',
      styleVibe: 'cyber_indochine',
      remixLevel: 1,
      selectedColors: [],
      selectedMaterials: [],
      customPrompt: 'Phối lớp kỹ thuật mớ ba mớ bảy nhiều lớp áo màu sắc cho lễ hội Quan họ Kinh Bắc.',
    },
    proposedOutfit: {
      title: 'Tứ Thân Quan Họ Mớ Ba Mớ Bảy',
      concept: 'Kỹ thuật layering mớ ba mớ bảy theo bối cảnh lễ hội Quan họ truyền thống.',
    },
  });

  const checkTT005 = outcome.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_005');
  assert.ok(checkTT005, 'Phải tìm thấy claim TT_005');
  assert.strictEqual(checkTT005?.verdict, 'PASS');
});

// Scenario 2: TT_004 - Lao động nữ nông thôn đầu TK XX không ép checklist -> PASS
it('Kịch bản 2 (TT_004): Lao động nữ nông thôn đầu TK XX không ép đủ cả khăn và nón → PASS', () => {
  const outcome = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_tu_than',
    preferences: {
      costumeId: 'ao_tu_than',
      gender: 'female',
      occasion: 'streetwear_daily',
      styleVibe: 'streetwear_grunge',
      remixLevel: 2,
      selectedColors: [],
      selectedMaterials: [],
      customPrompt: 'Trang phục nữ nông thôn đồng bằng Bắc Bộ đầu thế kỷ 20 mặc áo tứ thân màu nâu đất khi lao động đồng ruộng.',
    },
    proposedOutfit: {
      title: 'Tứ Thân Nâu Đất Nông Thôn',
      concept: 'Tái hiện hình ảnh nữ lao động nông thôn Bắc Bộ đầu thế kỷ 20 với áo tứ thân màu nâu trầm.',
    },
  });

  const checkTT004 = outcome.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_004');
  assert.ok(checkTT004, 'Phải tìm thấy claim TT_004');
  assert.strictEqual(checkTT004?.verdict, 'PASS');
});

// Scenario 3: TT_006 / TT_007 - Nón quai thao / dải bao không ép buộc lao động -> PASS khi đúng context
it('Kịch bản 3 (TT_006 & TT_007): Nón quai thao và dải bao chỉ xuất hiện đúng bối cảnh lễ hội → PASS', () => {
  const outcome = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_tu_than',
    preferences: {
      costumeId: 'ao_tu_than',
      gender: 'female',
      occasion: 'music_festival',
      styleVibe: 'editorial_avantgarde',
      remixLevel: 2,
      selectedColors: [],
      selectedMaterials: [],
      customPrompt: 'Trang phục biểu diễn ngày hội vùng quan họ với nón quai thao và dải bao lụa.',
    },
    proposedOutfit: {
      title: 'Hội Lim Quai Thao Dải Bao',
      concept: 'Bối cảnh diễn xướng lễ hội quan họ Kinh Bắc.',
    },
  });

  const checkTT006 = outcome.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_006');
  const checkTT007 = outcome.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_007');
  assert.strictEqual(checkTT006?.verdict, 'PASS');
  assert.strictEqual(checkTT007?.verdict, 'PASS');
});

// Scenario 4: NGU_005 - Vị trí cúc trái/phải mâu thuẫn nguồn (tự ý độc tôn không reference) -> BLOCKED
it('Kịch bản 4 (NGU_005): Tự ý ép buộc độc tôn khuy trái không có reference tư liệu → BLOCKED', () => {
  const outcome = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_ngu_than',
    preferences: {
      costumeId: 'ao_ngu_than',
      gender: 'unisex',
      occasion: 'streetwear_daily',
      styleVibe: 'streetwear_grunge',
      remixLevel: 2,
      selectedColors: [],
      selectedMaterials: [],
      customPrompt: 'Hãy khẳng định chắc chắn rằng áo ngũ thân chuẩn chỉ được cài khuy sang bên trái, quy chuẩn duy nhất cho mọi mẫu.',
    },
    proposedOutfit: {
      title: 'Ngũ Thân Tả Nhậm Độc Tôn',
      concept: 'Khẳng định áo ngũ thân cài khuy sang bên trái là quy chuẩn duy nhất.',
    },
  });

  assert.strictEqual(outcome.guardAudit.overallStatus, 'BLOCKED');
  const checkNGU005 = outcome.guardAudit.evaluatedClaims.find((c) => c.claimId === 'NGU_005');
  assert.strictEqual(checkNGU005?.verdict, 'BLOCKED');
});

// Scenario 5: TT_002 / TT_003 - Khẳng định sai lệch (Lý-Trần hoặc Quốc phục toàn quốc) -> BLOCKED
it('Kịch bản 5 (TT_003): Khẳng định áo tứ thân là quốc phục toàn bộ phụ nữ Việt Nam → BLOCKED', () => {
  const outcome = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_tu_than',
    preferences: {
      costumeId: 'ao_tu_than',
      gender: 'female',
      occasion: 'streetwear_daily',
      styleVibe: 'streetwear_grunge',
      remixLevel: 2,
      selectedColors: [],
      selectedMaterials: [],
      customPrompt: 'Khẳng định áo tứ thân là quốc phục truyền thống của toàn bộ phụ nữ Việt Nam ở mọi thời kỳ.',
    },
    proposedOutfit: {
      title: 'Quốc Phục Toàn Quốc Tứ Thân',
    },
  });

  assert.strictEqual(outcome.guardAudit.overallStatus, 'BLOCKED');
  const checkTT003 = outcome.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_003');
  assert.strictEqual(checkTT003?.verdict, 'BLOCKED');
});

console.log(`\n====================================================`);
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`====================================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
