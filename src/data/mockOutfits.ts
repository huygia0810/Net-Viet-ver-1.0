import { CostumeId, OutfitResult, StylingPreferences } from '../types';
import { HeritageGuardEngine } from '../services/heritageGuard';

/**
 * SAMPLE_OUTFITS_BY_COSTUME:
 * Chỉ lưu trữ mẫu tham khảo nội bộ cho các trang phục đã có Heritage Core chính thức (ao_ngu_than, ao_tu_than).
 * Tuyệt đối không lưu trữ hoặc cấp mock outfit cho trang phục NOT_RESEARCHED (ao_nhat_binh).
 * Các mẫu này KHÔNG được cấp nhãn PASS/APPROVED mặc định của AI Evaluator.
 */
export const SAMPLE_OUTFITS_BY_COSTUME: Partial<Record<CostumeId, OutfitResult[]>> = {
  ao_ngu_than: [
    {
      id: 'outfit_nt_demo',
      costumeId: 'ao_ngu_than',
      title: 'Hắc Sa Dạ Hành (Cyber Indochine Concept)',
      tagline: 'Phom dáng ngũ thân lập lĩnh trên nền chất liệu kỹ thuật đương đại.',
      concept:
        'Thử nghiệm phom dáng áo ngũ thân nam thời Nguyễn và tinh thần Techwear đương đại. Áo lấy cảm hứng cấu trúc 5 thân và cài khuy hữu nhậm bên phải, thay thế chất liệu vải truyền thống bằng chất liệu kỹ thuật.',
      silhouette: 'Áo suông dài qua đầu gối, vạt buông lượn nhẹ mở tà hai bên hông.',
      pieces: {
        mainPiece: {
          name: 'Áo Ngũ Thân Hắc Sa Tech-Coat',
          description: 'Áo ngũ thân dáng dài 5 thân, cổ lập lĩnh, cài 5 khuy bấm kim loại từ nách sang sườn phải. Vải dù kỹ thuật dệt chìm hoa văn.',
          heritageOrigin: 'Khảo sát y phục thời Nguyễn thế kỷ XVIII – XIX.',
          materialUsed: 'Nylon dệt vi sợi chống nước + Tơ dệt chìm',
        },
        layeringPiece: {
          name: 'Áo Lót Thân Trong (Modern Inner)',
          description: 'Áo thun cotton hữu cơ cổ tròn màu xám xi măng.',
          materialUsed: 'Cotton hữu cơ 280gsm',
        },
        bottomPiece: {
          name: 'Quần Cargo Ống Rộng Xếp Ly Đôi',
          description: 'Quần lụa pha tơ hai ống phom rộng, bổ sung túi hộp phẳng tinh tế mang dáng dấp chiếc quần hai ống thời Nguyễn.',
          materialUsed: 'Lụa dệt phối sợi tổng hợp tái chế',
        },
        accessories: [
          {
            name: 'Vòng Cổ Khắc Họa Tiết Vân Mây',
            description: 'Vòng bạc 925 tối giản với mặt dây chuyền hình mây cụm cung đình Huế.',
          },
          {
            name: 'Kính Râm Gọng Đồi Mồi Hình Oval',
            description: 'Phụ kiện lấy cảm hứng từ các bậc túc nho đầu thế kỷ 20.',
          },
        ],
        footwear: {
          name: 'Sneakers Cổ Cao Đế Chunky Da Đen',
          description: 'Đôi giày thể thao da lì tối giản thay thế cho guốc gỗ hoặc hài thêu truyền thống, tạo bước đi mạnh mẽ năng động.',
        },
        colorScheme: [
          { name: 'Hắc Sắc (Đen sơn mài)', hex: '#141416', culturalMeaning: 'Màu của sự điềm đạm, trầm mặc.' },
          { name: 'Xám Xi Măng Phố Thị', hex: '#686B73', culturalMeaning: 'Biểu trưng của nhịp sống hiện đại giao thoa.' },
          { name: 'Vàng Hoàng Lưu Ly (Điểm xuyết khuy)', hex: '#D4AF37', culturalMeaning: 'Sắc vàng làm điểm nhấn khuy kim loại.' },
        ],
        materials: ['Vải dù công nghệ dệt jacquard', 'Lụa pha', 'Bạc 925', 'Titanium'],
      },
      preservedTraditionalElements: [
        {
          title: 'Cổ Đứng (Lập Lĩnh) Khép Kín',
          explanation: 'Hệ thống cổ đứng và cài cúc tuân theo mẫu nguồn reference lịch sử cụ thể.',
          heritageRuleReference: 'Heritage Claim #NGU_003 (Cổ đứng và cài cúc theo reference)',
        },
        {
          title: 'Cấu Trúc 5 Thân / Vạt',
          explanation: 'Dùng cấu trúc 5 thân khi reference phù hợp trong các mẫu và mô tả lịch sử.',
          heritageRuleReference: 'Heritage Claim #NGU_002 (Cấu trúc 5 thân/vạt áo)',
        },
        {
          title: 'Ý Niệm Diễn Giải Văn Hóa',
          explanation: 'Tiếp nhận cảm hứng từ biểu trưng văn hóa có gắn nhãn mô tả, tôn trọng tính đa dạng của nguồn tư liệu.',
          heritageRuleReference: 'Heritage Claim #NGU_004 (Diễn giải văn hóa có gắn nhãn)',
        },
      ],
      modernRemixInterventions: [
        {
          title: 'Chất Liệu Kỹ Thuật (Tech-Fabric) Chống Thấm',
          explanation: 'Thay thế the lụa bằng vải dệt công nghệ cao, phù hợp với khí hậu nhiệt đới ẩm.',
          rationale: 'Tính thực dụng trong đời sống đương đại.',
        },
        {
          title: 'Mix-Match Cùng Sneakers & Phụ Kiện Tối Giản',
          explanation: 'Phối cùng giày sneaker đế chunky và túi chéo hiện đại.',
          rationale: 'Đưa Việt phục vào không gian đời sống thường nhật.',
        },
      ],
      heritageNotes: {
        scopedFacts: [
          'Áo ngũ thân định hình từ thế kỷ 18 dưới thời Chúa Nguyễn Phúc Khoát và phổ biến thế kỷ 19 thời Nguyễn.',
          'Quy định mặc quần hai ống (thay cho váy) là định chế thời Minh Mạng năm 1828.',
        ],
        contextualMandates: [
          'Khuy áo cài bên hữu (bên phải), tuân theo mẫu khảo sát lịch sử.',
        ],
        aiUncertainties: [
          'Không có bằng chứng lịch sử nào cho thấy áo ngũ thân được mặc từ thời Lý - Trần hay Hùng Vương.',
        ],
      },
      heritageGuardAudit: {
        overallStatus: 'WARNING',
        integrityScore: 70,
        evaluatedClaims: [],
        culturalWarnings: ['MẪU DEMO — Chưa qua thẩm định AI Evaluator chính thức.'],
        guardSummary: 'MẪU DEMO THAM KHẢO GIAO DIỆN — Chưa được Heritage Guard phê duyệt.',
        evaluationMode: 'HEURISTIC_FALLBACK',
      },
      stylingTips: [
        'Giữ ve áo thẳng thớm, cài đủ 5 khuy khi tham dự sự kiện trang trọng.',
      ],
      musicVibe: 'Nhã Nhạc Cung Đình giao thoa Lo-fi Beats',
      createdAt: '2026-10-09T00:00:00Z',
    },
  ],
  ao_tu_than: [
    {
      id: 'outfit_tt_demo',
      costumeId: 'ao_tu_than',
      title: 'Đan Thanh Quan Họ (Eco-Modern Heritage Concept)',
      tagline: 'Phom dáng tứ thân mộc mạc Bắc Bộ tái sinh cùng sợi tự nhiên đũi Nam Cao và denim tái chế.',
      concept:
        'Cảm hứng từ vẻ đẹp người phụ nữ đồng bằng Bắc Bộ trong trang phục áo tứ thân, kết hợp tinh thần thời trang bền vững (Eco-Fashion). Tứ thân truyền thống được giữ lại với 2 vạt sau ghép sống lưng và 2 vạt trước buông tự do.',
      silhouette: 'Áo khoác dài buông tà tự nhiên, bên trong phối yếm lót hiện đại hóa cùng chân váy xòe thoải mái.',
      pieces: {
        mainPiece: {
          name: 'Áo Tứ Thân Đan Thanh Long-Coat',
          description: 'Áo dáng dài bốn thân bằng vải đũi dệt thủ công nhuộm nâu đất và chàm tự nhiên, sống lưng may can đôi chuẩn mực dân gian.',
          heritageOrigin: 'Trang phục nữ dân gian Bắc Bộ thế kỷ XIX – đầu thế kỷ XX.',
          materialUsed: 'Đũi tơ tằm Nam Cao nhuộm thảo mộc tự nhiên',
        },
        layeringPiece: {
          name: 'Yếm Cổ Cánh Sen Denim Tái Chế',
          description: 'Thiết kế yếm kín đáo ôm vừa vặn ngực, lấy cảm hứng từ yếm đào truyền thống nhưng sử dụng chất liệu denim mỏng mềm tái chế.',
          materialUsed: 'Denim tái chế 6.5oz',
        },
        bottomPiece: {
          name: 'Chân Váy Xòe Xếp Ly Dáng Dài (Maxi Đụp Remake)',
          description: 'Chân váy đen dáng xòe dài chấm mắt cá chân, cách tân từ kết cấu váy đụp truyền thống với cạp chun co giãn hiện đại.',
          materialUsed: 'Lụa sồi tự nhiên dệt dày dặn',
        },
        accessories: [
          {
            name: 'Thắt Lưng Lụa Xanh Mạ Buộc Dải',
            description: 'Dải lụa mềm thắt nhẹ ngang eo tạo điểm nhấn màu sắc lấy cảm hứng từ dải bao Quan họ.',
          },
          {
            name: 'Túi Nón Ba Tầm Mini',
            description: 'Túi xách tay đan mây tre hình chiếc nón thúng quai thao cách điệu.',
          },
        ],
        footwear: {
          name: 'Mules Gót Gỗ Điêu Khắc',
          description: 'Guốc gỗ mũi vuông lấy cảm hứng từ guốc mộc truyền thống với quai da tối giản.',
        },
        colorScheme: [
          { name: 'Nâu Củ Nâu Thổ Nhưỡng', hex: '#583A2E', culturalMeaning: 'Màu của đất phù sa và sự mộc mạc.' },
          { name: 'Hồng Đào Hội Làng', hex: '#D64550', culturalMeaning: 'Sắc hồng duyên dáng của chiếc yếm ngày hội.' },
          { name: 'Xanh Lá Mạ', hex: '#606C38', culturalMeaning: 'Màu của dải thắt lưng duyên dáng.' },
        ],
        materials: ['Đũi Nam Cao', 'Denim tái chế', 'Lụa sồi tự nhiên', 'Tre đan mỹ nghệ'],
      },
      preservedTraditionalElements: [
        {
          title: 'Cấu Trúc 4 Vạt Áo & Chắp Sống Lưng',
          explanation: 'Hai vạt sau chắp sống chỉ đôi, hai vạt trước buông thả hoặc thắt nhẹ.',
          heritageRuleReference: 'Heritage Claim #TU_001 (Kết cấu 4 vạt áo tứ thân)',
        },
        {
          title: 'Lớp Yếm Lót Che Ngực Tế Nhị',
          explanation: 'Bảo lưu hình thái chiếc yếm kín đáo che chắn khuôn ngực, phù hợp nếp sống truyền thống.',
          heritageRuleReference: 'Heritage Claim #TU_002 (Yếm lót nữ truyền thống)',
        },
      ],
      modernRemixInterventions: [
        {
          title: 'Vật Liệu Denim Tái Chế Cho Chiếc Yếm',
          explanation: 'Đưa chất liệu streetwear bền bỉ vào cấu trúc yếm cổ điển, tạo nét cá tính đương đại.',
          rationale: 'Thời trang bền vững kết hợp mỹ học truyền thống.',
        },
        {
          title: 'Chuyển Đổi Váy Đụp Sang Maxi Xếp Ly',
          explanation: 'Phom váy xòe thoải mái, dễ ứng dụng trong các buổi triển lãm nghệ thuật và dạo phố.',
          rationale: 'Tính linh hoạt trong nhịp sống hiện đại.',
        },
      ],
      heritageNotes: {
        scopedFacts: [
          'Áo tứ thân gắn liền với phụ nữ Bắc Bộ thế kỷ XIX - đầu thế kỷ XX.',
        ],
        contextualMandates: [
          'Trang phục thường nhật dân gian Bắc Bộ mặc yếm lót kín đáo kết hợp áo tứ thân.',
        ],
        aiUncertainties: [
          'Cần phân biệt rõ giữa trang phục biểu diễn Quan họ lễ hội mớ ba mớ bảy và trang phục lao động thường nhật.',
        ],
      },
      heritageGuardAudit: {
        overallStatus: 'WARNING',
        integrityScore: 70,
        evaluatedClaims: [],
        culturalWarnings: ['MẪU DEMO — Chưa qua thẩm định AI Evaluator chính thức.'],
        guardSummary: 'MẪU DEMO THAM KHẢO GIAO DIỆN — Chưa được Heritage Guard phê duyệt.',
        evaluationMode: 'HEURISTIC_FALLBACK',
      },
      stylingTips: [
        'Có thể buông tà tự nhiên khi dạo phố hoặc buộc vạt nhẹ khi di chuyển năng động.',
      ],
      musicVibe: 'Dân Ca Quan Họ Bắc Bộ phối Acoustic Cello',
      createdAt: '2026-10-09T00:00:00Z',
    },
  ],
};

