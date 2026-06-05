import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

/**
 * Helper to initialize and retrieve the GoogleGenAI instance.
 */
function getAIInstance() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    throw new Error('Google Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.');
  }
  
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  
  return aiInstance;
}

/**
 * Streams sales advice for a specific deal card based on its context.
 * 
 * @param {Object} deal - The deal details
 * @param {string} deal.title - The title of the deal
 * @param {number} deal.value - The dollar value of the deal
 * @param {string} deal.stage - The current stage ('Lead', 'Qualified', etc.)
 * @param {Object} deal.contacts - The linked contact details
 * @param {string} deal.contacts.name - The name of the contact
 * @param {string} deal.contacts.company - The company name
 * @param {string} deal.contacts.email - The contact email
 * @param {Function} onChunk - Callback function that receives each chunk of text
 * @returns {Promise<string>} The complete advice string
 */
export async function streamNextAction(deal, onChunk) {
  const ai = getAIInstance();
  const contactName = deal.contacts?.name || 'Unknown Contact';
  const company = deal.contacts?.company || 'Unknown Company';
  
  const prompt = `You are an expert sales strategist. Give exactly one short sentence of actionable sales advice for the following deal:
- Title: "${deal.title}"
- Value: $${deal.value}
- Current Stage: ${deal.stage}
- Contact Name: ${contactName}
- Company: ${company}

Make your advice highly specific to this deal's stage. Write exactly one short sentence. Do not use bold, italics, quotes, or markdown. Make it highly professional and direct.`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let accumulatedText = '';
    
    for await (const chunk of responseStream) {
      const text = chunk.text ?? '';
      accumulatedText += text;
      onChunk(text);
    }
    
    return accumulatedText;
  } catch (error) {
    console.error('Gemini Stream Error:', error);
    throw error;
  }
}
