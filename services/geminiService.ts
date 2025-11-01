import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Wine } from '../types';

// Helper function to convert File to base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

// El nuevo tipo Wine, pero sin los campos que se añaden después del análisis
export type AnalyzedWineData = Omit<Wine, 'id' | 'imagenBase64' | 'stock' | 'precioAdquisicion'>;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    nombre: {
      type: Type.STRING,
      description: 'El nombre completo del vino, incluyendo la línea si la tiene (ej. "Catena Zapata Malbec Argentino").',
    },
    bodega: {
      type: Type.STRING,
      description: 'La bodega o productor del vino (ej. "Catena Zapata").',
    },
    anada: {
      type: Type.STRING,
      description: 'La añada (año de cosecha) del vino. Si no es vintage, responder "N/V".',
    },
     pais: {
      type: Type.STRING,
      description: 'El país de origen del vino (ej. "Argentina", "Chile", "Francia").',
    },
    tipoUva: {
      type: Type.STRING,
      description: 'La variedad de uva principal o el coupage (ej. "Malbec", "Cabernet Sauvignon, Merlot").',
    },
    notasDeCata: {
      type: Type.STRING,
      description: 'Una breve descripción de los aromas y sabores del vino (2-3 frases).',
    },
    precioReferencia: {
      type: Type.STRING,
      description: 'El precio de referencia aproximado del vino encontrado en la web, en la moneda local si es posible (ej. "CLP $25.000", "USD 30"). Si no se encuentra, responder "N/A".',
    },
  },
  required: ['nombre', 'bodega', 'anada', 'pais', 'tipoUva', 'notasDeCata', 'precioReferencia'],
};

export async function analyzeWineLabel(
  imageFile: File
): Promise<AnalyzedWineData> {
  if (!process.env.API_KEY) {
    throw new Error('La variable de entorno API_KEY no está configurada.');
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const base64Image = await fileToBase64(imageFile);
  const imagePart = {
    inlineData: { data: base64Image, mimeType: imageFile.type },
  };

  const textPart = {
    // FIX: Refined prompt to be more direct and rely on the schema.
    text: 'Identifica este vino a partir de la imagen de su etiqueta. Extrae la información solicitada en el schema JSON proporcionado.',
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    // FIX: Added .trim() to prevent parsing errors from whitespace.
    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    
    if (!parsedJson.nombre || !parsedJson.bodega) {
        throw new Error('La respuesta del modelo no contiene los campos esperados.');
    }

    return parsedJson as AnalyzedWineData;

  } catch (error) {
    console.error('Error al llamar a la API de Gemini:', error);
    if (error instanceof Error) {
      throw new Error(`Error al analizar la etiqueta del vino: ${error.message}`);
    }
    throw new Error('Ocurrió un error desconocido al analizar la etiqueta.');
  }
}
