import { GoogleGenAI } from "@google/genai";
import { PulleyState, CalculatedStats, SystemMode } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSystemWithGemini = async (
  state: PulleyState,
  stats: CalculatedStats,
  mode: SystemMode
): Promise<string> => {
  
  const modeText = mode === SystemMode.BELT ? "Transmisión por Correa" : "Ruedas de Fricción";

  const prompt = `
    Actúa como un profesor de ingeniería mecánica experto. Analiza esta configuración de sistema de poleas:
    
    Tipo de Sistema: ${modeText}
    Diámetro Motriz (Entrada): ${state.driverDiameter} mm
    Diámetro Conducida (Salida): ${state.drivenDiameter} mm
    Velocidad de Entrada: ${state.inputRpm} RPM
    Potencia de Entrada: ${state.inputPower} W
    
    Resultados Calculados:
    Relación de Transmisión: ${stats.ratio.toFixed(2)}:1
    Velocidad de Salida: ${stats.outputRpm.toFixed(2)} RPM
    Par (Torque) de Salida: ${stats.outputTorque.toFixed(2)} Nm
    Velocidad Tangencial: ${stats.tangentialVelocity.toFixed(2)} m/s
    ${mode === SystemMode.BELT ? `Longitud de Correa: ${stats.beltLength.toFixed(2)} mm` : ''}

    Por favor, proporciona un análisis breve (máx 150 palabras) en español cubriendo:
    1. El tipo de ventaja mecánica (¿Multiplicador de velocidad o de fuerza?).
    2. Comentario práctico sobre si esta configuración es eficiente.
    3. Si es fricción, menciona riesgos de deslizamiento. Si es correa, menciona la importancia de la tensión.
    4. Menciona una medida de seguridad basada en la velocidad tangencial.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error conectando con el servicio de análisis de IA. Por favor verifica tu clave API.";
  }
};