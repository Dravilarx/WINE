import React, { useState, useMemo } from 'react';
import { Wine } from '../types';
import { WineCard } from './WineCard';
import { WineTable } from './WineTable';
import { GridIcon, TableIcon, ExportIcon, SortAscIcon, SortDescIcon, ChevronDownIcon, SearchIcon } from './icons';
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

  const { uniqueCountries, uniqueGrapes, totalBottles } = useMemo(() => {
    const countries = new Set<string>();
    const grapes = new Set<string>();
    let bottles = 0;
    wines.forEach(wine => {
      if (wine.pais) countries.add(wine.pais);
      if (wine.tipoUva) grapes.add(wine.tipoUva);
      bottles += wine.stock;
    });
    return { 
      uniqueCountries: Array.from(countries).sort(), 
      uniqueGrapes: Array.from(grapes).sort(),
      totalBottles: bottles
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
      <div className="text-center py-24 animate-fade-in-up">
        <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-6">
             <div className="w-16 h-16 opacity-30">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H6c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /></svg>
             </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Tu Cava está Vacía</h2>
        <p className="text-slate-400 max-w-md mx-auto">Aún no has añadido ningún vino. Ve a la pestaña "Escáner" para digitalizar tu primera botella.</p>
      </div>
    );
  }

  const sortOptions: { value: SortKey, label: string }[] = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'anada', label: 'Añada' },
    { value: 'pais', label: 'País' },
    { value: 'precioAdquisicion', label: 'Precio' },
    { value: 'stock', label: 'Stock' },
  ];
  
  const StatCard = ({ label, value, subtext }: { label: string, value: string, subtext?: string }) => (
      <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</span>
          <div className="text-2xl font-bold text-white">{value}</div>
          {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
      </div>
  );

  return (
    <div className="space-y-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Valor Total (Adq.)" value={formatCLP(cellarValue)} />
            <StatCard label="Total Botellas" value={totalBottles.toString()} />
            <StatCard label="Etiquetas Únicas" value={wines.length.toString()} />
            <StatCard label="Países" value={uniqueCountries.length.toString()} subtext={uniqueCountries.join(', ')} />
        </div>

        {/* Filters & Controls Toolbar */}
        <div className="p-5 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-xl space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-4 sticky top-20 z-30">
          
          {/* Search & Selects */}
          <div className="flex-1 flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar vino, bodega..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-950/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm transition-shadow" 
                />
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
                <div className="relative min-w-[140px]">
                    <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="appearance-none w-full bg-slate-800 border border-slate-700 text-slate-300 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm">
                        <option value="">País: Todos</option>
                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ChevronDownIcon className="w-4 h-4" />
                    </div>
                </div>

                <div className="relative min-w-[140px]">
                    <select value={grapeFilter} onChange={(e) => setGrapeFilter(e.target.value)} className="appearance-none w-full bg-slate-800 border border-slate-700 text-slate-300 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm">
                        <option value="">Uva: Todas</option>
                        {uniqueGrapes.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ChevronDownIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>
          </div>

          {/* View Actions */}
           <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t border-slate-800 lg:border-0">
                <div className="relative">
                    <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="appearance-none bg-slate-800 border border-slate-700 text-slate-300 py-2 pl-4 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-xs h-9">
                        {sortOptions.map(opt => <option key={opt.value} value={opt.value}>Ord: {opt.label}</option>)}
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ChevronDownIcon className="w-3 h-3" />
                    </div>
                </div>
                
                <button onClick={() => setSortDirection(p => p === 'asc' ? 'desc' : 'asc')} className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Cambiar Dirección">
                  {sortDirection === 'asc' ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />}
                </button>

                <div className="h-6 w-px bg-slate-700 mx-1"></div>

                <button onClick={handleExportCSV} className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-green-400 transition-colors" title="Exportar CSV">
                  <ExportIcon className="w-4 h-4" />
                </button>

                <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700 h-9 items-center">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} title="Grid">
                        <GridIcon className="w-4 h-4" />
                    </button>
                     <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} title="Table">
                        <TableIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {sortedAndFilteredWines.length === 0 && wines.length > 0 && (
            <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl"><p className="text-slate-500">Ningún vino coincide con los filtros seleccionados.</p></div>
        )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
          {sortedAndFilteredWines.map((wine) => (
            <WineCard key={wine.id} wine={wine} onUpdate={onUpdateWine} onDelete={onDeleteWine} />
          ))}
        </div>
      ) : (
        <div className="animate-fade-in-up">
             <WineTable wines={sortedAndFilteredWines} onUpdate={onUpdateWine} onDelete={onDeleteWine} />
        </div>
       
      )}
    </div>
  );
};