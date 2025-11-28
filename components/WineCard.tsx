
import React, { useState, useEffect } from 'react';
import { Wine } from '../types';
import { formatCLP } from '../utils/formatters';
import { TrashIcon } from './icons';

interface WineCardProps {
  wine: Wine;
  onUpdate: (wine: Wine) => void;
  onDelete: (wineId: string) => void;
}

export const WineCard: React.FC<WineCardProps> = ({ wine, onUpdate, onDelete }) => {
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [price, setPrice] = useState(wine.precioAdquisicion || '');
    // Image source logic: prioritize URL, fallback to Base64
    const [imgSrc, setImgSrc] = useState(wine.imagenUrl || `data:image/jpeg;base64,${wine.imagenBase64}`);

    useEffect(() => {
        setPrice(wine.precioAdquisicion || '');
        setImgSrc(wine.imagenUrl || `data:image/jpeg;base64,${wine.imagenBase64}`);
    }, [wine.precioAdquisicion, wine.imagenUrl, wine.imagenBase64]);

    const handlePriceUpdate = () => {
        onUpdate({ ...wine, precioAdquisicion: price });
        setIsEditingPrice(false);
    };

    const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePriceUpdate();
        } else if (e.key === 'Escape') {
            setPrice(wine.precioAdquisicion || ''); 
            setIsEditingPrice(false);
        }
    };

    const increaseStock = () => onUpdate({ ...wine, stock: wine.stock + 1 });
    const decreaseStock = () => {
        if (wine.stock > 1) {
            onUpdate({ ...wine, stock: wine.stock - 1 });
        } else {
            onDelete(wine.id);
        }
    };
    
    const stockColor = wine.stock === 1 ? 'bg-red-500/20 text-red-300 border-red-500/30' : wine.stock <= 4 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

    return (
        <div className="group relative bg-slate-900/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(192,38,211,0.2)] flex flex-col">
            
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden bg-slate-950">
                 {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-fuchsia-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                
                <img 
                    src={imgSrc} 
                    onError={(e) => {
                        // If web image fails, fallback to original capture
                        e.currentTarget.src = `data:image/jpeg;base64,${wine.imagenBase64}`;
                    }}
                    alt={wine.nombre} 
                    className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute top-3 right-3 z-20">
                     <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${stockColor}`}>
                        {wine.anada}
                     </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                     <p className="text-xs font-medium text-fuchsia-300 mb-1 tracking-wide uppercase">{wine.bodega}</p>
                     <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-fuchsia-100 transition-colors" title={wine.nombre}>
                        {wine.nombre}
                     </h3>
                </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-3 text-sm flex-grow">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-500">Origen</span>
                    <span className="font-medium text-slate-200">{wine.pais}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-500">Variedad</span>
                    <span className="font-medium text-slate-200 truncate max-w-[150px] text-right" title={wine.tipoUva}>{wine.tipoUva}</span>
                </div>
                 <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-500">Ref. Web</span>
                    <span className="font-medium text-slate-400">{formatCLP(wine.precioReferencia)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                    <span className="text-fuchsia-400 font-medium">Precio Pagado</span>
                     {isEditingPrice ? (
                        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                            onBlur={handlePriceUpdate} onKeyDown={handlePriceKeyDown} autoFocus
                            className="w-24 bg-slate-800 border border-fuchsia-500 text-white text-right rounded px-2 py-0.5 text-sm outline-none"/>
                    ) : (
                        <span className="font-bold text-white cursor-pointer hover:text-fuchsia-300 transition-colors border-b border-dashed border-slate-600 hover:border-fuchsia-400" onClick={() => setIsEditingPrice(true)}>
                            {formatCLP(wine.precioAdquisicion)}
                        </span>
                    )}
                </div>
            </div>
            
            {/* Actions Footer */}
             <div className="px-4 py-3 bg-black/20 border-t border-white/5 flex justify-between items-center backdrop-blur-md">
                 <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-1 border border-white/5">
                    <button onClick={decreaseStock} className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors font-bold">-</button>
                    <span className="font-mono font-bold text-sm min-w-[1.5rem] text-center text-white">{wine.stock}</span>
                    <button onClick={increaseStock} className="w-7 h-7 flex items-center justify-center rounded bg-fuchsia-600 hover:bg-fuchsia-500 text-white transition-colors font-bold shadow-lg shadow-fuchsia-900/20">+</button>
                </div>
                <button 
                    onClick={() => onDelete(wine.id)} 
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" 
                    title="Eliminar"
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};
