import React, { useState, useEffect, useMemo } from 'react';
import { ScannerView } from './components/ScannerView';
import { CellarView } from './components/CellarView';
import { Wine } from './types';
import { CameraIcon, WineIcon } from './components/icons';

type View = 'scanner' | 'cellar';

function App() {
  const [view, setView] = useState<View>('scanner');
  const [wines, setWines] = useState<Wine[]>([]);

  useEffect(() => {
    try {
      const storedWines = localStorage.getItem('wineCellar');
      if (storedWines) {
        setWines(JSON.parse(storedWines));
      }
    } catch (error) {
      console.error("Failed to load wines from local storage:", error);
      localStorage.removeItem('wineCellar');
    }
  }, []);

  const updateWines = (newWines: Wine[]) => {
    setWines(newWines);
    try {
      localStorage.setItem('wineCellar', JSON.stringify(newWines));
    } catch (error) {
      console.error("Failed to save wines to local storage:", error);
    }
  };

  const addWine = (wine: Wine) => {
    // Check for duplicates (same name and vintage)
    const existingWineIndex = wines.findIndex(w => w.nombre.toLowerCase() === wine.nombre.toLowerCase() && w.anada === wine.anada);

    if (existingWineIndex !== -1) {
      // Wine exists, update stock
      const updatedWines = [...wines];
      updatedWines[existingWineIndex].stock += wine.stock;
      updateWines(updatedWines);
    } else {
      // New wine, add to cellar
      updateWines([wine, ...wines]);
    }
    setView('cellar');
  };
  
  const deleteWine = (wineId: string) => {
    if(window.confirm('Are you sure you want to delete this wine and all its stock?')) {
      const updatedWines = wines.filter(wine => wine.id !== wineId);
      updateWines(updatedWines);
    }
  };

  const updateWine = (updatedWine: Wine) => {
    const updatedWines = wines.map(wine => wine.id === updatedWine.id ? updatedWine : wine);
    updateWines(updatedWines);
  };

  const cellarValue = useMemo(() => {
    return wines.reduce((total, wine) => {
        const price = parseInt(String(wine.precioAdquisicion || '0').replace(/[^0-9]/g, ''), 10);
        return total + (price * wine.stock);
    }, 0);
  }, [wines]);


  return (
    <div className="min-h-screen text-white">
      <header className="bg-slate-950/30 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-fuchsia-500 to-purple-500 text-transparent bg-clip-text">
            Marcelo's Wine
          </h1>
          <nav className="flex items-center gap-2 p-1 rounded-full bg-slate-800/50">
            <button
              onClick={() => setView('scanner')}
              className={`relative px-4 py-2 rounded-full transition-colors flex items-center gap-2 text-sm md:text-base ${view === 'scanner' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {view === 'scanner' && <span className="absolute inset-0 bg-purple-600 rounded-full -z-10 shadow-lg shadow-purple-600/30"></span>}
              <CameraIcon className="w-5 h-5" />
              Escaner
            </button>
            <button
              onClick={() => setView('cellar')}
              className={`relative px-4 py-2 rounded-full transition-colors flex items-center gap-2 text-sm md:text-base ${view === 'cellar' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
               {view === 'cellar' && <span className="absolute inset-0 bg-purple-600 rounded-full -z-10 shadow-lg shadow-purple-600/30"></span>}
               <WineIcon className="w-5 h-5" />
              Mi Cava <span className="bg-fuchsia-500/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{wines.length}</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {view === 'scanner' && <ScannerView onWineAdded={addWine} />}
        {view === 'cellar' && <CellarView wines={wines} onUpdateWine={updateWine} onDeleteWine={deleteWine} cellarValue={cellarValue} />}
      </main>
    </div>
  );
}

export default App;