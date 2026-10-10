import React, { useState } from 'react';
import { Occasion, StyleVibe, StylingPreferences, CostumeId } from '../types';
import { Sparkles, Sliders, Palette, Shirt, MessageSquare, Zap, Loader2, Lock, AlertTriangle } from 'lucide-react';
import { COSTUME_METAS } from '../data/heritageCore';

interface PreferenceFormProps {
  costumeId: CostumeId;
  onSubmit: (preferences: StylingPreferences) => void;
  isLoading: boolean;
}

const OCCASIONS: { id: Occasion; label: string; desc: string }[] = [
  { id: 'streetwear_daily', label: 'Dạo Phố / Streetwear', desc: 'Năng động, di chuyển linh hoạt trong đô thị' },
  { id: 'fashion_week', label: 'Fashion Week / Runway', desc: 'Kịch tính, nổi bật, đường cắt sắc sảo' },
  { id: 'music_festival', label: 'Music Festival / Rave', desc: 'Phóng khoáng, nổi loạn, kết hợp ánh sáng' },
  { id: 'smart_casual', label: 'Smart Casual / Công Sở', desc: 'Thanh lịch, chuẩn mực, giao tiếp chuyên nghiệp' },
  { id: 'art_gallery', label: 'Triển Lãm & Art Space', desc: 'Ý niệm, tinh tế, đậm tính thẩm mỹ' },
  { id: 'tet_contemporary', label: 'Tết & Lễ Hội Đương Đại', desc: 'Không khí hỷ sự, ấm áp nhưng hiện đại' },
];

const STYLE_VIBES: { id: StyleVibe; label: string; desc: string }[] = [
  { id: 'cyber_indochine', label: 'Cyber Indochine 2026', desc: 'Giao thoa công nghệ vị lai và hoa văn Đông Dương' },
  { id: 'minimalist_zen', label: 'Minimalist Zen (Tối Giản)', desc: 'Mộc mạc, đường nét thuần khiết, chất liệu tự nhiên' },
  { id: 'streetwear_grunge', label: 'Streetwear Deconstructed', desc: 'Giải cấu trúc, túi hộp cargo, layered phóng khoáng' },
  { id: 'editorial_avantgarde', label: 'Editorial Avant-Garde', desc: 'Hình khối ấn tượng, chuẩn mực thời trang cao cấp' },
  { id: 'y2k_vietnam', label: 'Y2K Retro Nostalgia', desc: 'Cảm hứng thập niên 2000 tươi trẻ, cá tính' },
];

const COLOR_OPTIONS = [
  { name: 'Đen Sơn Mài', hex: '#121418' },
  { name: 'Đỏ Chu Sa', hex: '#A8282B' },
  { name: 'Vàng Kim', hex: '#D4AF37' },
  { name: 'Xanh Thanh Thiên', hex: '#1E3A8A' },
  { name: 'Trắng Ngọc', hex: '#F3F4F6' },
  { name: 'Nâu Củ Nâu', hex: '#634735' },
  { name: 'Xanh Lá Mạ', hex: '#4D7C0F' },
];

const MATERIAL_OPTIONS = [
  'Lụa Tơ Tằm',
  'Linen Đũi Mộc',
  'Denim Tái Chế',
  'Vải Dù Kỹ Thuật (Tech)',
  'Gấm Jacquard',
  'Cotton Hữu Cơ',
  'Chi Tiết Kim Loại/Bạc',
];

const PROMPT_SUGGESTIONS = [
  'Phối đi xem ca nhạc indie ngoài trời buổi tối ở TP.HCM, thoáng mát năng động.',
  'Phong cách tối giản cho triển lãm mỹ thuật Hà Nội mùa thu, ưu tiên màu đất.',
  'Lookbook thời trang phong cách Cyberpunk 2026, kết hợp sneakers hầm hố.',
  'Đi làm sáng tạo tại agency, thanh lịch nhưng không bị gò bó trang trọng.',
];

