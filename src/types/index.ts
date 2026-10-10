export type CostumeId = 'ao_ngu_than' | 'ao_tu_than' | 'ao_nhat_binh';

export type ClaimStatus =
  | 'VERIFIED'
  | 'SUPPORTED_WITH_SCOPE'
  | 'SOURCE_VARIANCE_DISPUTED'
  | 'CULTURAL_INTERPRETATION'
  | 'UNVERIFIED'
  | 'INCORRECT';

export type AiAccess = 'GREEN' | 'YELLOW' | 'RED';

export interface HeritageClaim {
  id: string;
  costume: string;
  claim: string;
  status: ClaimStatus;
  evidence: string;
  time: string;
  region_context: string;
  ai_access: AiAccess;
  ai_rule: string;
}

export type HeritageCoreClaim = HeritageClaim;

export interface CostumeMeta {
  id: CostumeId;
  name: string;
  vietnameseTitle: string;
  historicalEra: string;
  heritageStatus: 'OFFICIAL' | 'NOT_RESEARCHED';
  originOverview: string;
  silhouetteDescription: string;
  keyStructuralAnatomy: {
    part: string;
    description: string;
  }[];
  heroImageDesc: string;
  samplePalettes: string[];
}

export type Occasion =
  | 'streetwear_daily'
  | 'fashion_week'
  | 'music_festival'
  | 'smart_casual'
  | 'art_gallery'
  | 'tet_contemporary';

export type StyleVibe =
  | 'cyber_indochine'
  | 'minimalist_zen'
  | 'streetwear_grunge'
  | 'editorial_avantgarde'
  | 'y2k_vietnam';

export interface StylingPreferences {
  costumeId: CostumeId;
  gender: 'unisex' | 'female' | 'male';
  occasion: Occasion;
  styleVibe: StyleVibe;
  remixLevel: number; // 1: Bảo tồn cao, 2: Cân bằng 50/50, 3: Phá cách đương đại
  selectedColors: string[];
  selectedMaterials: string[];
  customPrompt?: string;
}

export interface OutfitPiece {
  name: string;
  description: string;
  heritageOrigin?: string;
  materialUsed?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  culturalMeaning: string;
}

export interface PreservedElement {
  title: string;
  explanation: string;
  heritageRuleReference: string;
}

export interface RemixIntervention {
  title: string;
  explanation: string;
  rationale: string;
}

export interface HeritageNotes {
  scopedFacts: string[];
  contextualMandates: string[];
  aiUncertainties: string[];
}

export type ClaimVerdict = 'PASS' | 'WARNING' | 'BLOCKED';
export type GuardOverallStatus = 'PASS' | 'WARNING' | 'BLOCKED';

export interface EvaluatedClaimCheck {
  claimId: string;
  claimText: string;
  access: AiAccess;
  verdict: ClaimVerdict;
  guardFeedback: string;
  scopeIssue?: string;
}

export interface HeritageGuardAudit {
  overallStatus: GuardOverallStatus;
  integrityScore: number; // 0 - 100
  evaluatedClaims: EvaluatedClaimCheck[];
  culturalWarnings: string[];
  suggestedCorrections?: string[];
  guardSummary: string;
  evaluationMode?: 'GEMINI_EVALUATOR' | 'HEURISTIC_FALLBACK' | 'TEST_MOCK';
}

export interface OutfitResult {
  id: string;
  costumeId: CostumeId;
  title: string;
  tagline: string;
  concept: string;
  silhouette: string;
  pieces: {
    mainPiece: OutfitPiece;
    layeringPiece?: OutfitPiece;
    bottomPiece: OutfitPiece;
    accessories: OutfitPiece[];
    footwear: OutfitPiece;
    colorScheme: ColorSwatch[];
    materials: string[];
  };
  preservedTraditionalElements: PreservedElement[];
  modernRemixInterventions: RemixIntervention[];
  heritageNotes: HeritageNotes;
  heritageGuardAudit: HeritageGuardAudit;
  originalOutfit?: Partial<OutfitResult>;
  adjustedOutfit?: Partial<OutfitResult> | null;
  auditAdjustment?: {
    originalConcept?: string;
    adjustedConcept?: string;
    adjustmentReason?: string;
  };
  stylingTips: string[];
  musicVibe: string;
  createdAt: string;
}
