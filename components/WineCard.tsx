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

    useEffect(() => {
        setPrice(wine.precioAdquisicion || '');
    }, [wine.precioAdquisicion]);

    const handlePriceUpdate = () => {
        onUpdate({ ...wine, precioAdquisicion: price });
        setIsEditingPrice(false);
    };

    const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePriceUpdate();
        } else if (e.key === 'Escape') {
            setPrice(wine.precioAdquisicion || ''); // Revert
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
    
    const stockColor = wine.stock === 1 ? 'text-red-400' : wine.stock <= 4 ? 'text-yellow-400' : 'text-white';

    return (
        <div className="group relative bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700 transition-all duration-300 hover:border-purple-500/50">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative">
                <img src={`data:image/jpeg;base64,${wine.imagenBase64}`} alt={wine.nombre} className="w-full h-40 object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                     <h3 className="text-lg font-bold text-white truncate" title={wine.nombre}>{wine.nombre}</h3>
                    <p className="text-sm text-slate-300">{wine.bodega}</p>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs">
                     <span className="font-bold bg-slate-900/50 text-white px-2 py-1 rounded">{wine.anada}</span>
                </div>
            </div>

            <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">País:</span>
                    <span className="font-semibold text-white">{wine.pais}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Uva:</span>
                    <span className="font-semibold text-white truncate">{wine.tipoUva}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400">P. Referencia:</span>
                    <span className="font-semibold text-white">{formatCLP(wine.precioReferencia)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">P. Adquisición:</span>
                     {isEditingPrice ? (
                        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                            onBlur={handlePriceUpdate} onKeyDown={handlePriceKeyDown} autoFocus
                            className="w-24 bg-slate-900/80 border border-purple-500 text-white text-right rounded p-1 text-sm"/>
                    ) : (
                        <span className="font-semibold text-white cursor-pointer" onClick={() => setIsEditingPrice(true)}>
                            {formatCLP(wine.precioAdquisicion)}
                        </span>
                    )}
                </div>
            </div>
             <div className="p-2 bg-slate-900/50 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <button onClick={decreaseStock} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">-</button>
                    <span className={`font-bold text-lg w-8 text-center ${stockColor}`}>{wine.stock}</span>
                    <button onClick={increaseStock} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">+</button>
                </div>
                <button onClick={() => onDelete(wine.id)} className="text-slate-500 hover:text-red-500 transition-colors p-1" title="Delete Wine">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};