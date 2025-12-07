import { GoogleGenAI, Type } from "@google/genai";
import { AVAILABLE_INGREDIENTS } from "../constants";
import { Dish, CartItem } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ADVANCED_RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creative name of the dish" },
    description: { type: Type.STRING, description: "Detailed description" },
    price: { type: Type.NUMBER, description: "Price in BRL (Cost * 3.5)" },
    time: { type: Type.STRING, description: "Prep time e.g. '18 min'" },
    calories: { type: Type.STRING, description: "Total calories e.g. '450 kcal'" },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING }
      }
    },
    ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
    allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
    reasoning: { type: Type.STRING, description: "Explanation of why this fits the user's intent" },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["name", "description", "price", "time", "ingredientsUsed", "reasoning"]
};

// Updated image generation with high-quality prompts
const generateDishImage = async (dishName: string, dishDescription: string, locationContext: string = "Luanda, Angola"): Promise<string> => {
    try {
        const prompt = `
          Professional award-winning food photography of ${dishName}. 
          Description: ${dishDescription}. 
          Style: Plated in a high-end restaurant in ${locationContext}. 
          Details: Macro shot, soft natural lighting, steam rising, 8k resolution, Michelin star plating, culinary magazine style.
          The food must look appetizing, real and match the ingredients described.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: {
                parts: [{ text: prompt }]
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return `https://picsum.photos/seed/${dishName.replace(/\s/g,'')}/400/300`;
    } catch (error) {
        console.error("Image generation failed, using fallback", error);
        return `https://picsum.photos/seed/${dishName.replace(/\s/g,'')}/400/300`;
    }
};

export const generateCustomDish = async (
    userPrompt: string, 
    dietaryRestrictions: string[],
    referenceImageBase64?: string,
    previousDishContext?: Dish
): Promise<Dish | null> => {
  try {
    const model = 'gemini-2.5-flash';
    const timeOfDay = new Date().getHours() < 18 ? "Lunch" : "Dinner";
    
    let promptText = `
      Você é o Chef Executivo (AI) do DJambo.
      
      CONTEXTO ATUAL:
      - Horário: ${timeOfDay}
      - Restrições do Usuário: ${dietaryRestrictions.join(', ') || "Nenhuma"}
      - Estoque Disponível: ${AVAILABLE_INGREDIENTS.join(', ')}
      
      MISSÃO:
      1. Analise a intenção do usuário: "${userPrompt}".
         - Se for "leve", foque em digestão fácil e baixas calorias.
         - Se for "satisfeito", foque em proteínas e fibras.
      2. Crie uma receita VIÁVEL usando APENAS o estoque.
      3. Calcule o preço justo: Estime o custo dos ingredientes e multiplique por 3.5.
      4. Estime tempo realista.
    `;

    if (previousDishContext) {
        promptText += `
        CONTEXTO DE ITERAÇÃO:
        O usuário quer modificar este prato anterior: ${JSON.stringify(previousDishContext)}.
        Ajuste a receita baseada no novo pedido, recalculando preço, tempo e nutrição.
        `;
    }

    const parts: any[] = [{ text: promptText }];
    
    if (referenceImageBase64) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: referenceImageBase64 } });
        parts.push({ text: "Use esta imagem como referência visual para o estilo ou ingredientes do prato." });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: "Always respond with a JSON object adhering to the schema. Do not include markdown formatting.",
        responseMimeType: "application/json",
        responseSchema: ADVANCED_RECIPE_SCHEMA,
      }
    });

    const dishDetails = response.text ? JSON.parse(response.text) : null;
    if (!dishDetails) return null;

    const imageUrl = await generateDishImage(dishDetails.name, dishDetails.description);

    return {
      id: `custom-${Date.now()}`,
      name: dishDetails.name,
      description: dishDetails.description,
      price: dishDetails.price,
      time: dishDetails.time,
      calories: dishDetails.calories,
      tags: dishDetails.tags || [],
      image: imageUrl,
      isCustom: true,
      rating: 5.0,
      macros: dishDetails.macros,
      ingredients: dishDetails.ingredientsUsed,
      reasoning: dishDetails.reasoning,
      allergens: dishDetails.allergens
    };

  } catch (error) {
    console.error("Gemini Dish Gen Error:", error);
    throw error;
  }
};

// --- Location & Personalization Services ---

export const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
   try {
       const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: `Identify the city and country for these coordinates: ${lat}, ${lng}. Return only the "City, Country" string. Example: "Rio de Janeiro, Brazil".`
       });
       return response.text.trim();
   } catch (e) {
       console.error("City detection failed", e);
       return "Luanda, Angola"; // App theme fallback
   }
};

