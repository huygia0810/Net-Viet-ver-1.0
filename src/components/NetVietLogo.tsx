import React from 'react';

interface NetVietLogoProps {
  className?: string;
  showSubtitle?: boolean;
  withParchmentBadge?: boolean;
}

/**
 * Logo ngang chính thức của dự án NÉT VIỆT - Việt phục Remix
 * Theo đúng bảng đề xuất nhận diện thương hiệu:
 * - Biểu tượng chữ N cách điệu dải lụa truyền thống (xanh mực đậm #162432)
 * - Chấm đỏ son tiết chế (#AB3C2D) tựa vầng thái dương / ấn triện son
 * - Chữ "NÉT VIỆT" font Playfair Display cổ điển, chuẩn dấu tiếng Việt (sắc, nặng)
 * - Dòng "VIỆT PHỤC REMIX" font sans hình học hiện đại, khoảng cách giãn dòng chuẩn
 * - Nền kem ấm (#FAF7F2), đóng khung thẻ bài văn hóa hài hòa với thanh điều hướng tối.
 */
export const NetVietLogo: React.FC<NetVietLogoProps> = ({
  className = 'h-9 w-auto',
  showSubtitle = true,
  withParchmentBadge = true,
}) => {
  const content = (
    <svg
      viewBox="0 0 435 90"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Logo Nét Việt - Việt phục Remix"
    >
      {/* Biểu tượng chữ N vạt lụa */}
      <g id="silk-ribbon-n" transform="translate(14, 8)">
        {/* Chấm tròn đỏ son tiết chế */}
        <circle cx="85" cy="11" r="6.2" fill="#AB3C2D" />

        {/* Vạt lụa chính uốn lượn hình chữ N */}
        <path
          d="M 14 74 C 18 56 25 34 36 21 C 45 10 56 11 62 23 C 69 36 76 60 81 74 C 84 82 89 82 92 73 C 94 63 95 44 95 26"
          fill="none"
          stroke="#162432"
          strokeWidth="4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vạt lụa trong xếp nếp song song tựa tà áo */}
        <path
          d="M 23 76 C 27 58 33 39 42 27 C 47 19 54 20 59 31 C 64 43 68 64 73 75"
          fill="none"
          stroke="#162432"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vạt con buông nhẹ thanh thoát */}
        <path
          d="M 8 68 C 11 74 15 78 18 78"
          fill="none"
          stroke="#162432"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
      </g>

      {/* Typography thương hiệu */}
      <g transform="translate(132, 0)">
        {/* NÉT VIỆT */}
        <text
          x="0"
          y="49"
          fill="#162432"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="38"
          fontWeight="700"
          letterSpacing="0.03em"
        >
          NÉT VIỆT
        </text>

        {/* VIỆT PHỤC REMIX */}
        {showSubtitle && (
          <text
            x="2"
            y="74"
            fill="#162432"
            fontFamily="'Be Vietnam Pro', -apple-system, sans-serif"
            fontSize="12.5"
            fontWeight="600"
            letterSpacing="0.32em"
          >
            VIỆT PHỤC REMIX
          </text>
        )}
      </g>
    </svg>
  );

  if (!withParchmentBadge) {
    return content;
  }

  return (
    <div
      className="inline-flex items-center bg-[#FAF7F2] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#E2D7C3] shadow-sm hover:border-[#CCA037]/60 transition-colors select-none"
      title="NÉT VIỆT - Việt Phục Remix"
    >
      {content}
    </div>
  );
};
