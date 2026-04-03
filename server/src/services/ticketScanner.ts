import OpenAI from "openai";
import { env } from "../utils/env.js";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export interface TicketItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

export interface TicketResult {
  store: string | null;
  date: string | null;
  items: TicketItem[];
  subtotal: number;
  total: number;
}

const SYSTEM_PROMPT = `Eres un experto en leer tickets de supermercados mexicanos. Analiza la imagen del ticket y extrae TODOS los productos.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta, sin texto adicional:

{
  "store": "nombre de la tienda o null si no se lee",
  "date": "YYYY-MM-DD o null si no se lee",
  "items": [
    {
      "name": "nombre del producto tal como aparece",
      "quantity": 1,
      "unitPrice": 79.00,
      "total": 79.00,
      "category": "categoría sugerida en español"
    }
  ],
  "subtotal": 0,
  "total": 0
}

Reglas para categorías (sugiere libremente pero usa estas como guía):
- Carnicería: pollo, res, cerdo, pescado, mariscos
- Salchichonería: jamón, queso, tocino, mantequilla, salchichas
- Frutas y Verduras: frutas, verduras, hortalizas
- Lácteos: leche, yogurt, crema, queso fresco
- Panadería: pan, tortillas, bollería
- Cereales y Granos: arroz, frijol, cereal, granola, avena
- Bebidas: refrescos, jugos, agua, cerveza, vino
- Limpieza: detergente, jabón, cloro, papel higiénico
- Higiene Personal: shampoo, pasta dental, desodorante
- Abarrotes: enlatados, salsas, aceite, condimentos
- Congelados: helados, verduras congeladas, pizzas
- Botanas: papas, galletas, dulces, chocolates

Si un producto tiene descuento, usa el precio FINAL (después del descuento).
Si hay productos con peso (por kg), calcula el precio unitario por kg.`;

/**
 * Scan one or more ticket images and extract structured data
 */
export async function scanTicketImages(
  base64Images: string[],
): Promise<TicketResult> {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const imageMessages: OpenAI.ChatCompletionContentPart[] = base64Images.map(
    (img) => ({
      type: "image_url" as const,
      image_url: {
        url: img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`,
        detail: "high" as const,
      },
    }),
  );

  const userContent: OpenAI.ChatCompletionContentPart[] = [
    {
      type: "text",
      text:
        base64Images.length > 1
          ? "Estas son fotos de tickets de UNA MISMA compra dividida en varias cajas. Combina todos los productos en una sola lista."
          : "Analiza este ticket de supermercado.",
    },
    ...imageMessages,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    max_tokens: 4096,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("No response from AI");
  }

  // Extract JSON from response (sometimes wrapped in ```json ... ```)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as TicketResult;

  // Validate structure
  if (!Array.isArray(parsed.items)) {
    throw new Error("Invalid ticket data: missing items array");
  }

  return parsed;
}
