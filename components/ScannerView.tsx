import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { CameraCapture } from './CameraCapture';
import { AnalysisDisplay } from './AnalysisDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { analyzeWineLabel, AnalyzedWineData } from '../services/geminiService';
import { Wine } from '../types';

interface ScannerViewProps {
  onWineAdded: (wine: Wine) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onWineAdded }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzedWineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);


  const handleImageSelect = (file: File) => {
    setIsCameraActive(false);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
    setAnalysis(null);
    setError(null);
  };
  
  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    setImageBase64('');
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeWineLabel(imageFile);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during analysis.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmWine = (wine: Wine) => {
      onWineAdded(wine);
      handleClearImage();
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input */}
        <div className="w-full space-y-6">
            <div className="glass-panel p-1 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative bg-slate-950/80 backdrop-blur-xl p-8 rounded-[22px]">
                    {!isCameraActive && (
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Escanear Etiqueta</h2>
                            <p className="text-slate-400">Identifica tu vino al instante usando Inteligencia Artificial.</p>
                        </div>
                    )}
                    
                    {isCameraActive ? (
                        <CameraCapture 
                            onCapture={handleImageSelect}
                            onClose={() => setIsCameraActive(false)}
                        />
                    ) : (
                        <ImageUploader 
                            onImageSelect={handleImageSelect} 
                            imagePreview={imagePreview}
                            onClearImage={handleClearImage}
                            onOpenCamera={() => setIsCameraActive(true)}
                        />
                    )}

                    {imageFile && !analysis && !isCameraActive && (
                        <div className="mt-8 animate-fade-in-up">
                            <button
                                onClick={handleAnalyzeClick}
                                disabled={isLoading}
                                className="w-full relative overflow-hidden bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-purple-900/50 group/btn"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner className="w-5 h-5 mr-3" />
                                        <span className="animate-pulse">Analizando con Gemini AI...</span>
                                    </>
                                ) : (
                                    <>
                                       <span className="relative z-10 flex items-center gap-2">
                                           Analizar Etiqueta
                                            <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                       </span>
                                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Right Column: Output */}
        <div className="w-full">
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-6 py-5 rounded-2xl mb-6 backdrop-blur-md animate-fade-in-up flex items-center gap-4 shadow-lg shadow-red-900/10" role="alert">
                     <div className="p-2 bg-red-500/20 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                    <div>
                        <strong className="font-bold block text-red-100">Error de Análisis</strong>
                        <span className="text-sm opacity-90">{error}</span>
                    </div>
                </div>
            )}
            
            {!analysis && !error && !isLoading && (
                 <div className="h-[450px] flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-2 border-slate-700/50 text-slate-500 p-8 text-center transition-colors hover:border-slate-600/50 hover:bg-slate-800/30">
                    <div className="w-24 h-24 bg-gradient-to-tr from-slate-800 to-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Esperando resultado</h3>
                    <p className="text-slate-400 max-w-xs leading-relaxed">Sube una imagen o toma una foto para ver los detalles mágicamente aquí.</p>
                 </div>
            )}

            {isLoading && (
                 <div className="h-[450px] flex flex-col items-center justify-center glass-panel rounded-3xl border border-slate-700/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-fuchsia-900/5 animate-pulse"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-20 animate-ping"></div>
                            <LoadingSpinner className="w-16 h-16 text-fuchsia-400 mb-6 relative z-10" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Analizando Etiqueta</h3>
                        <p className="text-slate-400 font-medium">Consultando al Sommelier Digital...</p>
                    </div>
                 </div>
            )}
            
            {analysis && imageBase64 && (
                <AnalysisDisplay 
                    analysis={analysis} 
                    imageBase64={imageBase64}
                    onConfirm={handleConfirmWine}
                    onCancel={handleClearImage}
                />
            )}
        </div>

    </div>
  );
};