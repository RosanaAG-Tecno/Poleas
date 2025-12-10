import React, { useState, useMemo } from 'react';
import { CalculatedStats, PulleyState, SystemMode } from '../types';
import { analyzeSystemWithGemini } from '../services/geminiService';
import { formatNumber, generateGraphData, getRealWorldApplications } from '../utils/physicsUtils';
import { SimpleChart } from './SimpleChart';

interface Props {
  stats: CalculatedStats;
  state: PulleyState;
  mode: SystemMode;
}

export const AnalysisPanel: React.FC<Props> = ({ stats, state, mode }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate data for charts
  const graphData = useMemo(() => generateGraphData(state), [state]);
  // Get real world examples
  const examples = useMemo(() => getRealWorldApplications(stats.ratio), [stats.ratio]);

  const handleAIAnalysis = async () => {
    setLoading(true);
    const result = await analyzeSystemWithGemini(state, stats, mode);
    setAnalysis(result);
    setLoading(false);
  };

  const StatItem = ({ label, value, unit, highlight = false, colorClass = "" }: { label: string, value: string, unit: string, highlight?: boolean, colorClass?: string }) => (
    <div className={`p-3 rounded-lg border ${highlight ? 'bg-slate-800 border-engineering-accent' : 'bg-slate-900 border-slate-700'}`}>
      <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-mono text-xl font-bold ${colorClass ? colorClass : (highlight ? 'text-engineering-accent' : 'text-slate-200')}`}>
        {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 h-full flex flex-col overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-engineering-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Métricas del Sistema
      </h2>

      {/* INPUT SECTION */}
      <h3 className="text-engineering-warning text-xs font-bold uppercase tracking-widest mb-3 border-b border-slate-700 pb-1">Entrada (Motriz)</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatItem label="Velocidad Entrada" value={formatNumber(state.inputRpm)} unit="RPM" colorClass="text-engineering-warning" />
        <StatItem label="Potencia Entrada" value={formatNumber(state.inputPower)} unit="W" colorClass="text-engineering-warning" />
        <StatItem label="Par (Torque)" value={formatNumber(stats.inputTorque)} unit="Nm" colorClass="text-engineering-warning" />
        <StatItem label="Diámetro" value={formatNumber(state.driverDiameter)} unit="mm" colorClass="text-engineering-warning" />
      </div>

      {/* OUTPUT SECTION */}
      <h3 className="text-engineering-accent text-xs font-bold uppercase tracking-widest mb-3 border-b border-slate-700 pb-1">Salida (Conducida)</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatItem label="Velocidad Salida" value={formatNumber(stats.outputRpm)} unit="RPM" colorClass="text-engineering-accent" />
        <StatItem label="Par (Torque)" value={formatNumber(stats.outputTorque)} unit="Nm" colorClass="text-engineering-accent" />
        <StatItem label="Relación" value={`1:${formatNumber(stats.ratio)}`} unit="" highlight />
        <StatItem label="Ventaja Mecánica" value={formatNumber(stats.mechanicalAdvantage)} unit="x" />
      </div>

       {/* GENERAL SECTION */}
       <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 border-b border-slate-700 pb-1">General</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
         <StatItem label="Velocidad Tangencial" value={formatNumber(stats.tangentialVelocity)} unit="m/s" />
        {mode === SystemMode.BELT && (
             <StatItem label="Longitud Correa" value={formatNumber(stats.beltLength)} unit="mm" />
        )}
      </div>

      {/* CHART SECTION */}
      <div className="mb-6">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Relación Diámetro vs Rendimiento</h3>
        <SimpleChart data={graphData} currentX={state.drivenDiameter} />
      </div>

      {/* REAL WORLD EXAMPLES SECTION */}
      <div className="mb-6">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Utilidades en la Vida Real</h3>
        <div className="space-y-2">
          {examples.map((ex, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-700 p-3 rounded flex items-start gap-3">
              <span className="text-2xl" role="img" aria-label={ex.title}>{ex.icon}</span>
              <div>
                <div className="text-sm font-semibold text-slate-200">{ex.title}</div>
                <div className="text-xs text-slate-500">{ex.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-700 pt-6">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-engineering-warning font-semibold flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
             </svg>
             Análisis de Ingeniero IA
           </h3>
           {!analysis && !loading && (
             <button 
               onClick={handleAIAnalysis}
               className="bg-engineering-accent hover:bg-sky-400 text-slate-900 font-bold py-1 px-3 rounded text-sm transition-colors"
             >
               Analizar
             </button>
           )}
        </div>

        {loading && (
            <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-slate-700 rounded"></div>
                <div className="h-2 bg-slate-700 rounded w-5/6"></div>
                <div className="h-2 bg-slate-700 rounded w-4/6"></div>
                </div>
            </div>
        )}

        {analysis && (
          <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto border border-slate-700">
            {analysis}
          </div>
        )}
      </div>
    </div>
  );
};