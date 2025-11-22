import { GoogleGenAI } from "@google/genai";
import { Restaurant, GeoLocation } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchRestaurants = async (
  location: GeoLocation,
  cuisine: string
): Promise<Restaurant[]> => {
  try {
    const model = "gemini-2.5-flash"; 
    
    // We cannot use JSON schema mode with Google Maps tool, so we prompt for JSON in text.
    const prompt = `
      我現在的位置在緯度: ${location.lat}, 經度: ${location.lng}。
      請使用 Google Maps 幫我尋找附近 5 間評價最高的「${cuisine}」餐廳。
      
      請務必以繁體中文 (Traditional Chinese) 回答所有描述與評論。
      
      針對每一間餐廳，請提供以下資訊：
      1. Name (餐廳名稱)
      2. Cuisine type (餐飲類別)
      3. Rating (評分 1-5)
      4. Total review count (評論總數預估)
      5. Full Address (完整地址)
      6. A short, catchy description (短評/特色介紹，使用繁體中文)
      7. Price level (價格等級 $, $$, $$$, $$$$)
      8. 2-3 summary reviews from customers (2-3 則摘要評論，使用繁體中文，請包含優點與缺點)
      9. Reservation Link (訂位連結): 
         - **最優先**: 請搜尋 **inline (inline.app)**, OpenTable, TableCheck 等平台的直接訂位連結。
         - **次要**: 如果找不到訂位平台連結，請提供餐廳的 **官方網站 (Official Website)** 或 Facebook/Instagram 頁面連結。
         - 只有在完全找不到任何網頁連結時，才回傳 "null"。
      10. Google Maps URL
      
      IMPORTANT: Output the result ONLY as a valid JSON array inside a \`\`\`json code block.
      The JSON structure must match this exactly:
      [
        {
          "name": "string",
          "cuisine": "string",
          "rating": number,
          "reviewCount": number,
          "address": "string",
          "description": "string",
          "priceLevel": "string",
          "reviews": [
            {"author": "string", "rating": 5, "text": "string"}
          ],
          "reservationLink": "string | null",
          "googleMapsUrl": "string"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng,
            },
          },
        },
        temperature: 0.4, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Extract JSON from the markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      const data = JSON.parse(jsonMatch[1]);
      // Add unique IDs and fallback images
      return data.map((r: any, index: number) => {
        // Strict null check for reservation link to avoid "null" string issues
        let resLink = r.reservationLink;
        if (typeof resLink === 'string') {
          const lower = resLink.toLowerCase().trim();
          if (lower === 'null' || lower === 'none' || lower === '' || lower === 'n/a') {
            resLink = null;
          }
        } else {
          resLink = null;
        }

        return {
          ...r,
          id: `rest-${Date.now()}-${index}`,
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(r.name)}/400/300`,
          isOpenNow: true,
          reservationLink: resLink
        };
      });
    }

    // Fallback if parsing fails
    console.warn("Failed to parse JSON from Gemini response:", text);
    throw new Error("Could not parse restaurant data.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};