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
    const existingWineIndex = wines.findIndex(w => w.nombre.toLowerCase() === wine.nombre.toLowerCase() && w.anada === wine.anada);

    if (existingWineIndex !== -1) {
      const updatedWines = [...wines];
      updatedWines[existingWineIndex].stock += wine.stock;
      updateWines(updatedWines);
    } else {
      updateWines([wine, ...wines]);
    }
    setView('cellar');
  };
  
  const deleteWine = (wineId: string) => {
    if(window.confirm('¿Estás seguro de que deseas eliminar este vino y todo su stock?')) {
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
    <div className="min-h-screen relative overflow-hidden bg-slate-950 font-sans">
      {/* Decorative Background - Enhanced */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/10 blur-[150px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[150px] mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-purple-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform duration-300 border border-white/10">
               <WineIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white group-hover:text-fuchsia-100 transition-colors">
              Marcelo's <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">Wine</span>
            </h1>
          </div>
          
          <nav className="flex items-center p-1.5 rounded-2xl bg-slate-900/80 border border-white/5 shadow-inner backdrop-blur-md">
            <button
              onClick={() => setView('scanner')}
              className={`relative px-5 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm md:text-base font-bold tracking-wide ${
                view === 'scanner' 
                  ? 'text-white shadow-md shadow-purple-900/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {view === 'scanner' && (
                <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-xl -z-10 animate-fade-in-up"></span>
              )}
              <CameraIcon className="w-4 h-4 md:w-5 md:h-5" />
              Escáner
            </button>
            <button
              onClick={() => setView('cellar')}
              className={`relative px-5 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm md:text-base font-bold tracking-wide ${
                view === 'cellar' 
                  ? 'text-white shadow-md shadow-purple-900/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
               {view === 'cellar' && (
                 <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-xl -z-10 animate-fade-in-up"></span>
               )}
               <WineIcon className="w-4 h-4 md:w-5 md:h-5" />
              Mi Cava 
              {wines.length > 0 && (
                <span className={`ml-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${view === 'cellar' ? 'bg-white text-fuchsia-700' : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'}`}>
                  {wines.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 lg:p-12 animate-fade-in-up">
        {view === 'scanner' && <ScannerView onWineAdded={addWine} />}
        {view === 'cellar' && <CellarView wines={wines} onUpdateWine={updateWine} onDeleteWine={deleteWine} cellarValue={cellarValue} />}
      </main>
    </div>
  );
}

export default App;