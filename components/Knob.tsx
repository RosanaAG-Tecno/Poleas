import React from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (val: number) => void;
  color?: string;
}

export const Knob: React.FC<KnobProps> = ({ 
  label, value, min, max, step = 1, unit, onChange, color = "text-engineering-accent" 
}) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <div className="flex justify-between items-end">
        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{label}</label>
        <span className={`font-mono text-sm ${color}`}>{value} <span className="text-slate-500 text-xs">{unit}</span></span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-colors"
      />
    </div>
  );
};