import { CostumeMeta, HeritageClaim } from '../types';

/**
 * 1. COSTUME METADATA
 * Thông tin định danh và hiển thị UI cho các dòng trang phục.
 * Tách biệt hoàn toàn với Heritage Claims để dễ dàng bảo trì hoặc mở rộng.
 */
export const COSTUME_METAS: CostumeMeta[] = [
  {
    id: 'ao_ngu_than',
    name: 'Áo Ngũ Thân',
    vietnameseTitle: 'Áo Ngũ Thân (Tay Chẽn & Áo Tấc)',
    historicalEra: 'Thế kỷ XVIII – XIX (Triều Nguyễn)',
    heritageStatus: 'OFFICIAL',
    originOverview:
      'Gắn liền với định chế trang phục năm 1744 của Chúa Nguyễn Phúc Khoát ở Đàng Trong và các quy định y phục thời Minh Mạng (Triều Nguyễn).',
    silhouetteDescription:
      'Phom áo dài 5 thân, cổ đứng khép kín cài khuy theo reference lịch sử xác định, mặc cùng quần hai ống.',
    keyStructuralAnatomy: [
      { part: 'Cấu trúc 5 thân', description: '2 thân trước, 2 thân sau ghép sống lưng và 1 thân con/tiểu vạt bên trong.' },
      { part: 'Cổ đứng (Lập lĩnh)', description: 'Cổ dựng tròn ôm khít cổ trong các hiện vật khảo cứu thế kỷ XIX-XX.' },
      { part: 'Hệ thống cài cúc', description: 'Cấu trúc cài cúc theo mẫu nguồn lịch sử cụ thể.' },
      { part: 'Đường lượn vạt áo', description: 'Vạt trước uốn lượn cong nhẹ theo truyền thống may đo thủ công.' },
    ],
    heroImageDesc: 'Phong thái trang nhã, nghiêm cẩn của giới sĩ phu và quan lại thế kỷ XIX.',
    samplePalettes: ['#1C2A39', '#8C271E', '#3F4E4F', '#C8A97E', '#FAF7F2'],
  },
  {
    id: 'ao_tu_than',
    name: 'Áo Tứ Thân',
    vietnameseTitle: 'Áo Tứ Thân Bắc Bộ',
    historicalEra: 'Phổ biến vùng châu thổ Bắc Bộ (TK XIX – giữa TK XX)',
    heritageStatus: 'OFFICIAL',
    originOverview:
      'Trang phục dân gian truyền thống của phụ nữ vùng đồng bằng và trung du Bắc Bộ trong các bối cảnh được tư liệu hóa.',
    silhouetteDescription:
      'Thân áo 4 vạt (2 vạt sau nối tại sống lưng, 2 vạt trước mở/buông hoặc buộc tùy bối cảnh sinh hoạt/hội hè).',
    keyStructuralAnatomy: [
      { part: '4 Vạt áo', description: '2 thân sau nối tại sống lưng, 2 thân trước mở; không có hàng cúc cố định chạy dọc mặt trước.' },
      { part: 'Kỹ thuật phối lớp', description: 'Kỹ thuật mớ ba mớ bảy phối nhiều lớp áo the/lụa trong lễ hội/Quan họ.' },
      { part: 'Phụ kiện theo bối cảnh', description: 'Dải bao, nón quai thao hoặc khăn mỏ quạ xuất hiện tùy context lao động hay hội hè.' },
      { part: 'Váy thâm / Váy đụp', description: 'Trang phục váy màu tối gắn liền với phụ nữ Bắc Bộ.' },
    ],
    heroImageDesc: 'Mộc mạc trong lao động, duyên dáng uyển chuyển trong hội hè dân gian Bắc Bộ.',
    samplePalettes: ['#5E2638', '#D8973C', '#2B4141', '#E76F51', '#1B1B1E'],
  },
  {
    id: 'ao_nhat_binh',
    name: 'Áo Nhật Bình',
    vietnameseTitle: 'Áo Nhật Bình (Hậu Cung Triều Nguyễn)',
    historicalEra: 'Triều Nguyễn (1802 – 1945)',
    heritageStatus: 'NOT_RESEARCHED', // TẠM THỜI KHÔNG COI LÀ HERITAGE CORE CHÍNH THỨC
    originOverview:
      'Dòng trang phục truyền thống thời Nguyễn đang trong diện khảo cứu; chưa được xác lập bộ Heritage Core chính thức.',
    silhouetteDescription:
      'Chưa công bố bộ thông số tạo hình chính thức trong Heritage Core.',
    keyStructuralAnatomy: [],
    heroImageDesc: 'Trang phục đang trong diện nghiên cứu (chưa có Heritage Core chính thức).',
    samplePalettes: [],
  },
];

