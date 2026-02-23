/**
 * OpenNMT Translation API
 * Calls local Python translation server
 */

const TRANSLATION_SERVER_URL = 'http://localhost:5000';

export interface TranslationRequest {
  text: string;
  src_lang?: string;
  tgt_lang?: string;
}

export interface TranslationResponse {
  translation: string;
  source_lang: string;
  target_lang: string;
}

/**
 * Translate text using the local OpenNMT server
 */
export async function translateWithOpenNMT(
  text: string,
  sourceLang: string = 'en',
  targetLang: string = 'fil'
): Promise<string> {
  try {
    const response = await fetch(`${TRANSLATION_SERVER_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        src_lang: sourceLang,
        tgt_lang: targetLang,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Translation failed');
    }

    const data: TranslationResponse = await response.json();
    return data.translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Check if the translation server is running
 */
export async function checkTranslationServer(): Promise<boolean> {
  try {
    const response = await fetch(`${TRANSLATION_SERVER_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
