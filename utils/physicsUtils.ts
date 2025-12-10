import { PulleyState, CalculatedStats, SystemMode, GraphDataPoint, RealWorldApplication } from '../types';

export const calculatePhysics = (state: PulleyState, mode: SystemMode): CalculatedStats => {
  const { driverDiameter, drivenDiameter, inputRpm, inputPower, centerDistance } = state;

  // 1. Relación de Transmisión (i)
  // i = D_conducida / D_motriz (Relación de velocidades: N_in / N_out = D_out / D_in)
  const speedRatio = drivenDiameter / driverDiameter; 
  
  // 2. RPM de Salida
  const outputRpm = inputRpm / speedRatio;

  // 3. Velocidad Angular (rad/s)
  const omegaInput = (2 * Math.PI * inputRpm) / 60;
  const omegaOutput = (2 * Math.PI * outputRpm) / 60;

  // 4. Par de Entrada (T = P / omega)
  const inputTorque = omegaInput > 0 ? inputPower / omegaInput : 0;

  // 5. Par de Salida (Ideal, sin pérdidas)
  // Power_in = Power_out => T_in * w_in = T_out * w_out
  const outputTorque = omegaOutput > 0 ? inputPower / omegaOutput : 0;

  // 6. Velocidad Tangencial (v = r * omega)
  const radiusDriverM = (driverDiameter / 2) / 1000;
  const tangentialVelocity = radiusDriverM * omegaInput;

  // 7. Longitud de la Correa
  let beltLength = 0;
  if (mode === SystemMode.BELT) {
    const r1 = driverDiameter / 2;
    const r2 = drivenDiameter / 2;
    const d = centerDistance;
    
    // Aproximación estándar
    if (d > 0) {
        beltLength = (2 * d) + (Math.PI * (driverDiameter + drivenDiameter) / 2) + (Math.pow(drivenDiameter - driverDiameter, 2) / (4 * d));
    }
  }

  return {
    ratio: speedRatio,
    inputTorque, // Return calculated input torque
    outputRpm,
    outputTorque, // Newton metros
    tangentialVelocity, // m/s
    beltLength,
    mechanicalAdvantage: speedRatio // Ventaja mecánica simple
  };
};

export const formatNumber = (num: number, decimals = 2): string => {
  return num.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

// Generar datos para la gráfica variando el diámetro de salida
export const generateGraphData = (state: PulleyState): GraphDataPoint[] => {
  const data: GraphDataPoint[] = [];
  const minD = 50;
  const maxD = 400;
  const step = 25;

  for (let d = minD; d <= maxD; d += step) {
    const ratio = d / state.driverDiameter;
    const rpm = state.inputRpm / ratio;
    const omega = (2 * Math.PI * rpm) / 60;
    const torque = omega > 0 ? state.inputPower / omega : 0;

    data.push({
      x: d,
      y1: rpm,
      y2: torque
    });
  }
  return data;
};

export const getRealWorldApplications = (ratio: number): RealWorldApplication[] => {
  if (ratio > 1.2) {
    // Reductora (Gana fuerza, pierde velocidad)
    return [
      { 
        title: "Cinta Transportadora", 
        description: "Requiere mucho par (fuerza) para mover cargas pesadas lentamente.",
        icon: "📦" 
      },
      { 
        title: "Cabestrante (Winch)", 
        description: "Maximiza la fuerza de tracción para levantar o arrastrar objetos.",
        icon: "🏗️" 
      },
      { 
        title: "Bicicleta (Marcha Baja)", 
        description: "Para subir cuestas, se pedalea rápido pero la rueda gira lento con mucha fuerza.",
        icon: "🚲" 
      }
    ];
  } else if (ratio < 0.8) {
    // Multiplicadora (Gana velocidad, pierde fuerza)
    return [
      { 
        title: "Ventilador Centrífugo", 
        description: "Necesita altas revoluciones para mover grandes volúmenes de aire.",
        icon: "💨" 
      },
      { 
        title: "Sierra Circular", 
        description: "La hoja debe girar a muy alta velocidad para cortar limpiamente.",
        icon: "🪚" 
      },
      { 
        title: "Generador Eólico", 
        description: "Las aspas giran lento, pero el generador necesita girar rápido.",
        icon: "⚡" 
      }
    ];
  } else {
    // Relación cercana a 1:1
    return [
      { 
        title: "Compresor de Aire (Directo)", 
        description: "Transmisión de potencia simple sin alterar significativamente el par o velocidad.",
        icon: "⚙️" 
      },
      { 
        title: "Alternador de Coche", 
        description: "Suele trabajar a regímenes similares al motor en conducción normal.",
        icon: "🚗" 
      }
    ];
  }
};