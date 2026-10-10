import { EvaluatedClaimCheck, GuardOverallStatus, HeritageCoreClaim } from '../types';

export interface GeminiCheckRaw {
  claimId: string;
  verdict: 'PASS' | 'WARNING' | 'BLOCKED';
  reason: string;
  scopeIssue?: string;
}

export interface GeminiEvaluatorOutput {
  overallStatus: GuardOverallStatus;
  integrityScore: number;
  guardSummary: string;
  culturalWarnings: string[];
  suggestedCorrections: string[];
  checks: GeminiCheckRaw[];
}

export interface ValidationSuccess {
  isValid: true;
  evaluatedClaims: EvaluatedClaimCheck[];
  overallStatus: GuardOverallStatus;
  integrityScore: number;
  guardSummary: string;
  culturalWarnings: string[];
  suggestedCorrections: string[];
}

export interface ValidationFailure {
  isValid: false;
  errorReason: string;
}

export type EvaluatorValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates Gemini Evaluator structured output with strict fail-closed integrity rules.
 * Shared between production server (`server.ts`) and test suites (`tests/*`).
 */
export function validateGeminiEvaluatorOutput(
  rawJson: string | object,
  expectedClaims: HeritageCoreClaim[]
): EvaluatorValidationResult {
  let parsed: GeminiEvaluatorOutput;

  try {
    if (typeof rawJson === 'string') {
      parsed = JSON.parse(rawJson.trim());
    } else {
      parsed = rawJson as GeminiEvaluatorOutput;
    }
  } catch (err: any) {
    return {
      isValid: false,
      errorReason: `JSON parsing failed: ${err.message || 'Invalid JSON syntax'}`,
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { isValid: false, errorReason: 'Evaluator output is not an object.' };
  }

  // 1. Kiểm tra overallStatus hợp lệ
  if (!['PASS', 'WARNING', 'BLOCKED'].includes(parsed.overallStatus)) {
    return { isValid: false, errorReason: `Invalid overallStatus: "${parsed.overallStatus}"` };
  }

  // 2. Kiểm tra mảng checks
  if (!Array.isArray(parsed.checks)) {
    return { isValid: false, errorReason: 'checks is not an array.' };
  }

  const expectedClaimIds = expectedClaims.map((c) => c.id);
  const expectedSet = new Set(expectedClaimIds);
  const receivedClaimIds = parsed.checks.map((c) => c?.claimId);
  const receivedSet = new Set(receivedClaimIds);

  // 3. Khớp chính xác tập claim ID (không thiếu, không thừa, không duplicate)
  if (parsed.checks.length !== expectedClaimIds.length) {
    return {
      isValid: false,
      errorReason: `Checks count mismatch: expected ${expectedClaimIds.length}, received ${parsed.checks.length}`,
    };
  }

  if (receivedSet.size !== parsed.checks.length) {
    return {
      isValid: false,
      errorReason: 'Duplicate claimId found in Evaluator checks response.',
    };
  }

  for (const id of expectedClaimIds) {
    if (!receivedSet.has(id)) {
      return {
        isValid: false,
        errorReason: `Missing required claimId in checks: "${id}"`,
      };
    }
  }

  for (const id of receivedClaimIds) {
    if (!expectedSet.has(id)) {
      return {
        isValid: false,
        errorReason: `Unexpected extra claimId in checks: "${id}"`,
      };
    }
  }

  // 4. Validate từng check và kiểu dữ liệu
  const evaluatedClaims: EvaluatedClaimCheck[] = [];
  let foundBlocked = false;
  let foundWarning = false;

  for (const check of parsed.checks) {
    if (!check || typeof check !== 'object') {
      return { isValid: false, errorReason: 'Invalid check item structure.' };
    }
    if (!['PASS', 'WARNING', 'BLOCKED'].includes(check.verdict)) {
      return {
        isValid: false,
        errorReason: `Invalid verdict "${check.verdict}" on claim ${check.claimId}.`,
      };
    }
    // Bắt buộc check.reason là string không rỗng, không tự sinh reason mặc định
    if (typeof check.reason !== 'string' || check.reason.trim().length === 0) {
      return { isValid: false, errorReason: `Check reason must be a non-empty string for claim ${check.claimId}.` };
    }

    if (check.verdict === 'BLOCKED') foundBlocked = true;
    if (check.verdict === 'WARNING') foundWarning = true;

    if (check.scopeIssue !== undefined && typeof check.scopeIssue !== 'string') {
      return { isValid: false, errorReason: `scopeIssue must be string or undefined for ${check.claimId}.` };
    }

    const matchedClaim = expectedClaims.find((c) => c.id === check.claimId)!;
    evaluatedClaims.push({
      claimId: matchedClaim.id,
      claimText: matchedClaim.claim,
      access: matchedClaim.ai_access,
      verdict: check.verdict,
      guardFeedback: check.reason.trim(),
      scopeIssue: check.scopeIssue,
    });
  }

  // 5. Enforce consistency: overallStatus không thể PASS nếu có check WARNING hoặc BLOCKED.
  // Không tự sửa payload sai thành payload hợp lệ mà từ chối fail-closed.
  if (foundBlocked && parsed.overallStatus !== 'BLOCKED') {
    return {
      isValid: false,
      errorReason: 'Contradictory status: checks contain BLOCKED but overallStatus is not BLOCKED.',
    };
  }

  if (foundWarning && parsed.overallStatus === 'PASS') {
    return {
      isValid: false,
      errorReason: 'Contradictory status: checks contain WARNING but overallStatus is PASS.',
    };
  }

  // 6. Validate integrityScore (không âm thầm gán mặc định nếu sai kiểu/thiếu)
  if (typeof parsed.integrityScore !== 'number' || isNaN(parsed.integrityScore)) {
    return { isValid: false, errorReason: 'integrityScore must be a valid number.' };
  }
  if (parsed.integrityScore < 0 || parsed.integrityScore > 100) {
    return { isValid: false, errorReason: `integrityScore must be between 0 and 100, got ${parsed.integrityScore}.` };
  }
  const integrityScore = parsed.integrityScore;

  // 7. Validate culturalWarnings: bắt buộc là array các string theo schema production
  if (parsed.culturalWarnings === undefined) {
    return { isValid: false, errorReason: 'Missing required field: culturalWarnings.' };
  }
  if (!Array.isArray(parsed.culturalWarnings)) {
    return { isValid: false, errorReason: 'culturalWarnings must be an array of strings.' };
  }
  for (const warning of parsed.culturalWarnings) {
    if (typeof warning !== 'string') {
      return { isValid: false, errorReason: 'Every item in culturalWarnings must be a string.' };
    }
  }
  const culturalWarnings = parsed.culturalWarnings;

  // 8. Validate suggestedCorrections: bắt buộc là array các string
  if (!Array.isArray(parsed.suggestedCorrections)) {
    return { isValid: false, errorReason: 'suggestedCorrections must be an array of strings.' };
  }
  for (const corr of parsed.suggestedCorrections) {
    if (typeof corr !== 'string') {
      return { isValid: false, errorReason: 'Every item in suggestedCorrections must be a string.' };
    }
  }
  const suggestedCorrections = parsed.suggestedCorrections;

  // 9. Validate guardSummary
  if (typeof parsed.guardSummary !== 'string' || parsed.guardSummary.trim().length === 0) {
    return { isValid: false, errorReason: 'guardSummary must be a non-empty string.' };
  }
  const guardSummary = parsed.guardSummary.trim();

  return {
    isValid: true,
    evaluatedClaims,
    overallStatus: parsed.overallStatus,
    integrityScore,
    guardSummary,
    culturalWarnings,
    suggestedCorrections,
  };
}