/**
 * getSampleOutfit:
 * Tuyệt đối từ chối trả về outfit nếu costumeId là NOT_RESEARCHED hoặc không có mẫu hợp lệ.
 * Không âm thầm thay một ID không hợp lệ bằng Ngũ thân.
 * Trả về null nếu costume không được phép hoặc chưa nghiên cứu.
 */
export function getSampleOutfit(costumeId: CostumeId, preferences: StylingPreferences): OutfitResult | null {
  // 1. Không bao giờ cấp mẫu cho NOT_RESEARCHED hoặc ID lạ
  if (costumeId === 'ao_nhat_binh' || !SAMPLE_OUTFITS_BY_COSTUME[costumeId]) {
    return null;
  }

  const list = SAMPLE_OUTFITS_BY_COSTUME[costumeId];
  if (!list || list.length === 0) {
    return null;
  }

  const base = list[0];

  // Run dynamic Heritage Guard check on it with user preferences
  const dynamicAudit = HeritageGuardEngine.evaluate({
    costumeId,
    preferences,
    proposedOutfit: base,
  });

  // Nếu kết quả heuristic audit là BLOCKED thì không tạo outfit
  if (dynamicAudit.overallStatus === 'BLOCKED') {
    return null;
  }

  // Đảm bảo gắn nhãn rõ ràng: MẪU DEMO, không cấp nhãn PASS/APPROVED của AI Evaluator
  const demoAudit = {
    ...dynamicAudit,
    overallStatus: 'WARNING' as const,
    evaluationMode: 'HEURISTIC_FALLBACK' as const,
    guardSummary: '[CHẾ ĐỘ MẪU DEMO] Thiết kế mẫu tham khảo giao diện — Chưa qua thẩm định AI Evaluator chính thức.',
    culturalWarnings: [
      'MẪU DEMO THAM KHẢO — Không phải kết quả AI đã được Heritage Guard phê duyệt.',
      ...dynamicAudit.culturalWarnings,
    ],
  };

  return {
    ...base,
    id: `demo_${costumeId}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    heritageGuardAudit: demoAudit,
  };
}
