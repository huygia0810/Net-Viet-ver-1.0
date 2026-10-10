import React from 'react';
import { CostumeId } from '../types';

interface LookbookSilhouetteProps {
  costumeId: CostumeId;
  palette: { hex: string; name: string }[];
  remixLevel: number;
}

export const LookbookSilhouette: React.FC<LookbookSilhouetteProps> = ({
  costumeId,
  palette,
  remixLevel,
}) => {
  const primaryColor = palette[0]?.hex || '#1a1d24';
  const secondaryColor = palette[1]?.hex || '#b93828';
  const accentColor = palette[2]?.hex || '#d4af37';

  return (
    <div className="relative w-full aspect-4/5 max-h-[460px] bg-gradient-to-b from-[#13151b] to-[#0c0d10] border border-[#262a36] rounded-xl flex flex-col items-center justify-between p-6 overflow-hidden shadow-2xl">
      {/* Editorial Watermark */}
      <div className="absolute top-4 left-5 flex items-center gap-2">
        <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-medium uppercase">
          LOOKBOOK VISUAL CONCEPT
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
      </div>

      <div className="absolute top-4 right-5 text-[11px] tracking-wider text-neutral-400 font-mono">
        REMIX INTENSITY: {remixLevel === 1 ? '80/20 CỔ ĐIỂN' : remixLevel === 2 ? '50/50 CÂN BẰNG' : '20/80 PHÁ CÁCH'}
      </div>

      {/* SVG Silhouette Diagram */}
      <div className="relative w-full flex-1 flex items-center justify-center my-2">
        {costumeId === 'ao_ngu_than' && (
          <svg
            viewBox="0 0 240 320"
            className="w-full h-full max-h-[300px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background aura */}
            <circle cx="120" cy="140" r="100" fill={secondaryColor} fillOpacity="0.06" filter="blur(30px)" />

            {/* Inner Trousers (Quần 2 ống hiện đại) */}
            <path
              d="M85 200 L80 300 L110 300 L115 220 L125 220 L130 300 L160 300 L155 200 Z"
              fill="#181b22"
              stroke="#2e3544"
              strokeWidth="1.5"
            />
            {/* Inner piece (Tiểu phẩm thân con) */}
            <path
              d="M102 75 L138 75 L134 165 L106 165 Z"
              fill={secondaryColor}
              fillOpacity="0.35"
              stroke={secondaryColor}
              strokeDasharray="2 2"
            />

            {/* Main 5-panel robe body */}
            <path
              d="M75 90 L60 140 L78 145 L80 235 Q120 245 160 235 L162 145 L180 140 L165 90 L136 68 Q120 62 104 68 Z"
              fill={primaryColor}
              stroke="#3e4657"
              strokeWidth="2"
            />

            {/* Right-side closure curve (Hữu nhậm - Cài sang nách & sườn phải) */}
            <path
              d="M120 68 Q128 95 146 110 L154 135 L155 235"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 5 Traditional Buttons (Ngũ thường) */}
            <circle cx="121" cy="72" r="3" fill={accentColor} />
            <circle cx="127" cy="86" r="3" fill={accentColor} />
            <circle cx="138" cy="100" r="3" fill={accentColor} />
            <circle cx="147" cy="116" r="3" fill={accentColor} />
            <circle cx="154" cy="136" r="3" fill={accentColor} />

            {/* Standing Collar (Lập lĩnh) */}
            <path
              d="M106 68 C106 60 134 60 134 68 C134 72 106 72 106 68 Z"
              fill="#222733"
              stroke={accentColor}
              strokeWidth="2"
            />

            {/* Modern Sneakers / Chunky boots */}
            <rect x="74" y="295" width="38" height="12" rx="4" fill="#0d0e12" stroke="#4a5266" />
            <rect x="128" y="295" width="38" height="12" rx="4" fill="#0d0e12" stroke="#4a5266" />

            {/* Editorial lines & callouts */}
            <line x1="134" y1="65" x2="195" y2="45" stroke="#4b5563" strokeDasharray="2 2" />
            <text x="200" y="48" fill="#e5b94c" fontSize="8" fontFamily="sans-serif">
              Cổ Lập Lĩnh 3.5cm
            </text>

            <line x1="147" y1="116" x2="200" y2="116" stroke="#4b5563" strokeDasharray="2 2" />
            <text x="204" y="119" fill="#e5b94c" fontSize="8" fontFamily="sans-serif">
              Hữu Nhậm (5 khuy)
            </text>

            <line x1="80" y1="235" x2="30" y2="245" stroke="#4b5563" strokeDasharray="2 2" />
            <text x="10" y="258" fill="#9ca3af" fontSize="8" fontFamily="sans-serif">
              Tảo bạt vạt cong
            </text>
          </svg>
        )}

        {costumeId === 'ao_tu_than' && (
          <svg
            viewBox="0 0 240 320"
            className="w-full h-full max-h-[300px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background aura */}
            <circle cx="120" cy="140" r="100" fill={secondaryColor} fillOpacity="0.08" filter="blur(30px)" />

            {/* Váy đụp lụa đen / Maxi skirt */}
            <path
              d="M86 160 L50 300 L190 300 L154 160 Z"
              fill="#121318"
              stroke="#2e3544"
              strokeWidth="1.5"
            />

            {/* Yếm đào / Yếm denim bên trong */}
            <path
              d="M105 76 Q120 70 135 76 L144 140 Q120 152 96 140 Z"
              fill={secondaryColor}
              stroke={accentColor}
              strokeWidth="1.5"
            />
            {/* Dây yếm quàng cổ */}
            <path d="M108 76 Q120 62 132 76" stroke={accentColor} strokeWidth="1.5" />

            {/* Thắt lưng dải lụa ruột tượng */}
            <rect x="92" y="140" width="56" height="12" fill="#2d5236" rx="2" />
            <path d="M110 152 L105 200 L115 195 Z" fill="#2d5236" />
            <path d="M125 152 L130 205 L120 200 Z" fill={secondaryColor} />

            {/* Áo tứ thân 4 vạt mở hai bên */}
            {/* Vạt trái */}
            <path
              d="M78 88 L55 140 L70 145 L74 270 L95 270 L100 145 L94 88 Z"
              fill={primaryColor}
              fillOpacity="0.85"
              stroke="#3e4657"
              strokeWidth="2"
            />
            {/* Vạt phải */}
            <path
              d="M162 88 L185 140 L170 145 L166 270 L145 270 L140 145 L146 88 Z"
              fill={primaryColor}
              fillOpacity="0.85"
              stroke="#3e4657"
              strokeWidth="2"
            />

            {/* Callouts */}
            <line x1="120" y1="100" x2="195" y2="85" stroke="#4b5563" strokeDasharray="2 2" />
            <text x="200" y="88" fill="#e5b94c" fontSize="8" fontFamily="sans-serif">
              Yếm lót che ngực
            </text>

            <line x1="140" y1="150" x2="200" y2="150" stroke="#4b5563" strokeDasharray="2 2" />
            <text x="204" y="153" fill="#60a5fa" fontSize="8" fontFamily="sans-serif">
              Thắt lưng ruột tượng
            </text>

            <line x1="74" y1="240" x2="25" y2="240" stroke="#4b5563" strokeDasharray="2 2" />
            <text x="5" y="243" fill="#9ca3af" fontSize="8" fontFamily="sans-serif">
              4 Vạt áo buông rời
            </text>
          </svg>
        )}

        {costumeId === 'ao_nhat_binh' && (
          <svg
            viewBox="0 0 240 320"
            className="w-full h-full max-h-[300px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background aura */}
            <circle cx="120" cy="140" r="100" fill={secondaryColor} fillOpacity="0.1" filter="blur(30px)" />

            {/* Outer Robe Body */}
            <path
              d="M70 95 L50 145 L72 150 L75 255 L165 255 L168 150 L190 145 L170 95 L140 70 L100 70 Z"
              fill={primaryColor}
              stroke="#3e4657"
              strokeWidth="2"
            />

            {/* Signature Rectangular Collar (Cổ chữ nhật Nhật Bình) */}
            <rect
              x="96"
              y="70"
              width="48"
              height="80"
              fill="#181c26"
              stroke={accentColor}
              strokeWidth="3"
              rx="2"
            />
            {/* Inner Embroidery Motif Simulation */}
            <rect x="102" y="76" width="36" height="68" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="120" cy="110" r="6" fill={accentColor} />

            {/* Ngũ Sắc Cổ Tay (Kim Mộc Thủy Hỏa Thổ) */}
            {/* Left sleeve bands */}
            <g transform="translate(48, 136)">
              <rect x="0" y="0" width="24" height="2.5" fill="#2563eb" />
              <rect x="0" y="2.5" width="24" height="2.5" fill="#dc2626" />
              <rect x="0" y="5" width="24" height="2.5" fill="#f8fafc" />
              <rect x="0" y="7.5" width="24" height="2.5" fill="#eab308" />
              <rect x="0" y="10" width="24" height="2.5" fill="#0f172a" />
            </g>

            {/* Right sleeve bands */}
            <g transform="translate(168, 136)">
              <rect x="0" y="0" width="24" height="2.5" fill="#2563eb" />
              <rect x="0" y="2.5" width="24" height="2.5" fill="#dc2626" />
              <rect x="0" y="5" width="24" height="2.5" fill="#f8fafc" />
              <rect x="0" y="7.5" width="24" height="2.5" fill="#eab308" />
              <rect x="0" y="10" width="24" height="2.5" fill="#0f172a" />
            </g>

            {/* Callouts */}
            <line x1="144" y1="100" x2="200" y2="85" stroke="#4b5563" strokeDasharray="2 2" />
            <text x="204" y="88" fill="#e5b94c" fontSize="8" fontFamily="sans-serif">
              Cổ Chữ Nhật Nhật Bình
            </text>

            <line x1="190" y1="142" x2="200" y2="160" stroke="#4b5563" strokeDasharray="2 2" />
            <text x="204" y="163" fill="#60a5fa" fontSize="8" fontFamily="sans-serif">
              Dải Ngũ Sắc Ngũ Hành
            </text>
          </svg>
        )}
      </div>

      {/* Palette Color Bar */}
      <div className="w-full flex items-center justify-between pt-3 border-t border-[#262a36]">
        <div className="flex items-center gap-2">
          {palette.map((color, idx) => (
            <div key={idx} className="group relative">
              <div
                className="w-5 h-5 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-125"
                style={{ backgroundColor: color.hex }}
              />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap bg-black text-[10px] text-white px-1.5 py-0.5 rounded shadow">
                {color.name} ({color.hex})
              </span>
            </div>
          ))}
        </div>
        <span className="text-[11px] text-neutral-400 font-mono tracking-wider">
          AI ARENA VIETNAM 2026
        </span>
      </div>
    </div>
  );
};