export const personalizeMenuImages = async (dishes: Dish[], lat?: number, lng?: number): Promise<Dish[]> => {
   let city = "Luanda, Angola";
   
   if (lat && lng) {
       try {
           city = await getCityFromCoordinates(lat, lng);
       } catch (e) {
           console.log("Using default location for context");
       }
   }
   
   console.log(`Personalizing menu for culinary context: ${city}`);

   const promises = dishes.map(async (dish, index) => {
       if (dish.image.includes('picsum') || dish.image.includes('random')) {
           await new Promise(resolve => setTimeout(resolve, index * 500));
           const img = await generateDishImage(dish.name, dish.description, city);
           return { ...dish, image: img };
       }
       return dish;
   });

   return Promise.all(promises);
};


// --- Translation Services ---

export const translateMenuBatch = async (dishes: Dish[], targetLang: string): Promise<Dish[]> => {
    if (targetLang === 'pt-BR') {
        return dishes.map(d => ({...d, translatedName: undefined, translatedDescription: undefined}));
    }

    try {
        const itemsToTranslate = dishes.map(d => ({id: d.id, name: d.name, description: d.description}));
        
        // Using Type.ARRAY schema to ensure robust JSON parsing
        const translationSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    translatedName: { type: Type.STRING },
                    translatedDescription: { type: Type.STRING }
                },
                required: ["id", "translatedName", "translatedDescription"]
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following menu items from Portuguese to ${targetLang}. Preserve the culinary meaning.
            Items: ${JSON.stringify(itemsToTranslate)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: translationSchema
            }
        });

        const translations = response.text ? JSON.parse(response.text) : [];
        
        // Merge translations back
        return dishes.map(dish => {
            const trans = translations.find((t: any) => t.id === dish.id);
            return trans ? { ...dish, translatedName: trans.translatedName, translatedDescription: trans.translatedDescription } : dish;
        });

    } catch (error) {
        console.error("Menu Translation Error", error);
        return dishes;
    }
};

export const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    if (!text) return "";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate this text from ${sourceLang} to ${targetLang}: "${text}"`
        });
        return response.text || text;
    } catch (e) {
        return text;
    }
};

export const chatWithChef = async (
    history: {role: string, parts: {text: string}[]}[], 
    message: string,
    context: { cart: CartItem[], allergies: string[] }
) => {
    const cartSummary = context.cart.length > 0 
        ? context.cart.map(i => `${i.quantity}x ${i.name}`).join(', ') 
        : "Carrinho vazio";
    
    const allergyContext = context.allergies.length > 0 
        ? `ALERTA DE ALERGIA: O usuário é alérgico a ${context.allergies.join(', ')}.` 
        : "Sem alergias declaradas.";

    const systemInstruction = `
        Você é o Chef do DJambo, um restaurante inclusivo.
        
        CONTEXTO DO CLIENTE:
        - Carrinho atual: ${cartSummary}
        - ${allergyContext}
        
        DIRETRIZES:
        1. Responda dúvidas sobre o cardápio.
        2. Se o usuário perguntar sobre vinhos/bebidas, sugira harmonizações com o que está no carrinho.
        3. Se o usuário tentar pedir algo a que é alérgico, BLOQUEIE E AVISE educadamente.
        4. Seja conciso e acolhedor.
        5. Se o usuário falar outra língua, responda nela, mas coloque a tradução PT-BR entre parênteses para a equipe.
    `;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: { systemInstruction }
    });
    
    const result = await chat.sendMessage({ message });
    return result.text;
};

export const identifyDishFromImage = async (base64Image: string): Promise<any> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `Analyze this food image. Identify the dish. 
        Return a JSON object with these fields:
        - name (string)
        - description (string, short and appetizing)
        - calories (string, estimated)
        - price (number, estimated in BRL)
        - ingredients (array of strings)
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        return response.text ? JSON.parse(response.text) : null;
    } catch (error) {
        console.error("Dish identification failed", error);
        throw error;
    }
};

export const analyzeVibe = async (base64Image: string, menuItems: Dish[]): Promise<any> => {
    try {
        const model = 'gemini-2.5-flash';
        const menuContext = menuItems.map(d => `"${d.name}" (${d.tags.join(', ')})`).join(', ');
        
        const prompt = `
          Você é um especialista em "Vibe" e Gastronomia.
          
          TAREFA:
          1. Analise a imagem (selfie do usuário). Identifique: humor, estilo, cores da roupa, iluminação do ambiente.
          2. Com base nessa "vibe", escolha O MELHOR prato deste menu: [${menuContext}].
          
          OUTPUT JSON:
          {
            "detectedVibe": "Uma frase criativa descrevendo a vibe (ex: 'Elegância minimalista', 'Energia pós-treino', 'Romantismo clássico')",
            "suggestedDishName": "Nome exato do prato do menu",
            "reasoning": "Explicação curta e divertida de por que este prato combina com a vibe."
          }
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        return response.text ? JSON.parse(response.text) : null;
    } catch (error) {
        console.error("Vibe analysis failed", error);
        throw error;
    }
};