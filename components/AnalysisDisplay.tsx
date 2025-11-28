
import React, { useState, useEffect } from 'react';
import { AnalyzedWineData } from '../services/geminiService';
import { Wine } from '../types';
import { formatCLP } from '../utils/formatters';

interface AnalysisDisplayProps {
  analysis: AnalyzedWineData;
  imageBase64: string;
  onConfirm: (wine: Wine) => void;
  onCancel: () => void;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, imageBase64, onConfirm, onCancel }) => {
  const [stock, setStock] = useState('1');
  const [precioAdquisicion, setPrecioAdquisicion] = useState('');
  
  // Logic to handle image preference
  const [useWebImage, setUseWebImage] = useState(!!analysis.imagenUrl);
  const [imgSrc, setImgSrc] = useState<string>(
      analysis.imagenUrl || `data:image/jpeg;base64,${imageBase64}`
  );

  useEffect(() => {
      if (useWebImage && analysis.imagenUrl) {
          setImgSrc(analysis.imagenUrl);
      } else {
          setImgSrc(`data:image/jpeg;base64,${imageBase64}`);
      }
  }, [useWebImage, analysis.imagenUrl, imageBase64]);

  const handleImageError = () => {
      // Fallback to original image if web URL fails
      setUseWebImage(false);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const newWine: Wine = {
      ...analysis,
      id: new Date().toISOString() + Math.random(), 
      imagenBase64: imageBase64, // Always keep original as backup
      imagenUrl: useWebImage ? analysis.imagenUrl : undefined, // Save URL only if user selected it (and it works)
      stock: parseInt(stock, 10) || 1,
      precioAdquisicion,
    };
    onConfirm(newWine);
  };
  
  const renderField = (label: string, value: string | undefined, className: string = "") => (
    <div className={`p-3 rounded-lg bg-white/5 border border-white/5 ${className}`}>
        <label className="block text-xs font-medium text-purple-200/70 uppercase tracking-wider mb-1">{label}</label>
        <p className="text-base font-medium text-white leading-snug">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="glass-panel rounded-2xl p-6 animate-fade-in-up shadow-2xl">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Detalles del Vino</h3>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold border border-green-500/30">Análisis Completado</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Image Preview Section */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg group">
                     <img 
                        src={imgSrc} 
                        onError={handleImageError}
                        alt="Vista previa vino" 
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                     <div className="absolute bottom-2 left-2 right-2 text-center text-xs text-slate-300 bg-black/50 backdrop-blur rounded py-1">
                         {useWebImage ? 'Imagen Web (Sugerida)' : 'Tu Foto Original'}
                     </div>
                </div>
                
                {analysis.imagenUrl && (
                    <button 
                        type="button"
                        onClick={() => setUseWebImage(!useWebImage)}
                        className="text-xs py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {useWebImage ? 'Usar foto original' : 'Usar imagen web'}
                    </button>
                )}
            </div>

            {/* Data Fields Section */}
            <div className="w-full md:w-2/3 space-y-3">
                {renderField('Nombre Vino', analysis.nombre, "bg-gradient-to-r from-purple-900/20 to-transparent")}
                {renderField('Bodega', analysis.bodega)}
                <div className="grid grid-cols-2 gap-3">
                    {renderField('Añada', analysis.anada)}
                    {renderField('País', analysis.pais)}
                </div>
                {renderField('Tipo de Uva', analysis.tipoUva)}
                
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <label className="block text-xs font-medium text-purple-200/70 uppercase tracking-wider mb-2">Notas de Cata</label>
                    <p className="text-sm text-slate-300 italic leading-relaxed">"{analysis.notasDeCata}"</p>
                </div>
                
                {renderField('Precio de Referencia Web', formatCLP(analysis.precioReferencia), "border-fuchsia-500/20 bg-fuchsia-500/5")}
            </div>
        </div>
        
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

        <form onSubmit={handleConfirm} className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="stock" className="block text-xs font-semibold text-slate-300 mb-1.5">Cantidad (Botellas)</label>
                    <input
                        type="number"
                        id="stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        min="1"
                        required
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl text-white p-3 text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all outline-none text-center font-mono font-bold"
                    />
                </div>
                <div>
                    <label htmlFor="precioAdquisicion" className="block text-xs font-semibold text-slate-300 mb-1.5">Tu Precio de Compra</label>
                    <input
                        type="text"
                        id="precioAdquisicion"
                        value={precioAdquisicion}
                        onChange={(e) => setPrecioAdquisicion(e.target.value)}
                        placeholder="$0"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl text-white p-3 text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all outline-none text-center"
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                    Descartar
                </button>
                <button type="submit" className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-fuchsia-900/40 hover:shadow-fuchsia-900/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                    Guardar en Cava
                </button>
            </div>
        </form>
    </div>
  );
};
