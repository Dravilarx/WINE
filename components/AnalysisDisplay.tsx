import React, { useState } from 'react';
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

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const newWine: Wine = {
      ...analysis,
      id: new Date().toISOString() + Math.random(), // Simple unique ID
      // FIX: Corrected property assignment. The property on the `Wine` type is `imagenBase64`, and the value comes from the `imageBase64` prop.
      imagenBase64: imageBase64,
      stock: parseInt(stock, 10) || 1,
      precioAdquisicion,
    };
    onConfirm(newWine);
  };
  
  const renderField = (label: string, value: string | undefined) => (
    <div>
        <label className="block text-xs font-medium text-slate-400">{label}</label>
        <p className="mt-1 text-base text-white">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 p-6 animate-fade-in">
        <div className="space-y-4">
            {renderField('Nombre Vino', analysis.nombre)}
            {renderField('Bodega', analysis.bodega)}
            <div className="grid grid-cols-2 gap-4">
                {renderField('Añada', analysis.anada)}
                {renderField('País', analysis.pais)}
            </div>
             {renderField('Tipo de Uva', analysis.tipoUva)}
            <details className="text-sm">
                <summary className="cursor-pointer text-slate-400 hover:text-white">Notas de Cata</summary>
                <p className="mt-2 text-slate-300">{analysis.notasDeCata}</p>
            </details>
             {renderField('Precio de Referencia', formatCLP(analysis.precioReferencia))}
        </div>
        
        <hr className="my-6 border-slate-700" />

        <form onSubmit={handleConfirm} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="stock" className="block text-xs font-medium text-slate-400">Stock</label>
                    <input
                        type="number"
                        id="stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        min="1"
                        required
                        className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white p-2 text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="precioAdquisicion" className="block text-xs font-medium text-slate-400">Precio Adquisición</label>
                    <input
                        type="text"
                        id="precioAdquisicion"
                        value={precioAdquisicion}
                        onChange={(e) => setPrecioAdquisicion(e.target.value)}
                        placeholder="ej. 15000"
                        className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white p-2 text-sm"
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors text-sm font-semibold">
                    Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-md bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-90 font-semibold transition-opacity text-sm">
                    Añadir a la Cava
                </button>
            </div>
        </form>
    </div>
  );
};