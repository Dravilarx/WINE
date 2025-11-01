import React, { useState, useMemo } from 'react';
import { Wine } from '../types';
import { WineCard } from './WineCard';
import { WineTable } from './WineTable';
import { GridIcon, TableIcon, ExportIcon, SortAscIcon, SortDescIcon } from './icons';
import { formatCLP } from '../utils/formatters';

type ViewMode = 'grid' | 'table';
type SortKey = 'nombre' | 'anada' | 'pais' | 'precioAdquisicion' | 'stock';
type SortDirection = 'asc' | 'desc';

interface CellarViewProps {
  wines: Wine[];
  onUpdateWine: (wine: Wine) => void;
  onDeleteWine: (wineId: string) => void;
  cellarValue: number;
}

export const CellarView: React.FC<CellarViewProps> = ({ wines, onUpdateWine, onDeleteWine, cellarValue }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [grapeFilter, setGrapeFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { uniqueCountries, uniqueGrapes } = useMemo(() => {
    const countries = new Set<string>();
    const grapes = new Set<string>();
    wines.forEach(wine => {
      if (wine.pais) countries.add(wine.pais);
      if (wine.tipoUva) grapes.add(wine.tipoUva);
    });
    return { 
      uniqueCountries: Array.from(countries).sort(), 
      uniqueGrapes: Array.from(grapes).sort() 
    };
  }, [wines]);

  const sortedAndFilteredWines = useMemo(() => {
    const filtered = wines.filter(wine => {
      const searchMatch = searchQuery.toLowerCase() === '' ||
        wine.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wine.bodega.toLowerCase().includes(searchQuery.toLowerCase());
      const countryMatch = countryFilter === '' || wine.pais === countryFilter;
      const grapeMatch = grapeFilter === '' || wine.tipoUva === grapeFilter;
      return searchMatch && countryMatch && grapeMatch;
    });

    return filtered.sort((a, b) => {
      let valA: string | number = a[sortKey] || '';
      let valB: string | number = b[sortKey] || '';

      if (sortKey === 'precioAdquisicion') {
        valA = parseInt(String(valA).replace(/[^0-9]/g, ''), 10) || 0;
        valB = parseInt(String(valB).replace(/[^0-9]/g, ''), 10) || 0;
      } else if (sortKey === 'stock' || sortKey === 'anada') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [wines, searchQuery, countryFilter, grapeFilter, sortKey, sortDirection]);

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Bodega', 'Añada', 'País', 'Tipo de Uva', 'Stock', 'Precio Adquisición', 'Precio Referencia', 'Notas de Cata'];
    const rows = sortedAndFilteredWines.map(wine => [
      `"${wine.nombre}"`, `"${wine.bodega}"`, wine.anada, `"${wine.pais}"`, `"${wine.tipoUva}"`,
      wine.stock, formatCLP(wine.precioAdquisicion), formatCLP(wine.precioReferencia), `"${(wine.notasDeCata || '').replace(/"/g, '""')}"`
    ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `marcelos_wine_export_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (wines.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-slate-400">Tu Cava está Vacía</h2>
        <p className="text-slate-500 mt-4">Comienza escaneando una etiqueta para añadir tu primera botella.</p>
      </div>
    );
  }

  const sortOptions: { value: SortKey, label: string }[] = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'anada', label: 'Añada' },
    { value: 'pais', label: 'País' },
    { value: 'precioAdquisicion', label: 'Precio Adq.' },
    { value: 'stock', label: 'Stock' },
  ];

  return (
    <div>
        <div className="mb-6 p-4 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" placeholder="Buscar por nombre o bodega..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border-slate-700 rounded-md py-2 px-4 text-white focus:ring-purple-500 focus:border-purple-500 placeholder:text-slate-500" />
            
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full bg-slate-900/50 border-slate-700 rounded-md py-2 px-4 text-white focus:ring-purple-500 focus:border-purple-500">
              <option value="">Todos los Países</option>
              {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={grapeFilter} onChange={(e) => setGrapeFilter(e.target.value)} className="w-full bg-slate-900/50 border-slate-700 rounded-md py-2 px-4 text-white focus:ring-purple-500 focus:border-purple-500">
              <option value="">Todas las Uvas</option>
              {uniqueGrapes.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
             <div className="flex items-center gap-2">
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="w-full bg-slate-900/50 border-slate-700 rounded-md py-2 px-4 text-white focus:ring-purple-500 focus:border-purple-500">
                  {sortOptions.map(opt => <option key={opt.value} value={opt.value}>Ordenar por {opt.label}</option>)}
                </select>
                <button onClick={() => setSortDirection(p => p === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors" title="Cambiar Dirección">
                  {sortDirection === 'asc' ? <SortAscIcon className="w-5 h-5" /> : <SortDescIcon className="w-5 h-5" />}
                </button>
             </div>
          </div>
           <div className="mt-4 pt-4 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="text-sm">
                <span className="text-slate-400">Valor Total (Adq.): </span>
                <span className="font-bold text-lg text-white">{formatCLP(cellarValue)}</span>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={handleExportCSV} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm" title="Exportar como CSV">
                  <ExportIcon className="w-5 h-5" /> Exportar CSV
                </button>
                <div className="p-1 bg-slate-700 rounded-md flex">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600' : ''}`} title="Vista de Tarjetas">
                        <GridIcon className="w-5 h-5" />
                    </button>
                     <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-purple-600' : ''}`} title="Vista de Tabla">
                        <TableIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {sortedAndFilteredWines.length === 0 && wines.length > 0 && (
            <div className="text-center py-10"><p className="text-slate-500">Ningún vino coincide con los filtros seleccionados.</p></div>
        )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedAndFilteredWines.map((wine) => (
            <WineCard key={wine.id} wine={wine} onUpdate={onUpdateWine} onDelete={onDeleteWine} />
          ))}
        </div>
      ) : (
        <WineTable wines={sortedAndFilteredWines} onUpdate={onUpdateWine} onDelete={onDeleteWine} />
      )}
    </div>
  );
};