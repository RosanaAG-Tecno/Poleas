import React, { useState, useMemo } from 'react';
import { PulleyState, SystemMode } from './types';
import { calculatePhysics } from './utils/physicsUtils';
import { PulleyVisualizer } from './components/PulleyVisualizer';
import { Knob } from './components/Knob';
import { AnalysisPanel } from './components/AnalysisPanel';

const App: React.FC = () => {
  // --- STATE ---
  const [mode, setMode] = useState<SystemMode>(SystemMode.FRICTION);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const [pulleyState, setPulleyState] = useState<PulleyState>({
    driverDiameter: 100,
    drivenDiameter: 200,
    inputRpm: 120,
    inputPower: 500, // Watts
    centerDistance: 300
  });

  // --- DERIVED STATE (PHYSICS) ---
  const stats = useMemo(() => calculatePhysics(pulleyState, mode), [pulleyState, mode]);

  // --- HANDLERS ---
  const handleUpdate = (key: keyof PulleyState, value: number) => {
    setPulleyState(prev => ({ ...prev, [key]: value }));
  };

  const toggleMode = (newMode: SystemMode) => {
    setMode(newMode);
    // Adjust distance automatically when switching modes for better UX
    if (newMode === SystemMode.FRICTION) {
        // Distance is irrelevant physically, but visually we want them touching
        // The visualizer handles the touching logic, we just keep the state clean
    } else if (newMode === SystemMode.BELT && pulleyState.centerDistance < (pulleyState.driverDiameter + pulleyState.drivenDiameter)) {
        // Ensure some gap
        handleUpdate('centerDistance', (pulleyState.driverDiameter + pulleyState.drivenDiameter));
    }
  };

  return (
    <div className="min-h-screen bg-engineering-900 text-slate-200 p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-700 pb-4 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Mechanic<span className="text-engineering-accent">Sim</span>
          </h1>
          <p className="text-slate-400 mt-1">Simulación Interactiva y Análisis de Sistemas de Transmisión</p>
        </div>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
           <button 
             onClick={() => toggleMode(SystemMode.FRICTION)}
             className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === SystemMode.FRICTION ? 'bg-engineering-warning text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}
           >
             Ruedas de Fricción
           </button>
           <button 
             onClick={() => toggleMode(SystemMode.BELT)}
             className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === SystemMode.BELT ? 'bg-engineering-accent text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}
           >
             Transmisión por Correa
           </button>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: VISUALIZER & CONTROLS (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* VISUALIZER */}
          <div className="h-[400px] md:h-[500px] w-full bg-slate-800 rounded-xl relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                 <button 
                   onClick={() => setIsPlaying(!isPlaying)}
                   className="bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur border border-slate-600 transition-colors"
                   title={isPlaying ? "Pausar" : "Reproducir"}
                 >
                   {isPlaying ? (
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 01-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 001-1V8a1 1 0 00-1-1h-2z" clipRule="evenodd" /></svg>
                   ) : (
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                   )}
                 </button>
            </div>
            <PulleyVisualizer 
                state={pulleyState} 
                mode={mode} 
                isPlaying={isPlaying} 
            />
          </div>

          {/* CONTROLS */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
             <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-engineering-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Parámetros del Sistema
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                
                {/* Driver Settings */}
                <div className="space-y-4 border-r border-slate-700/50 pr-4">
                    <h4 className="text-engineering-warning text-xs font-bold uppercase tracking-widest mb-2">Polea Motriz (Entrada)</h4>
                    <Knob 
                        label="Diámetro (D1)" 
                        value={pulleyState.driverDiameter} 
                        min={50} max={400} step={10} unit="mm" 
                        onChange={(v) => handleUpdate('driverDiameter', v)} 
                        color="text-engineering-warning"
                    />
                     <Knob 
                        label="Velocidad Entrada (N1)" 
                        value={pulleyState.inputRpm} 
                        min={0} max={3000} step={50} unit="RPM" 
                        onChange={(v) => handleUpdate('inputRpm', v)} 
                        color="text-engineering-warning"
                    />
                     <Knob 
                        label="Potencia Entrada" 
                        value={pulleyState.inputPower} 
                        min={100} max={5000} step={100} unit="W" 
                        onChange={(v) => handleUpdate('inputPower', v)} 
                        color="text-engineering-warning"
                    />
                </div>

                {/* Driven Settings */}
                <div className="space-y-4 md:border-r border-slate-700/50 md:pr-4">
                    <h4 className="text-engineering-accent text-xs font-bold uppercase tracking-widest mb-2">Polea Conducida (Salida)</h4>
                    <Knob 
                        label="Diámetro (D2)" 
                        value={pulleyState.drivenDiameter} 
                        min={50} max={400} step={10} unit="mm" 
                        onChange={(v) => handleUpdate('drivenDiameter', v)} 
                        color="text-engineering-accent"
                    />
                </div>

                {/* Config Settings */}
                <div className="space-y-4">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Configuración</h4>
                    {mode === SystemMode.BELT ? (
                        <Knob 
                            label="Distancia entre Centros" 
                            value={pulleyState.centerDistance} 
                            min={Math.ceil((pulleyState.driverDiameter + pulleyState.drivenDiameter)/2) + 10} 
                            max={800} step={10} unit="mm" 
                            onChange={(v) => handleUpdate('centerDistance', v)} 
                            color="text-slate-300"
                        />
                    ) : (
                        <div className="p-4 bg-slate-900 rounded border border-slate-700 text-sm text-slate-500 italic">
                            La distancia es fija en el modo de fricción (las poleas deben tocarse).
                        </div>
                    )}
                </div>

             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ANALYTICS (4 cols) */}
        <div className="lg:col-span-4 h-full">
            <AnalysisPanel stats={stats} state={pulleyState} mode={mode} />
        </div>

      </main>
    </div>
  );
};

export default App;