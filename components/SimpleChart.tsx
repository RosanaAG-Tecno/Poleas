import React from 'react';
import { GraphDataPoint } from '../types';

interface Props {
  data: GraphDataPoint[];
  currentX: number;
}

export const SimpleChart: React.FC<Props> = ({ data, currentX }) => {
  const width = 100;
  const height = 60;
  const padding = 5;

  const maxY1 = Math.max(...data.map(d => d.y1));
  const maxY2 = Math.max(...data.map(d => d.y2));
  const minX = data[0].x;
  const maxX = data[data.length - 1].x;

  const getX = (val: number) => padding + ((val - minX) / (maxX - minX)) * (width - 2 * padding);
  const getY1 = (val: number) => (height - padding) - (val / maxY1) * (height - 2 * padding);
  const getY2 = (val: number) => (height - padding) - (val / maxY2) * (height - 2 * padding);

  // Points for RPM line (Cyan)
  const points1 = data.map(d => `${getX(d.x)},${getY1(d.y1)}`).join(' ');
  // Points for Torque line (Orange)
  const points2 = data.map(d => `${getX(d.x)},${getY2(d.y2)}`).join(' ');

  const curXPos = getX(currentX);

  return (
    <div className="w-full h-32 relative mt-4 bg-slate-900 rounded border border-slate-700 p-2">
      <div className="absolute top-2 left-2 flex gap-4 text-[10px]">
         <span className="flex items-center gap-1 text-engineering-accent"><div className="w-2 h-2 rounded-full bg-engineering-accent"></div> Velocidad (RPM)</span>
         <span className="flex items-center gap-1 text-engineering-warning"><div className="w-2 h-2 rounded-full bg-engineering-warning"></div> Fuerza (Par)</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {/* RPM Line */}
        <polyline points={points1} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {/* Torque Line */}
        <polyline points={points2} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        
        {/* Current Position Marker */}
        <line x1={curXPos} y1={0} x2={curXPos} y2={height} stroke="white" strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="text-[10px] text-slate-500 text-center mt-[-10px]">Diámetro Polea Salida</div>
    </div>
  );
};