/**
 * 2. HERITAGE CLAIMS (OFFICIAL HUMAN-REVIEWED CORE)
 *
 * Dataset chính thức được trích xuất nguyên văn từ tài liệu Heritage Core đã qua kiểm duyệt.
 * Không tự sửa đổi, bổ sung hay suy diễn nội dung lịch sử.
 */
// SOURCE OF TRUTH
// Heritage claims ở đây sẽ được thay bằng dataset human-reviewed chính thức.
// Không tự sửa historical content trong code.

export const HERITAGE_CORE_DATABASE: HeritageClaim[] = [
  // =========================================================================
  // 1. ÁO NGŨ THÂN (OFFICIAL HUMAN-REVIEWED CLAIMS)
  // =========================================================================
  {
    id: 'NGU_001',
    costume: 'ao_ngu_than',
    claim: 'Cải cách trang phục năm 1744 quy định áo cổ đứng, xẻ vạt cài cúc, phối quần hai ống ở Đàng Trong.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical Primary Text + Academic Research',
    time: '1744',
    region_context: 'Đàng Trong',
    ai_access: 'YELLOW',
    ai_rule: 'Có thể dùng khi tái hiện đúng bối cảnh Đàng Trong năm 1744; không đưa toàn bộ phom áo ngũ thân thế kỷ XIX về năm 1744.',
  },
  {
    id: 'NGU_002',
    costume: 'ao_ngu_than',
    claim: 'Cấu trúc 5 thân/vạt của áo ngũ thân.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical Artifact / Academic Research',
    time: 'Triều Nguyễn – tùy mẫu',
    region_context: 'Nam/Nữ tùy reference',
    ai_access: 'YELLOW',
    ai_rule: 'Dùng cấu trúc 5 thân khi reference phù hợp; không suy rộng một mẫu cụ thể thành quy chuẩn bất biến cho mọi áo ngũ thân.',
  },
  {
    id: 'NGU_003',
    costume: 'ao_ngu_than',
    claim: 'Hệ thống 5 cúc/cấu trúc cài cúc của áo ngũ thân theo mẫu nguồn.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical Artifact / Academic Research',
    time: 'Triều Nguyễn – tùy mẫu',
    region_context: 'Tùy reference',
    ai_access: 'YELLOW',
    ai_rule: 'Dùng hệ thống cài cúc theo historical reference; không tự suy đoán trái/phải khi chưa có reference cụ thể.',
  },
  {
    id: 'NGU_004',
    costume: 'ao_ngu_than',
    claim: 'Quan niệm “Ngũ thân phụ mẫu / Ngũ thường” là một diễn giải văn hóa được ghi nhận.',
    status: 'CULTURAL_INTERPRETATION',
    evidence: 'Cultural Interpretation / Diễn giải văn hóa',
    time: 'Giai đoạn muộn / hiện nay',
    region_context: 'Văn hóa / diễn giải',
    ai_access: 'RED',
    ai_rule: 'Không trình bày như historical fact; chỉ dùng như diễn giải văn hóa hoặc cảm hứng truyền thông có gắn nhãn.',
  },
  {
    id: 'NGU_005',
    costume: 'ao_ngu_than',
    claim: 'Vị trí cúc trái/phải là SOURCE_VARIANCE / DISPUTED trong các nguồn được khảo sát.',
    status: 'SOURCE_VARIANCE_DISPUTED',
    evidence: 'Source Variance / Mâu thuẫn nguồn',
    time: 'Triều Nguyễn',
    region_context: 'Cần quy ước / reference cụ thể',
    ai_access: 'RED',
    ai_rule: 'Không tự đoán trái/phải. Có reference thì bám reference; không có reference thì phải thông báo nguồn có khác biệt.',
  },

  // =========================================================================
  // 2. ÁO TỨ THÂN (OFFICIAL HUMAN-REVIEWED CLAIMS)
  // =========================================================================
  {
    id: 'TT_001',
    costume: 'ao_tu_than',
    claim: 'Cấu trúc 4 thân/ vạt: 2 thân sau nối tại sống lưng, 2 thân trước mở; không có hàng cúc cố định chạy dọc mặt trước.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical Artifact + Academic Research',
    time: 'Thế kỷ XIX – giữa TK XX',
    region_context: 'Đồng bằng / trung du Bắc Bộ; phụ nữ nông thôn trong phạm vi nguồn khảo sát',
    ai_access: 'YELLOW',
    ai_rule: 'Giữ đúng cấu trúc 4-vạt và đường nối sau. Không biến thành ngũ thân/sườn xám. Chỉ khẳng định trong scope nguồn đã kiểm chứng.',
  },
  {
    id: 'TT_002',
    costume: 'ao_tu_than',
    claim: 'Áo tứ thân là hậu duệ trực tiếp của kiểu áo 4-vạt thời Lý–Trần.',
    status: 'UNVERIFIED',
    evidence: 'Academic Research / chưa có chuỗi bằng chứng liên tục',
    time: 'Lý–Trần → cận/hiện đại',
    region_context: 'Không đủ dữ liệu để xác lập chuỗi truyền thừa trực tiếp',
    ai_access: 'RED',
    ai_rule: 'Không trình bày như fact. Có thể ghi: chưa đủ bằng chứng để khẳng định quan hệ hậu duệ trực tiếp.',
  },
  {
    id: 'TT_003',
    costume: 'ao_tu_than',
    claim: 'Áo tứ thân là quốc phục / trang phục truyền thống của toàn bộ phụ nữ Việt Nam.',
    status: 'INCORRECT',
    evidence: 'Historical + regional/context evidence',
    time: '—',
    region_context: 'Không có cơ sở để áp dụng toàn quốc và mọi cộng đồng',
    ai_access: 'RED',
    ai_rule: 'Không dùng cách gọi này như fact. Phải giữ phạm vi vùng, cộng đồng và bối cảnh.',
  },
  {
    id: 'TT_004',
    costume: 'ao_tu_than',
    claim: 'Trong bối cảnh lao động nữ nông thôn đầu TK XX, nguồn hình ảnh cho thấy áo thường đi với màu tối/nâu, vạt được buộc/vắt, váy và một số phụ kiện như khăn mỏ quạ hoặc nón lá.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical Photograph + Historical Illustration',
    time: 'Đầu TK XX',
    region_context: 'Đồng bằng Bắc Bộ; lao động nữ nông thôn',
    ai_access: 'YELLOW',
    ai_rule: 'Đây là pattern theo nguồn, không phải checklist bắt buộc. Không ép ảnh phải có đồng thời khăn mỏ quạ và nón lá.',
  },
  {
    id: 'TT_005',
    costume: 'ao_tu_than',
    claim: '“Mớ ba mớ bảy” là kỹ thuật phối/layer nhiều lớp áo, gắn với một số bối cảnh lễ hội/Quan họ và không phải tên của một loại áo riêng.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Institutional Interpretation + Academic Research',
    time: 'Cuối TK XIX – giữa TK XX',
    region_context: 'Kinh Bắc và một số bối cảnh lễ hội/Quan họ; phạm vi xã hội theo nguồn',
    ai_access: 'GREEN',
    ai_rule: 'Giữ đúng nghĩa LAYERING_TECHNIQUE. Không biến “mớ ba mớ bảy” thành COSTUME_TYPE.',
  },
  {
    id: 'TT_006',
    costume: 'ao_tu_than',
    claim: 'Nón quai thao được ghi nhận trong một số bối cảnh lễ hội/Quan họ, nhưng không phải phụ kiện bắt buộc của mọi áo tứ thân.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical Photograph + Museum/Institutional evidence',
    time: 'TK XIX – giữa TK XX',
    region_context: 'Không phổ quát; nổi bật trong một số bối cảnh lễ hội/Quan họ và nhóm xã hội nhất định',
    ai_access: 'YELLOW',
    ai_rule: 'Không mặc định cho lao động hằng ngày. Khi dùng, phải gắn đúng bối cảnh/reference; không khẳng định “luôn luôn” hoặc “không bao giờ”.',
  },
  {
    id: 'TT_007',
    costume: 'ao_tu_than',
    claim: 'Dải bao có thể xuất hiện trong một số bối cảnh lễ hội/diễn xướng, nhưng không bắt buộc trong mọi hoàn cảnh.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical Photograph + Historical Illustration',
    time: 'Đầu TK XX và các nguồn liên quan',
    region_context: 'Không bắt buộc trong lao động; có thể xuất hiện ở lễ hội/diễn xướng/bối cảnh xã hội nhất định',
    ai_access: 'YELLOW',
    ai_rule: 'Không coi là thành phần bắt buộc. Chỉ thêm khi reference/context xác nhận.',
  },
  {
    id: 'TT_008',
    costume: 'ao_tu_than',
    claim: 'Không có hàng cúc cố định phía trước; tuy nhiên một số biến thể muộn có thể có chi tiết cài/khuy nhỏ.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Artifact + Academic Research',
    time: 'Chủ yếu TK XIX – giữa TK XX',
    region_context: 'Theo mẫu/biến thể cụ thể',
    ai_access: 'YELLOW',
    ai_rule: 'Cấm thêm một hàng cúc phía trước như mặc định. Nếu tham chiếu biến thể có khuy/cài, phải theo đúng reference; không suy thành quy chuẩn chung.',
  },
  {
    id: 'TT_009',
    costume: 'ao_tu_than',
    claim: '“Váy thâm” là thuật ngữ lịch sử gắn với váy màu tối; “váy đụp” là một thuật ngữ dân gian được dùng trong nghiên cứu/diễn giải, nhưng không phải tên duy nhất.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical / Institutional / Academic sources',
    time: 'TK XIX – đầu TK XX và các nguồn nghiên cứu liên quan',
    region_context: 'Bắc Bộ; phạm vi ngữ liệu theo nguồn',
    ai_access: 'YELLOW',
    ai_rule: 'Dùng như thông tin thuật ngữ, không biến thành ràng buộc thiết kế cứng.',
  },
  {
    id: 'TT_010',
    costume: 'ao_tu_than',
    claim: '“Váy sắn” mô tả hành động/trạng thái xắn hoặc kéo váy, không nên coi là một loại trang phục độc lập.',
    status: 'SUPPORTED_WITH_SCOPE',
    evidence: 'Historical / Linguistic interpretation',
    time: 'Theo ngữ cảnh nguồn',
    region_context: 'Bối cảnh sử dụng thuật ngữ cụ thể',
    ai_access: 'YELLOW',
    ai_rule: 'Không dùng “váy sắn” như một COSTUME_TYPE độc lập.',
  },
  {
    id: 'TT_011',
    costume: 'ao_tu_than',
    claim: '“Váy đổng” là thuật ngữ lịch sử chuẩn của hệ trang phục áo tứ thân.',
    status: 'UNVERIFIED',
    evidence: 'Cultural Interpretation / chưa đủ nguồn xác nhận',
    time: '—',
    region_context: 'Chưa xác lập được phạm vi và tư liệu đủ mạnh',
    ai_access: 'RED',
    ai_rule: 'Không trình bày như fact lịch sử. Không dùng để ép AI sinh chi tiết trang phục.',
  },
];

/**
 * Helper: Lấy toàn bộ claims cho một costumeId
 * Tự động lọc ra những costume chưa được research chính thức (như Nhật Bình)
 */
export function getCostumeHeritageClaims(costumeId: string): HeritageClaim[] {
  const meta = COSTUME_METAS.find((c) => c.id === costumeId);
  // Nếu costume chưa được nghiên cứu chính thức, không trả về claims làm source of truth
  if (meta?.heritageStatus === 'NOT_RESEARCHED') {
    return [];
  }
  return HERITAGE_CORE_DATABASE.filter((claim) => claim.costume === costumeId);
}

/**
 * Helper: Kiểm tra trạng thái nghiên cứu của costume
 */
export function isCostumeResearched(costumeId: string): boolean {
  const meta = COSTUME_METAS.find((c) => c.id === costumeId);
  return meta?.heritageStatus === 'OFFICIAL';
}
