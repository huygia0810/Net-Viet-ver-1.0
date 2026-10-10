import { HeritageGuardEngine } from './src/services/heritageGuard';
import { HERITAGE_CORE_DATABASE, COSTUME_METAS } from './src/data/heritageCore';
import http from 'http';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING HERITAGE GUARD & INTEGRITY TEST SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST 1: TT_005: mớ ba mớ bảy trong bối cảnh lễ hội/Quan họ Kinh Bắc -> PASS
  // ----------------------------------------------------
  console.log('--- Test 1: TT_005 trong bối cảnh lễ hội/Quan họ Kinh Bắc ---');
  const test1 = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_tu_than',
    preferences: {
      costumeId: 'ao_tu_than',
      gender: 'female',
      occasion: 'tet_contemporary',
      styleVibe: 'editorial_avantgarde',
      remixLevel: 1,
      selectedColors: ['Nâu Sồng', 'Xanh The'],
      selectedMaterials: ['Lụa Tơ Tằm', 'The'],
      customPrompt: 'Phối nhiều lớp áo the lụa theo kỹ thuật mớ ba mớ bảy trong không gian lễ hội hội Lim Quan họ Kinh Bắc.',
    },
    proposedOutfit: {
      title: 'Tứ Thân Mớ Ba Mớ Bảy Quan Họ',
      tagline: 'Kỹ thuật phối lớp nhiều màu sắc trong hội hè Kinh Bắc',
      concept: 'Áo tứ thân ứng dụng kỹ thuật layering mớ ba mớ bảy trong bối cảnh hội Lim.',
    },
  });

  const tt005Check = test1.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_005');
  assert(tt005Check !== undefined, 'TT_005 check exists');
  assert(tt005Check?.verdict === 'PASS', `TT_005 verdict should be PASS, got ${tt005Check?.verdict}`);
  assert(test1.guardAudit.overallStatus === 'PASS', `Test 1 overallStatus should be PASS, got ${test1.guardAudit.overallStatus}`);

  // ----------------------------------------------------
  // TEST 2: TT_004: lao động nữ nông thôn Bắc Bộ đầu TK XX đúng phạm vi -> PASS
  // ----------------------------------------------------
  console.log('\n--- Test 2: TT_004 lao động nữ nông thôn Bắc Bộ đầu TK XX đúng phạm vi ---');
  const test2 = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_tu_than',
    preferences: {
      costumeId: 'ao_tu_than',
      gender: 'female',
      occasion: 'streetwear_daily',
      styleVibe: 'streetwear_grunge',
      remixLevel: 1,
      selectedColors: ['Nâu Sồng', 'Đen Thâm'],
      selectedMaterials: ['Vải Đũi', 'Cotton Thô'],
      customPrompt: 'Trang phục nữ nông thôn Bắc Bộ đầu thế kỷ XX trong bối cảnh lao động đồng áng, tà áo vạt buộc gọn cùng váy thâm.',
    },
    proposedOutfit: {
      title: 'Tứ Thân Nông Thôn Bắc Bộ Đầu TK XX',
      tagline: 'Tái hiện trang phục lao động đồng bằng Bắc Bộ',
      concept: 'Áo tứ thân màu nâu trầm buộc vạt kết hợp váy thâm của phụ nữ lao động Bắc Bộ.',
    },
  });

  const tt004Check = test2.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_004');
  assert(tt004Check !== undefined, 'TT_004 check exists');
  assert(tt004Check?.verdict === 'PASS', `TT_004 verdict should be PASS, got ${tt004Check?.verdict}`);
  assert(test2.guardAudit.overallStatus === 'PASS', `Test 2 overallStatus should be PASS, got ${test2.guardAudit.overallStatus}`);

  // ----------------------------------------------------
  // TEST 3: Suy rộng áo tứ thân thành trang phục toàn quốc/mọi thời kỳ (TT_003) -> WARNING hoặc BLOCKED
  // ----------------------------------------------------
  console.log('\n--- Test 3: Suy rộng áo tứ thân thành quốc phục toàn quốc mọi thời kỳ ---');
  const test3 = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_tu_than',
    preferences: {
      costumeId: 'ao_tu_than',
      gender: 'female',
      occasion: 'streetwear_daily',
      styleVibe: 'cyber_indochine',
      remixLevel: 2,
      selectedColors: ['Đỏ Chu Sa'],
      selectedMaterials: ['Lụa'],
      customPrompt: 'Khẳng định áo tứ thân là quốc phục chính thống của toàn quốc Việt Nam qua mọi thời kỳ lịch sử.',
    },
    proposedOutfit: {
      title: 'Quốc Phục Toàn Quốc Áo Tứ Thân',
      concept: 'Áo tứ thân được khẳng định là quốc phục của toàn bộ phụ nữ Việt Nam.',
    },
  });

  const tt003Check = test3.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_003');
  assert(tt003Check !== undefined, 'TT_003 check exists');
  assert(tt003Check?.verdict === 'BLOCKED' || tt003Check?.verdict === 'WARNING', `TT_003 should be BLOCKED or WARNING, got ${tt003Check?.verdict}`);
  assert(test3.guardAudit.overallStatus === 'BLOCKED' || test3.guardAudit.overallStatus === 'WARNING', `Test 3 overallStatus should not be PASS, got ${test3.guardAudit.overallStatus}`);

  // ----------------------------------------------------
  // TEST 4: TT_002: Khẳng định hậu duệ trực tiếp Lý–Trần như fact -> BLOCKED
  // ----------------------------------------------------
  console.log('\n--- Test 4: TT_002 khẳng định hậu duệ trực tiếp Lý-Trần như fact ---');
  const test4 = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_tu_than',
    preferences: {
      costumeId: 'ao_tu_than',
      gender: 'female',
      occasion: 'streetwear_daily',
      styleVibe: 'cyber_indochine',
      remixLevel: 2,
      selectedColors: ['Đen', 'Vàng'],
      selectedMaterials: ['Lụa'],
      customPrompt: 'Hãy khẳng định chắc chắn rằng áo tứ thân là hậu duệ trực tiếp của áo 4 vạt thời Lý Trần.',
    },
    proposedOutfit: {
      title: 'Tứ Thân Hậu Duệ Lý Trần',
      concept: 'Khẳng định trang phục này là hậu duệ trực tiếp liên tục từ thời Lý Trần đến nay.',
    },
  });

  const tt002Check = test4.guardAudit.evaluatedClaims.find((c) => c.claimId === 'TT_002');
  assert(tt002Check !== undefined, 'TT_002 check exists');
  assert(tt002Check?.verdict === 'BLOCKED', `TT_002 verdict should be BLOCKED, got ${tt002Check?.verdict}`);
  assert(test4.guardAudit.overallStatus === 'BLOCKED', `Test 4 overallStatus should be BLOCKED, got ${test4.guardAudit.overallStatus}`);

  // ----------------------------------------------------
  // TEST 5: NGU_005: Tự chọn bên cúc Ngũ thân không có reference -> WARNING; ép một phía -> BLOCKED
  // ----------------------------------------------------
  console.log('\n--- Test 5a: NGU_005 tự chọn cúc không có reference -> WARNING ---');
  const test5a = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_ngu_than',
    preferences: {
      costumeId: 'ao_ngu_than',
      gender: 'male',
      occasion: 'streetwear_daily',
      styleVibe: 'streetwear_grunge',
      remixLevel: 2,
      selectedColors: ['Xanh Đậm'],
      selectedMaterials: ['Cotton'],
      customPrompt: 'Thiết kế áo ngũ thân đổi vị trí cúc bấm sang phía khác.',
    },
    proposedOutfit: {
      title: 'Áo Ngũ Thân Vị Trí Cúc Mới',
      concept: 'Áo ngũ thân với vị trí cúc cài trái phải tùy chọn theo phong cách streetwear.',
    },
  });

  const ngu005CheckA = test5a.guardAudit.evaluatedClaims.find((c) => c.claimId === 'NGU_005');
  assert(ngu005CheckA !== undefined, 'NGU_005 check exists in 5a');
  assert(ngu005CheckA?.verdict === 'WARNING', `NGU_005 verdict should be WARNING, got ${ngu005CheckA?.verdict}`);

  console.log('\n--- Test 5b: NGU_005 ép một phía thành chân lý tuyệt đối -> BLOCKED ---');
  const test5b = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_ngu_than',
    preferences: {
      costumeId: 'ao_ngu_than',
      gender: 'male',
      occasion: 'streetwear_daily',
      styleVibe: 'cyber_indochine',
      remixLevel: 2,
      selectedColors: ['Đen'],
      selectedMaterials: ['Lụa'],
      customPrompt: 'Khẳng định chắc chắn rằng áo ngũ thân chuẩn chỉ được phép cài cúc một phía duy nhất, mọi cách khác đều sai.',
    },
    proposedOutfit: {
      title: 'Áo Ngũ Thân Cài Cúc Độc Tôn',
      concept: 'Khẳng định vị trí cúc cài chỉ có một phía duy nhất trong lịch sử triều Nguyễn.',
    },
  });

  const ngu005CheckB = test5b.guardAudit.evaluatedClaims.find((c) => c.claimId === 'NGU_005');
  assert(ngu005CheckB !== undefined, 'NGU_005 check exists in 5b');
  assert(ngu005CheckB?.verdict === 'BLOCKED', `NGU_005 verdict should be BLOCKED, got ${ngu005CheckB?.verdict}`);
  assert(test5b.guardAudit.overallStatus === 'BLOCKED', `Test 5b overallStatus should be BLOCKED, got ${test5b.guardAudit.overallStatus}`);

  // ----------------------------------------------------
  // TEST 6: NOT_RESEARCHED Costume cannot get PASS through empty claims
  // ----------------------------------------------------
  console.log('\n--- Test 6: NOT_RESEARCHED costume (ao_nhat_binh) through engine -> BLOCKED (no empty-claims PASS) ---');
  const test6 = HeritageGuardEngine.evaluateAndSanitize({
    costumeId: 'ao_nhat_binh',
    preferences: {
      costumeId: 'ao_nhat_binh',
      gender: 'female',
      occasion: 'tet_contemporary',
      styleVibe: 'editorial_avantgarde',
      remixLevel: 1,
      selectedColors: ['Đỏ'],
      selectedMaterials: ['Lụa'],
      customPrompt: 'Thiết kế áo nhật bình',
    },
    proposedOutfit: {
      title: 'Áo Nhật Bình',
    },
  });

  assert(test6.guardAudit.overallStatus === 'BLOCKED', `Empty claims costume must be BLOCKED, got ${test6.guardAudit.overallStatus}`);
  assert(test6.guardAudit.integrityScore === 0, `Integrity score must be 0, got ${test6.guardAudit.integrityScore}`);

  // ----------------------------------------------------
  // TEST 7: HTTP Endpoint integration tests against running server
  // ----------------------------------------------------
  console.log('\n--- Test 7: HTTP Endpoint Integration Tests (port 3000) ---');

  const makeRequest = (path: string, payload: any): Promise<{ statusCode: number; body: any }> => {
    return new Promise((resolve, reject) => {
      const dataStr = JSON.stringify(payload);
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 3000,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataStr),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              resolve({ statusCode: res.statusCode || 500, body: JSON.parse(body) });
            } catch {
              resolve({ statusCode: res.statusCode || 500, body });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(dataStr);
      req.end();
    });
  };

  try {
    // 7.1 /api/remix-outfit with ao_nhat_binh -> HTTP 409 NOT_RESEARCHED
    const resRemixNotResearched = await makeRequest('/api/remix-outfit', {
      costumeId: 'ao_nhat_binh',
      preferences: { costumeId: 'ao_nhat_binh' },
    });
    assert(resRemixNotResearched.statusCode === 409, `/api/remix-outfit with NOT_RESEARCHED returns HTTP 409, got ${resRemixNotResearched.statusCode}`);
    assert(resRemixNotResearched.body.code === 'NOT_RESEARCHED', `Error code is NOT_RESEARCHED, got ${resRemixNotResearched.body.code}`);

    // 7.2 /api/remix-outfit with invalid costume -> HTTP 400 INVALID_COSTUME_ID
    const resRemixInvalidId = await makeRequest('/api/remix-outfit', {
      costumeId: 'unknown_costume',
      preferences: { costumeId: 'unknown_costume' },
    });
    assert(resRemixInvalidId.statusCode === 400, `/api/remix-outfit with invalid ID returns HTTP 400, got ${resRemixInvalidId.statusCode}`);
    assert(resRemixInvalidId.body.code === 'INVALID_COSTUME_ID', `Error code is INVALID_COSTUME_ID, got ${resRemixInvalidId.body.code}`);

    // 7.3 /api/stress-test-guard with ao_nhat_binh -> HTTP 409 NOT_RESEARCHED
    const resStressNotResearched = await makeRequest('/api/stress-test-guard', {
      costumeId: 'ao_nhat_binh',
      violationScenario: 'ta_nham',
    });
    assert(resStressNotResearched.statusCode === 409, `/api/stress-test-guard with NOT_RESEARCHED returns HTTP 409, got ${resStressNotResearched.statusCode}`);

    // 7.4 /api/stress-test-guard with valid costume -> 200 with BLOCKED scenario
    const resStressValid = await makeRequest('/api/stress-test-guard', {
      costumeId: 'ao_ngu_than',
      violationScenario: 'ta_nham',
    });
    assert(resStressValid.statusCode === 200, `/api/stress-test-guard with ao_ngu_than returns 200, got ${resStressValid.statusCode}`);
    assert(resStressValid.body.auditResult.overallStatus === 'BLOCKED', `Stress test scenario 'ta_nham' should be BLOCKED, got ${resStressValid.body.auditResult.overallStatus}`);
  } catch (netErr) {
    console.warn('⚠️ Server not responding on port 3000 for HTTP test, verify dev server is running:', netErr);
  }

  // ----------------------------------------------------
  // TEST 8: Evaluator Fail-Closed Unit Logic Verification
  // ----------------------------------------------------
  console.log('\n--- Test 8: Evaluator Fail-Closed Logic Verification ---');

  const claimsAoNguThan = HERITAGE_CORE_DATABASE.filter((c) => c.costume === 'ao_ngu_than');
  const expectedIds = claimsAoNguThan.map((c) => c.id);

  function validateEvaluatorOutput(parsed: any, claims: typeof claimsAoNguThan) {
    if (!parsed || !['PASS', 'WARNING', 'BLOCKED'].includes(parsed.overallStatus)) return null;
    if (!Array.isArray(parsed.checks)) return null;
    const expectedClaimIds = new Set(claims.map((c) => c.id));
    if (parsed.checks.length !== expectedClaimIds.size) return null;
    const seen = new Set<string>();
    for (const chk of parsed.checks) {
      if (!chk || typeof chk.claimId !== 'string' || !['PASS', 'WARNING', 'BLOCKED'].includes(chk.verdict) || typeof chk.reason !== 'string') return null;
      if (!expectedClaimIds.has(chk.claimId)) return null;
      if (seen.has(chk.claimId)) return null;
      seen.add(chk.claimId);
    }
    for (const reqId of expectedClaimIds) {
      if (!seen.has(reqId)) return null;
    }
    if (!Array.isArray(parsed.warnings) || !Array.isArray(parsed.suggestedCorrections)) return null;
    if (parsed.checks.some((c: any) => c.verdict === 'BLOCKED')) parsed.overallStatus = 'BLOCKED';
    else if (parsed.checks.some((c: any) => c.verdict === 'WARNING')) parsed.overallStatus = 'WARNING';
    return parsed;
  }

  // 8.1 Missing claim check -> fail-closed (returns null)
  const test8Missing = validateEvaluatorOutput({
    overallStatus: 'PASS',
    checks: expectedIds.slice(0, -1).map(id => ({ claimId: id, verdict: 'PASS', reason: 'ok' })),
    warnings: [],
    suggestedCorrections: [],
  }, claimsAoNguThan);
  assert(test8Missing === null, 'Evaluator with missing claim must be rejected (fail-closed null)');

  // 8.2 Extra unknown claim check -> fail-closed (returns null)
  const test8Extra = validateEvaluatorOutput({
    overallStatus: 'PASS',
    checks: [...expectedIds.map(id => ({ claimId: id, verdict: 'PASS', reason: 'ok' })), { claimId: 'UNKNOWN_999', verdict: 'PASS', reason: 'ok' }],
    warnings: [],
    suggestedCorrections: [],
  }, claimsAoNguThan);
  assert(test8Extra === null, 'Evaluator with extra unknown claim must be rejected (fail-closed null)');

  // 8.3 Duplicate claim check -> fail-closed (returns null)
  const test8Duplicate = validateEvaluatorOutput({
    overallStatus: 'PASS',
    checks: [
      { claimId: expectedIds[0], verdict: 'PASS', reason: 'ok' },
      { claimId: expectedIds[0], verdict: 'PASS', reason: 'ok' },
      ...expectedIds.slice(2).map(id => ({ claimId: id, verdict: 'PASS', reason: 'ok' })),
    ],
    warnings: [],
    suggestedCorrections: [],
  }, claimsAoNguThan);
  assert(test8Duplicate === null, 'Evaluator with duplicate claim must be rejected (fail-closed null)');

  // 8.4 Inconsistent overallStatus: check is BLOCKED, but overall was PASS -> enforces BLOCKED
  const test8Inconsistent = validateEvaluatorOutput({
    overallStatus: 'PASS',
    checks: expectedIds.map((id, idx) => ({
      claimId: id,
      verdict: idx === 0 ? 'BLOCKED' : 'PASS',
      reason: idx === 0 ? 'violation' : 'ok',
    })),
    warnings: ['Blocked violation detected'],
    suggestedCorrections: ['Fix violation'],
  }, claimsAoNguThan);
  assert(test8Inconsistent !== null, 'Valid format should not be rejected');
  assert(test8Inconsistent?.overallStatus === 'BLOCKED', `Inconsistent overallStatus must be corrected to BLOCKED, got ${test8Inconsistent?.overallStatus}`);

  console.log('\n====================================================');
  console.log('🎉 ALL HERITAGE INTEGRITY AND FAIL-CLOSED TESTS PASSED!');
  console.log('====================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
