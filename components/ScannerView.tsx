import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
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


  const handleImageSelect = (file: File) => {
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
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="w-full p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold mb-1 text-white">Subir Imagen</h2>
            <p className="text-slate-400 mb-6 text-sm">Arrastra o selecciona una foto de la etiqueta del vino.</p>
            <ImageUploader 
                onImageSelect={handleImageSelect} 
                imagePreview={imagePreview}
                onClearImage={handleClearImage}
            />

            {imageFile && !analysis && (
                <div className="mt-6 text-center">
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner className="w-5 h-5 mr-2" />
                                Analizando...
                            </>
                        ) : 'Analizar Vino'}
                    </button>
                </div>
            )}
        </div>
        
        <div className="w-full">
             <h2 className="text-xl font-bold mb-1 text-white">Resultado del Análisis</h2>
             <p className="text-slate-400 mb-6 text-sm">La información del vino aparecerá aquí.</p>
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {!analysis && !error && !isLoading && (
                 <div className="h-64 flex items-center justify-center bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 text-slate-500">
                    <p>El análisis de la etiqueta aparecerá aquí.</p>
                 </div>
            )}

            {isLoading && (
                 <div className="h-64 flex items-center justify-center bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 text-slate-500">
                    <LoadingSpinner className="w-8 h-8" />
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