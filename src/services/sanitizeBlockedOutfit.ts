import { OutfitResult, HeritageGuardAudit, CostumeId } from '../types';

/**
 * Creates a sanitized, purged OutfitResult when the audit verdict is BLOCKED.
 * Strips all lookbook, styling, concept, silhouette, pieces, and materials
 * to prevent leaking unapproved or culturally violating designs.
 */
export function createBlockedPurgedOutfit(
  costumeId: CostumeId,
  guardAudit: HeritageGuardAudit
): OutfitResult {
  return {
    id: `blocked_${Date.now()}`,
    costumeId,
    title: '[BỊ CHẶN BỞI HERITAGE GUARD]',
    tagline: 'Vi phạm quy tắc liêm chính di sản văn hóa',
    concept: '',
    silhouette: '',
    pieces: {
      mainPiece: { name: '', description: '', materialUsed: '' },
      bottomPiece: { name: '', description: '', materialUsed: '' },
      accessories: [],
      footwear: { name: '', description: '' },
      colorScheme: [],
      materials: [],
    },
    preservedTraditionalElements: [],
    modernRemixInterventions: [],
    heritageNotes: {
      scopedFacts: [],
      contextualMandates: [],
      aiUncertainties: [],
    },
    heritageGuardAudit: guardAudit,
    stylingTips: [],
    musicVibe: '',
    createdAt: new Date().toISOString(),
  };
}
