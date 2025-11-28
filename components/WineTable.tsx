
import React, { useState, useEffect } from 'react';
import { Wine } from '../types';
import { formatCLP } from '../utils/formatters';
import { TrashIcon, SortAscIcon, SortDescIcon } from './icons';

interface WineTableProps {
  wines: Wine[];
  onUpdate: (wine: Wine) => void;
  onDelete: (wineId: string) => void;
}

const EditableCell: React.FC<{ wine: Wine; field: 'stock' | 'precioAdquisicion'; onUpdate: (wine: Wine) => void; }> = ({ wine, field, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(String(wine[field] || ''));

    useEffect(() => {
        setValue(String(wine[field] || ''));
    }, [wine, field]);

    const handleUpdate = () => {
        const updatedWine = { ...wine, [field]: field === 'stock' ? (parseInt(value, 10) || 0) : value };
        if (field === 'stock' && updatedWine.stock <= 0) {
            onUpdate({ ...updatedWine, stock: 0});
        } else {
            onUpdate(updatedWine);
        }
        setIsEditing(false);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleUpdate();
        else if (e.key === 'Escape') {
            setValue(String(wine[field] || ''));
            setIsEditing(false);
        }
    }

    if (isEditing) {
        return <input type="text" value={value} onChange={e => setValue(e.target.value)}
                      onBlur={handleUpdate} onKeyDown={handleKeyDown} autoFocus
                      className="w-24 bg-slate-900/80 border border-purple-500 text-white text-right rounded p-1 text-sm"/>;
    }

    return <span onClick={() => setIsEditing(true)} className="cursor-pointer">
        {field === 'stock' ? wine.stock : formatCLP(wine.precioAdquisicion)}
    </span>;
};


const StockIndicator: React.FC<{ stock: number }> = ({ stock }) => {
    const stockColor = stock === 1 ? 'text-red-400' : stock <= 4 ? 'text-yellow-400' : 'text-white';
    const barColor = stock === 1 ? 'bg-red-500' : stock <= 4 ? 'bg-yellow-500' : 'bg-green-500';
    const widthPercentage = Math.min((stock / 12) * 100, 100); // Max visual is a case of 12

    return (
        <div className="flex items-center justify-end gap-2">
            <span className={`font-bold ${stockColor}`}>{stock}</span>
            <div className="w-12 h-2 bg-slate-700 rounded-full">
                <div className={barColor} style={{ width: `${widthPercentage}%`, height: '100%', borderRadius: 'inherit' }}></div>
            </div>
        </div>
    )
}

export const WineTable: React.FC<WineTableProps> = ({ wines, onUpdate, onDelete }) => {
    return (
        <div className="overflow-x-auto bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700">
            <table className="min-w-full text-sm text-slate-300">
                <thead className="bg-slate-900/50">
                    <tr>
                        {['Vino', 'Bodega', 'Añada', 'País', 'Uva', 'P. Ref.', 'P. Adq.', 'Stock', ''].map(header => (
                            <th key={header} className="p-3 text-left font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {wines.map(wine => (
                        <tr key={wine.id} className="hover:bg-slate-800 transition-colors">
                            <td className="p-3 font-medium text-white flex items-center gap-3">
                                <img 
                                    src={wine.imagenUrl || `data:image/jpeg;base64,${wine.imagenBase64}`} 
                                    onError={(e) => { e.currentTarget.src = `data:image/jpeg;base64,${wine.imagenBase64}`; }}
                                    alt={wine.nombre} 
                                    className="w-10 h-10 object-contain rounded bg-white/5"
                                />
                                {wine.nombre}
                            </td>
                            <td className="p-3">{wine.bodega}</td>
                            <td className="p-3 text-center">{wine.anada}</td>
                            <td className="p-3">{wine.pais}</td>
                            <td className="p-3">{wine.tipoUva}</td>
                            <td className="p-3">{formatCLP(wine.precioReferencia)}</td>
                            <td className="p-3 text-right"><EditableCell wine={wine} field="precioAdquisicion" onUpdate={onUpdate} /></td>
                            <td className="p-3 text-right"><StockIndicator stock={wine.stock} /></td>
                            <td className="p-3 text-center">
                                <button onClick={() => onDelete(wine.id)} className="text-slate-500 hover:text-red-500 transition-colors p-1" title="Delete Wine">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
