import React, { useEffect, useState, useRef } from 'react';
import { PulleyState, SystemMode } from '../types';

interface Props {
  state: PulleyState;
  mode: SystemMode;
  isPlaying: boolean;
}

export const PulleyVisualizer: React.FC<Props> = ({ state, mode, isPlaying }) => {
  const { driverDiameter, drivenDiameter, centerDistance, inputRpm } = state;
  const requestRef = useRef<number>();
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);
  const [beltOffset, setBeltOffset] = useState(0);

  // Normalization for SVG viewbox
  const VIEWBOX_WIDTH = 800;
  const VIEWBOX_HEIGHT = 400;
  const SCALE = 0.8; 
  const CENTER_X = VIEWBOX_WIDTH / 2;
  const CENTER_Y = VIEWBOX_HEIGHT / 2;

  // Determine positions based on mode
  let x1, x2;
  const y1 = CENTER_Y;
  const y2 = CENTER_Y;
  const r1 = (driverDiameter / 2) * SCALE;
  const r2 = (drivenDiameter / 2) * SCALE;
  const d = (mode === SystemMode.BELT ? centerDistance : (driverDiameter + drivenDiameter) / 2 + 5) * SCALE; 

  if (mode === SystemMode.FRICTION) {
    const totalWidth = r1 + r2;
    x1 = CENTER_X - totalWidth / 2 + r1 / 2; 
    x2 = x1 + r1 + r2;
  } else {
    x1 = CENTER_X - d / 2;
    x2 = CENTER_X + d / 2;
  }

  // Animation Loop
  const animate = (time: number) => {
    if (!isPlaying) return;
    const speedFactor = 0.05; 
    const rpm = inputRpm === 0 ? 0 : inputRpm; 
    
    // Driver Rotation
    setRotationA(prev => (prev + rpm * speedFactor) % 360);

    // Driven Rotation
    const ratio = driverDiameter / drivenDiameter;
    
    // Direction logic
    const direction = mode === SystemMode.FRICTION ? -1 : 1;
    
    setRotationB(prev => (prev + (rpm * ratio * direction) * speedFactor) % 360);

    // Belt Movement Animation
    // Linear velocity is proportional to RPM * Radius
    // We adjust the factor to make it look realistic visually
    const beltSpeed = (rpm * r1) * 0.002; // Increased visual speed slightly
    setBeltOffset(prev => prev - beltSpeed);

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, inputRpm, driverDiameter, drivenDiameter, mode]);


  // Belt Calculation (Tangent lines)
  const renderBelt = () => {
    if (mode !== SystemMode.BELT) return null;

    // Offset radius for belt so it sits ON the pulley, not inside it
    // Stroke width is 10, so we offset by 5
    const beltOffsetRadius = 5;
    const br1 = r1 + beltOffsetRadius;
    const br2 = r2 + beltOffsetRadius;

    const dist = Math.abs(x2 - x1);
    // Use belt radii for tangent calculation
    if (dist <= Math.abs(br1 - br2)) return null; 

    const theta = Math.acos((br1 - br2) / dist);
    
    // Coordinates using Belt Radii
    const x1_top = x1 + br1 * Math.cos(theta);
    const y1_top = y1 - br1 * Math.sin(theta);
    const x2_top = x2 + br2 * Math.cos(theta);
    const y2_top = y2 - br2 * Math.sin(theta);

    const x1_bot = x1 + br1 * Math.cos(-theta);
    const y1_bot = y1 - br1 * Math.sin(-theta);
    const x2_bot = x2 + br2 * Math.cos(-theta);
    const y2_bot = y2 - br2 * Math.sin(-theta);

    // Determine Arc Flags
    // If Driver > Driven, Driver wraps > 180 (LargeArc=1), Driven wraps < 180 (LargeArc=0)
    // If Driver < Driven, Driver wraps < 180 (LargeArc=0), Driven wraps > 180 (LargeArc=1)
    const largeArc1 = br1 > br2 ? 1 : 0;
    const largeArc2 = br1 < br2 ? 1 : 0;

    // Path construction:
    // Start Top Left -> Line to Top Right
    // Arc around Right (Clockwise) to Bottom Right
    // Line to Bottom Left
    // Arc around Left (Clockwise) back to Top Left
    const pathData = `
      M ${x1_top} ${y1_top}
      L ${x2_top} ${y2_top}
      A ${br2} ${br2} 0 ${largeArc2} 1 ${x2_bot} ${y2_bot}
      L ${x1_bot} ${y1_bot}
      A ${br1} ${br1} 0 ${largeArc1} 1 ${x1_top} ${y1_top}
    `;

    return (
      <g className="drop-shadow-xl">
         {/* Border/Shadow of the belt */}
         <path 
            d={pathData}
            fill="none"
            stroke="#0f172a"
            strokeWidth="14"
            strokeLinejoin="round"
         />
         {/* Main Belt Body */}
         <path 
            d={pathData}
            fill="none"
            stroke="#334155"
            strokeWidth="10"
            strokeLinejoin="round"
         />
         {/* Belt Texture/Animation */}
         <path 
            d={pathData}
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="15, 10"
            strokeDashoffset={beltOffset}
            strokeOpacity="0.8"
            strokeLinejoin="round"
         />
      </g>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-pegboard-pattern relative rounded-xl border border-slate-700 shadow-inner">
        {/* Helper grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px'}}>
        </div>

      <svg 
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} 
        className="w-full h-full max-w-[1000px] select-none"
      >
        <defs>
          <radialGradient id="pulleyGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="70%" stopColor="#475569" />
            <stop offset="90%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </radialGradient>
        </defs>

        {/* BELT (Rendered behind the pulleys roughly by order, but the wrap around look comes from the path construction) */}
        {renderBelt()}

        {/* DRIVER PULLEY */}
        <g transform={`translate(${x1}, ${y1}) rotate(${rotationA})`}>
           {/* Main Body */}
           <circle r={r1} fill="url(#pulleyGradient)" stroke="#94a3b8" strokeWidth="2" />
           <circle r={r1 * 0.8} fill="transparent" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />
           {/* Spokes/Visual Indicators of rotation */}
           <path d={`M -${r1} 0 L ${r1} 0 M 0 -${r1} L 0 ${r1}`} stroke="#334155" strokeWidth="2" />
           {/* Center Hub */}
           <circle r={10} fill="#f59e0b" stroke="#fff" strokeWidth="2" />
        </g>
        
        {/* DRIVER LABEL */}
        <text x={x1} y={y1 + r1 + 35} textAnchor="middle" className="fill-engineering-warning text-sm font-mono font-bold uppercase tracking-wider">Motriz (Entrada)</text>
        {/* DRIVER ARROW */}
        <path 
             d={`M ${x1 - r1 - 25} ${y1} A ${r1 + 25} ${r1 + 25} 0 0 1 ${x1} ${y1 - r1 - 25}`} 
             fill="none" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrowhead)" opacity={0.8}
        />


        {/* DRIVEN PULLEY */}
        <g transform={`translate(${x2}, ${y2}) rotate(${rotationB})`}>
           <circle r={r2} fill="url(#pulleyGradient)" stroke="#94a3b8" strokeWidth="2" />
           <circle r={r2 * 0.6} fill="transparent" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />
           <path d={`M -${r2} 0 L ${r2} 0 M 0 -${r2} L 0 ${r2}`} stroke="#334155" strokeWidth="2" />
           <circle r={10} fill="#38bdf8" stroke="#fff" strokeWidth="2" />
        </g>

        {/* DRIVEN LABEL */}
        <text x={x2} y={y2 + r2 + 35} textAnchor="middle" className="fill-engineering-accent text-sm font-mono font-bold uppercase tracking-wider">Conducida (Salida)</text>
        
        {/* DRIVEN ARROW DIRECTION (Dynamic based on mode) */}
        {mode === SystemMode.FRICTION ? (
            // Counter-clockwise arrow for friction if driver is CW
            <path 
                d={`M ${x2 + r2 + 25} ${y2} A ${r2 + 25} ${r2 + 25} 0 0 0 ${x2} ${y2 - r2 - 25}`} 
                fill="none" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrowhead-blue)" opacity={0.8}
            />
        ) : (
            // Clockwise arrow for belt
            <path 
                d={`M ${x2 - r2 - 25} ${y2} A ${r2 + 25} ${r2 + 25} 0 0 1 ${x2} ${y2 - r2 - 25}`} 
                fill="none" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrowhead-blue)" opacity={0.8}
            />
        )}


        {/* MARKERS */}
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
        <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8" />
        </marker>

      </svg>
    </div>
  );
};