export const PreferenceForm: React.FC<PreferenceFormProps> = ({
  costumeId,
  onSubmit,
  isLoading,
}) => {
  const [gender, setGender] = useState<'unisex' | 'female' | 'male'>('unisex');
  const [occasion, setOccasion] = useState<Occasion>('streetwear_daily');
  const [styleVibe, setStyleVibe] = useState<StyleVibe>('cyber_indochine');
  const [remixLevel, setRemixLevel] = useState<number>(2);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Đen Sơn Mài', 'Đỏ Chu Sa']);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['Lụa Tơ Tằm', 'Vải Dù Kỹ Thuật (Tech)']);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const toggleColor = (name: string) => {
    if (selectedColors.includes(name)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter((c) => c !== name));
      }
    } else {
      setSelectedColors([...selectedColors, name]);
    }
  };

  const toggleMaterial = (mat: string) => {
    if (selectedMaterials.includes(mat)) {
      if (selectedMaterials.length > 1) {
        setSelectedMaterials(selectedMaterials.filter((m) => m !== mat));
      }
    } else {
      setSelectedMaterials([...selectedMaterials, mat]);
    }
  };

  const handleApplySuggestion = (text: string) => {
    setCustomPrompt(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      costumeId,
      gender,
      occasion,
      styleVibe,
      remixLevel,
      selectedColors,
      selectedMaterials,
      customPrompt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-[#12141c] border border-[#232734] rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
          BƯỚC 02 · ĐỊNH HÌNH PHONG CÁCH
        </span>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
          Thiết Lập Sở Thích & Mức Độ Remix
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Tùy chỉnh bối cảnh và tỷ lệ giao thoa giữa di sản và thời trang đương đại.
        </p>
      </div>

      {/* Gender / Form selector */}
      <div className="mb-8">
        <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">
          Đối Tượng Phục Trang
        </label>
        <div className="inline-flex p-1 bg-[#181b24] rounded-xl border border-[#2b3040]">
          {(['unisex', 'female', 'male'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`px-5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                gender === g
                  ? 'bg-gradient-to-r from-[#b93828] to-[#96261a] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {g === 'unisex' ? 'Unisex (Phi Giới Tính)' : g === 'female' ? 'Nữ Giới' : 'Nam Giới'}
            </button>
          ))}
        </div>
      </div>

      {/* Occasion Selection */}
      <div className="mb-8">
        <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">
          Dịp Mặc (Occasion)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OCCASIONS.map((occ) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => setOccasion(occ.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                occasion === occ.id
                  ? 'bg-[#1e2330] border-[#d4af37] ring-1 ring-[#d4af37]/30 text-white'
                  : 'bg-[#161822] border-[#252936] text-neutral-300 hover:border-[#383f52] hover:bg-[#1a1d29]'
              }`}
            >
              <div className="font-semibold text-xs text-white">{occ.label}</div>
              <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{occ.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style Vibe Selection */}
      <div className="mb-8">
        <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">
          Gu Thẩm Mỹ Cá Nhân (Aesthetic Vibe)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STYLE_VIBES.map((vibe) => (
            <button
              key={vibe.id}
              type="button"
              onClick={() => setStyleVibe(vibe.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                styleVibe === vibe.id
                  ? 'bg-[#1e2330] border-[#d4af37] ring-1 ring-[#d4af37]/30 text-white'
                  : 'bg-[#161822] border-[#252936] text-neutral-300 hover:border-[#383f52] hover:bg-[#1a1d29]'
              }`}
            >
              <div className="font-semibold text-xs text-white">{vibe.label}</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">{vibe.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Modern Remix Slider */}
      <div className="mb-8 p-5 bg-[#171a24] rounded-2xl border border-[#272d3d]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs uppercase tracking-wider text-white font-semibold">
              Mức Độ Hiện Đại Hóa (Modern Remix Ratio)
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[#d4af37]">
            {remixLevel === 1
              ? 'Mức 1: Bảo Tồn 80% / Hiện Đại 20%'
              : remixLevel === 2
              ? 'Mức 2: Cân Bằng 50% / Hiện Đại 50%'
              : 'Mức 3: Phá Cách 20% / Hiện Đại 80%'}
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={1}
          value={remixLevel}
          onChange={(e) => setRemixLevel(Number(e.target.value))}
          className="w-full accent-[#d4af37] h-2 bg-[#262c3c] rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-neutral-400 mt-2 font-mono">
          <span>Tôn kính cổ điển (Gần nguyên bản)</span>
          <span>Cân bằng giao thoa (Được khuyến nghị)</span>
          <span>Phá cách vị lai (Gen Z Runway)</span>
        </div>
      </div>

      {/* Colors & Materials Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Colors */}
        <div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">
            <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Tone Màu Chủ Đạo</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => {
              const active = selectedColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleColor(c.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all border cursor-pointer ${
                    active
                      ? 'bg-[#222736] border-[#d4af37] text-white shadow-sm'
                      : 'bg-[#161822] border-[#292f3f] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Materials */}
        <div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">
            <Shirt className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Chất Liệu Ưu Tiên</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MATERIAL_OPTIONS.map((m) => {
              const active = selectedMaterials.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMaterial(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border cursor-pointer ${
                    active
                      ? 'bg-[#222736] border-[#d4af37] text-white shadow-sm'
                      : 'bg-[#161822] border-[#292f3f] text-neutral-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Freeform Prompt & Suggestions */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Yêu Cầu Tự Do Cho AI Stylist (Tùy Chọn)</span>
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Nhập bất kỳ ý tưởng hoặc hoàn cảnh đặc biệt nào (ví dụ: Em muốn phối đi concert Gen Z ở phố đi bộ Nguyễn Huệ, trời nóng nhưng vẫn sang)..."
          rows={3}
          className="w-full bg-[#161822] border border-[#2b3040] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl p-3.5 text-xs text-white placeholder-neutral-500 transition-colors"
        />

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold mr-1">
            Gợi ý nhanh:
          </span>
          {PROMPT_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySuggestion(sug)}
              className="text-[11px] text-neutral-400 hover:text-white bg-[#191d28] hover:bg-[#222738] border border-[#2c3344] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              {sug.slice(0, 38)}...
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      {(() => {
        const meta = COSTUME_METAS.find((c) => c.id === costumeId);
        const isNotResearched = meta?.heritageStatus === 'NOT_RESEARCHED';

        if (isNotResearched) {
          return (
            <div className="pt-4 border-t border-[#232734] space-y-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200 leading-relaxed">
                  <strong className="text-white block mb-0.5">Trang phục đang ở trạng thái NOT_RESEARCHED</strong>
                  Dòng trang phục này chưa có bộ dữ liệu Heritage Core chính thức được phê duyệt qua quy trình human-review. Để bảo toàn nguyên tắc liêm chính lịch sử, hệ thống <strong>vô hiệu hóa hoàn toàn tính năng tạo outfit remix</strong> cho đến khi cơ sở dữ liệu được hoàn thiện.
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={true}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-neutral-400 bg-neutral-800/80 border border-neutral-700 flex items-center justify-center gap-2.5 opacity-60 cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <span>Chưa Mở Tạo Outfit (NOT_RESEARCHED)</span>
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="pt-4 border-t border-[#232734] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>
                Bảo chứng tự động bởi <strong className="text-emerald-300">Heritage Guard</strong> trước khi hiển thị.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#b93828] via-[#a32b1e] to-[#801e12] hover:from-[#cb4030] hover:to-[#932316] shadow-xl shadow-[#b93828]/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang Tham Chiếu Heritage Core & Khởi Tạo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Tạo Outfit Remix Với Gemini</span>
                </>
              )}
            </button>
          </div>
        );
      })()}
    </form>
  );
};
