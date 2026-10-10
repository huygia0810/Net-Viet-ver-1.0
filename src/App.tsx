import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CostumeSelector } from './components/CostumeSelector';
import { PreferenceForm } from './components/PreferenceForm';
import { ResultDisplay } from './components/ResultDisplay';
import { HeritageGuardSimulator } from './components/HeritageGuardSimulator';
import { HeritageCoreKnowledgeBase } from './components/HeritageCoreKnowledgeBase';
import { COSTUME_METAS, HERITAGE_CORE_DATABASE } from './data/heritageCore';
import { getSampleOutfit } from './data/mockOutfits';
import { CostumeId, CostumeMeta, OutfitResult, StylingPreferences } from './types';
import { Sparkles, Shield, Compass, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [costumes, setCostumes] = useState<CostumeMeta[]>(COSTUME_METAS);
  const [selectedCostumeId, setSelectedCostumeId] = useState<CostumeId>('ao_ngu_than');
  const [currentOutfit, setCurrentOutfit] = useState<OutfitResult | null>(null);
  const [generationError, setGenerationError] = useState<{ code?: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHeritageCoreOpen, setIsHeritageCoreOpen] = useState<boolean>(false);
  const [isStressTestOpen, setIsStressTestOpen] = useState<boolean>(false);
  const [peekCostumeId, setPeekCostumeId] = useState<CostumeId | undefined>(undefined);

  const studioRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load costume metadata from server if available
  useEffect(() => {
    fetch('/api/costumes')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.costumes) {
          setCostumes(data.costumes);
        }
      })
      .catch(() => {
        // Local database is already in place as graceful fallback
      });
  }, []);

  const handleSelectCostume = (id: CostumeId) => {
    setSelectedCostumeId(id);
    // Reset outfit and error when switching costume to avoid stale result under a different costume
    setCurrentOutfit(null);
    setGenerationError(null);
  };

  const handleGenerateOutfit = async (preferences: StylingPreferences) => {
    // Front-end block for NOT_RESEARCHED
    const meta = costumes.find((c) => c.id === preferences.costumeId);
    if (!meta || meta.heritageStatus === 'NOT_RESEARCHED') {
      setGenerationError({
        code: 'NOT_RESEARCHED',
        message: `Dòng trang phục '${meta?.name || preferences.costumeId}' chưa có Heritage Core chính thức được phê duyệt. Hệ thống từ chối tạo outfit để bảo đảm tính chính xác lịch sử.`,
      });
      setCurrentOutfit(null);
      return;
    }

    setIsLoading(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/remix-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const data: OutfitResult = await response.json();
        setCurrentOutfit(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        setCurrentOutfit(null);
        setGenerationError({
          code: errData.code || `HTTP_${response.status}`,
          message: errData.error || 'Không thể tạo outfit từ máy chủ. Vui lòng thử lại.',
        });
      }
    } catch (err) {
      setCurrentOutfit(null);
      setGenerationError({
        code: 'NETWORK_ERROR',
        message: 'Lỗi kết nối máy chủ. Không thể liên lạc với dịch vụ Stylist và Heritage Guard.',
      });
    } finally {
      setIsLoading(false);
      // Smooth scroll to result section
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleScrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePeekClaims = (id: CostumeId) => {
    setPeekCostumeId(id);
    setIsHeritageCoreOpen(true);
  };

  const currentCostumeMeta = costumes.find((c) => c.id === selectedCostumeId);

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f2efe9] flex flex-col font-sans selection:bg-[#9e3a2b] selection:text-white">
      {/* Global Navigation Header */}
      <Header
        onOpenHeritageCore={() => {
          setPeekCostumeId(undefined);
          setIsHeritageCoreOpen(true);
        }}
        onOpenStressTest={() => setIsStressTestOpen(true)}
        onScrollToStudio={handleScrollToStudio}
      />

      {/* Hero Section */}
      <HeroSection
        onStartStyling={handleScrollToStudio}
        onExploreHeritageCore={() => {
          setPeekCostumeId(undefined);
          setIsHeritageCoreOpen(true);
        }}
      />

      {/* Main Interactive Studio */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 w-full">
        {/* Step 1: Costume Selection */}
        <section ref={studioRef} className="scroll-mt-24">
          <CostumeSelector
            costumes={costumes}
            selectedCostumeId={selectedCostumeId}
            onSelectCostume={handleSelectCostume}
            onPeekCostumeClaims={handlePeekClaims}
          />
        </section>

        {/* Step 2: Preference Studio Form */}
        <section className="scroll-mt-24">
          <PreferenceForm
            costumeId={selectedCostumeId}
            onSubmit={handleGenerateOutfit}
            isLoading={isLoading}
          />
        </section>

        {/* Step 3: Result Display & Lookbook Board */}
        <section ref={resultRef} className="scroll-mt-24">
          <ResultDisplay
            outfit={currentOutfit}
            costumeMeta={currentCostumeMeta}
            error={generationError}
            onStressTestTrigger={() => setIsStressTestOpen(true)}
            onModifyPreferences={handleScrollToStudio}
          />
        </section>
      </main>

      {/* Interactive Heritage Core Knowledge Base Modal */}
      <HeritageCoreKnowledgeBase
        isOpen={isHeritageCoreOpen}
        onClose={() => setIsHeritageCoreOpen(false)}
        defaultCostumeId={peekCostumeId}
      />

      {/* Interactive Heritage Guard Stress-Test Modal */}
      <HeritageGuardSimulator
        isOpen={isStressTestOpen}
        onClose={() => setIsStressTestOpen(false)}
        costumeId={selectedCostumeId}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-[#1e222e] bg-[#090a0d] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-base font-bold text-white">NÉT VIỆT</span>
            <span className="text-neutral-600">·</span>
            <span>Việt Phục Remix</span>
            <span className="text-neutral-600">·</span>
            <span className="italic text-[#d4af37]">“Mặc hiện đại, nhưng hiểu mình đang mặc gì.”</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>AI ARENA: VIET NAM 2026</span>
            <span className="text-neutral-700">|</span>
            <span>POWERED BY GEMINI & HERITAGE GUARD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
