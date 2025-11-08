import React, { useState, useCallback } from 'react';
import {
  AsmrIcon, CinematicIcon, EducationalIcon, HardSellingIcon, ModernIcon, NaturalIcon, ProblemSolutionIcon,
  SoftSellingIcon, StorytellingIcon, TechIcon, TestimonialIcon, UnboxingIcon, UploadIcon, VibeIcon, ImageIcon
} from './components/icons';
import CreativeOptionButton from './components/CreativeOptionButton';
import { CreativeOption, StoryboardScene } from './types';
import { generateFullStoryboard } from './services/geminiService';

const vibeOptions: CreativeOption[] = [
  { id: 'energetic', label: 'Energetic & Fun', icon: <VibeIcon /> },
  { id: 'cinematic', label: 'Cinematic & Epic', icon: <CinematicIcon /> },
  { id: 'modern', label: 'Modern & Clean', icon: <ModernIcon /> },
  { id: 'natural', label: 'Natural & Organic', icon: <NaturalIcon /> },
  { id: 'tech', label: 'Tech & Futuristic', icon: <TechIcon /> },
];

const lightingOptions: CreativeOption[] = [
  { id: 'studio', label: 'Studio Light', icon: <span className="text-sm">💡</span> },
  { id: 'dramatic', label: 'Dramatic', icon: <span className="text-sm">🎭</span> },
  { id: 'natural', label: 'Natural Light', icon: <span className="text-sm">☀️</span> },
  { id: 'neon', label: 'Neon', icon: <span className="text-sm">🔮</span> },
];

const contentTypeOptions: CreativeOption[] = [
  { id: 'hard-selling', label: 'Hard Selling', icon: <HardSellingIcon /> },
  { id: 'soft-selling', label: 'Soft Selling', icon: <SoftSellingIcon /> },
  { id: 'storytelling', label: 'Storytelling', icon: <StorytellingIcon /> },
  { id: 'problem-solution', label: 'Problem/Solution', icon: <ProblemSolutionIcon /> },
  { id: 'asmr', label: 'ASMR / Sensory', icon: <AsmrIcon /> },
  { id: 'unboxing', label: 'Unboxing', icon: <UnboxingIcon /> },
  { id: 'educational', label: 'Educational', icon: <EducationalIcon /> },
  { id: 'testimonial', label: 'Testimonial', icon: <TestimonialIcon /> },
];


const App: React.FC = () => {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState<string>('');
  const [selectedVibe, setSelectedVibe] = useState<string>('energetic');
  const [selectedLighting, setSelectedLighting] = useState<string>('studio');
  const [selectedContentType, setSelectedContentType] = useState<string>('hard-selling');
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProductImage(file);
      setProductImageUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!productImage || !productDescription) {
      setError('Silakan unggah gambar produk dan berikan deskripsi.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setStoryboard([]);

    try {
      const vibeLabel = vibeOptions.find(o => o.id === selectedVibe)?.label || '';
      const lightingLabel = lightingOptions.find(o => o.id === selectedLighting)?.label || '';
      const contentTypeLabel = contentTypeOptions.find(o => o.id === selectedContentType)?.label || '';
      
      await generateFullStoryboard(
        productImage,
        productDescription,
        vibeLabel,
        lightingLabel,
        contentTypeLabel,
        (newScene) => {
          setStoryboard(prev => [...prev, newScene].sort((a, b) => a.scene - b.scene));
        }
      );
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
      setStoryboard([]); // Clear partial results on error
    } finally {
      setIsLoading(false);
    }
  }, [productImage, productDescription, selectedVibe, selectedLighting, selectedContentType]);
  
  const Section: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-brand-text-primary mb-4">
        {number}. {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight">Iklan Produk AI</h1>
          <p className="text-brand-text-secondary mt-2">Buat storyboard iklan video 6-scene dari satu gambar produk.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-2 bg-brand-surface rounded-xl p-6 h-fit">
            <Section number={1} title="Unggah Produk">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-brand-border rounded-lg p-6 flex flex-col items-center justify-center h-48 hover:border-brand-yellow transition-colors">
                  {productImageUrl ? (
                    <img src={productImageUrl} alt="Product preview" className="max-h-full max-w-full object-contain rounded-md" />
                  ) : (
                    <>
                      <UploadIcon />
                      <p className="mt-2 text-sm text-brand-text-secondary">Klik untuk unggah</p>
                    </>
                  )}
                </div>
              </label>
              <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </Section>

            <Section number={2} title="Deskripsi Produk">
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={4}
                className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-sm focus:ring-brand-yellow focus:border-brand-yellow transition"
                placeholder="Contoh: Kemeja flanel lengan panjang, bahan katun premium, cocok untuk gaya kasual."
              />
            </Section>

            <Section number={3} title="Arah Kreatif">
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-brand-text-secondary mb-3">Vibe</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {vibeOptions.map(option => (
                      <CreativeOptionButton key={option.id} {...option} isSelected={selectedVibe === option.id} onClick={() => setSelectedVibe(option.id)} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-brand-text-secondary mb-3">Pencahayaan</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {lightingOptions.map(option => (
                      <CreativeOptionButton key={option.id} {...option} isSelected={selectedLighting === option.id} onClick={() => setSelectedLighting(option.id)} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-brand-text-secondary mb-3">Tipe Konten</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {contentTypeOptions.map(option => (
                      <CreativeOptionButton key={option.id} {...option} isSelected={selectedContentType === option.id} onClick={() => setSelectedContentType(option.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-brand-yellow text-brand-bg font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isLoading ? 'Generating...' : 'Generate Konsep Iklan'}
            </button>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3 bg-brand-surface rounded-xl p-6 flex flex-col">
            <h2 className="text-xl font-bold text-brand-text-primary mb-4">Hasil Storyboard</h2>
            <div className="flex-grow bg-brand-bg rounded-lg p-4">
              {isLoading && storyboard.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary">
                      <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <p>Membuat storyboard Anda...</p>
                      <p className="text-sm mt-1">Proses ini mungkin perlu beberapa saat.</p>
                  </div>
              ) : storyboard.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full h-full overflow-y-auto">
                  {storyboard.map((scene, index) => (
                    <div key={index} className="bg-brand-surface rounded-lg overflow-hidden flex flex-col">
                      <div className="aspect-square bg-black flex items-center justify-center">
                        <img src={scene.image} alt={`Scene ${scene.scene}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 text-xs flex-grow flex flex-col justify-between">
                        <div>
                          <p className="text-brand-text-secondary leading-relaxed mb-2">{scene.description}</p>
                          <div className="mb-2">
                            <p className="font-semibold text-brand-text-primary">VO:</p>
                            <p className="text-brand-text-secondary leading-relaxed italic">"{scene.voiceOver}"</p>
                          </div>
                          <div>
                            <p className="font-semibold text-brand-text-primary">🎵 Backsound:</p>
                            <p className="text-brand-text-secondary leading-relaxed">{scene.backsound}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && Array.from({ length: Math.max(0, 6 - storyboard.length) }).map((_, i) => (
                      <div key={`skel-${i}`} className="bg-brand-surface rounded-lg overflow-hidden flex flex-col aspect-square animate-pulse">
                        <div className="w-full h-full bg-brand-border flex items-center justify-center">
                            <svg className="animate-spin h-8 w-8 text-brand-text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary">
                  <ImageIcon />
                  <p className="mt-2">Hasil iklan Anda akan muncul di sini.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;