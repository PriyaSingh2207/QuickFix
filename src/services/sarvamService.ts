import type { SupportedLanguageCode } from '@/types/language';

const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY || 'sk_lxsq5y8m_8J9Ce4dMxFotozPFk2smlDzn';
const SARVAM_TRANSLATE_URL = 'https://api.sarvam.ai/translate';
const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

// Local memory cache to prevent duplicate network calls
const translationCache = new Map<string, string>();

// Hydrate from localStorage if available
try {
  const stored = localStorage.getItem('quickfix_sarvam_cache');
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof v === 'string') translationCache.set(k, v);
    });
  }
} catch {
  // Ignore local storage error
}

function persistCache() {
  try {
    const obj: Record<string, string> = {};
    // Store only up to 500 items in local storage
    let count = 0;
    translationCache.forEach((v, k) => {
      if (count < 500) {
        obj[k] = v;
        count++;
      }
    });
    localStorage.setItem('quickfix_sarvam_cache', JSON.stringify(obj));
  } catch {
    // Ignore quota errors
  }
}

export interface TranslateOptions {
  text: string;
  targetLang: SupportedLanguageCode;
  sourceLang?: SupportedLanguageCode;
  mode?: 'formal' | 'informal';
}

export const BRAND_NAMES = new Set(['quickfix', 'quick fix', 'quick-fix']);

/**
 * Ensures the brand name 'Quickfix' is never translated into Hindi or Indic equivalents
 * like 'शीघ्र-समाधान' or 'त्वरित समाधान'.
 */
export function preserveBrandName(text: string): string {
  if (!text) return text;
  return text
    .replace(/शीघ्र\s*[-–—]?\s*समाधान/gi, 'Quickfix')
    .replace(/त्वरित\s*[-–—]?\s*समाधान/gi, 'Quickfix')
    .replace(/झटपट\s*[-–—]?\s*निवारण/gi, 'Quickfix')
    .replace(/ઝડપી\s*[-–—]?\s*ઉકેલ/gi, 'Quickfix')
    .replace(/త్వరిత\s*[-–—]?\s*పరిష్కారం/gi, 'Quickfix')
    .replace(/விரைவு\s*[-–—]?\s*தீர்வு/gi, 'Quickfix')
    .replace(/ತ್ವರಿತ\s*[-–—]?\s*ಪರಿಹಾರ/gi, 'Quickfix')
    .replace(/ദ്രുത\s*[-–—]?\s*പരിഹാരം/gi, 'Quickfix')
    .replace(/ਤੁਰੰਤ\s*[-–—]?\s*ਹੱਲ/gi, 'Quickfix')
    .replace(/ତୁରନ୍ତ\s*[-–—]?\s*ସମାଧାନ/gi, 'Quickfix')
    .replace(/দ্রুত\s*[-–—]?\s*সমাধান/gi, 'Quickfix');
}

/**
 * Get cached translation if available immediately
 */
export function getCachedSarvamTranslation(
  text: string,
  targetLang: SupportedLanguageCode,
  sourceLang: SupportedLanguageCode = 'en-IN'
): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) return text;
  if (BRAND_NAMES.has(trimmed.toLowerCase())) return 'Quickfix';
  if (sourceLang === targetLang) return text;
  const cacheKey = `${sourceLang}_${targetLang}_${trimmed.toLowerCase()}`;
  const found = translationCache.get(cacheKey);
  return found ? preserveBrandName(found) : undefined;
}

/**
 * Set cached translation manually (e.g. from dictionary)
 */
export function setCachedSarvamTranslation(
  text: string,
  translatedText: string,
  targetLang: SupportedLanguageCode,
  sourceLang: SupportedLanguageCode = 'en-IN'
): void {
  const trimmed = text?.trim();
  if (!trimmed || !translatedText) return;
  if (BRAND_NAMES.has(trimmed.toLowerCase())) return;
  const cacheKey = `${sourceLang}_${targetLang}_${trimmed.toLowerCase()}`;
  translationCache.set(cacheKey, preserveBrandName(translatedText.trim()));
}

/**
 * Translate text using Sarvam AI translation API (Mayura v1 model)
 */
export async function translateWithSarvam({
  text,
  targetLang,
  sourceLang = 'en-IN',
  mode = 'formal'
}: TranslateOptions): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) return text || '';
  if (BRAND_NAMES.has(trimmed.toLowerCase())) return 'Quickfix';
  if (sourceLang === targetLang) return text;

  const cacheKey = `${sourceLang}_${targetLang}_${trimmed.toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    return preserveBrandName(translationCache.get(cacheKey)!);
  }

  if (!SARVAM_API_KEY) {
    console.warn('[Sarvam AI] No VITE_SARVAM_API_KEY detected in environment.');
    return text;
  }

  try {
    const response = await fetch(SARVAM_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        input: trimmed,
        source_language_code: sourceLang,
        target_language_code: targetLang,
        speaker_gender: 'Female',
        mode: mode,
        model: 'mayura:v1'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Sarvam AI] Translation error HTTP ${response.status}:`, errText);
      return text;
    }

    const data = await response.json();
    const rawTranslated = data?.translated_text?.trim() || text;
    const translated = preserveBrandName(rawTranslated);

    translationCache.set(cacheKey, translated);
    persistCache();
    return translated;
  } catch (error) {
    console.warn('[Sarvam AI] Network exception while translating:', error);
    return text;
  }
}

/**
 * Batch translate multiple phrases in a single API call using delimiter separation.
 * Highly efficient for translating rendered DOM nodes or lists of text.
 */
export async function translateBatchWithSarvam(
  texts: string[],
  targetLang: SupportedLanguageCode,
  sourceLang: SupportedLanguageCode = 'en-IN'
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  if (!texts.length || targetLang === sourceLang) {
    texts.forEach(t => results.set(t, t));
    return results;
  }

  // 1. Separate cached items from uncached items
  const uncached: string[] = [];
  texts.forEach(raw => {
    const trimmed = raw.trim();
    if (!trimmed) {
      results.set(raw, raw);
      return;
    }
    if (BRAND_NAMES.has(trimmed.toLowerCase())) {
      results.set(raw, 'Quickfix');
      return;
    }
    const cached = getCachedSarvamTranslation(trimmed, targetLang, sourceLang);
    if (cached) {
      results.set(raw, cached);
    } else {
      if (!uncached.includes(trimmed)) {
        uncached.push(trimmed);
      }
    }
  });

  if (!uncached.length) {
    return results;
  }

  // 2. Process uncached items in chunks of up to 20 phrases to avoid payload limits
  const CHUNK_SIZE = 20;
  const DELIMITER = ' \n---\n ';

  for (let i = 0; i < uncached.length; i += CHUNK_SIZE) {
    const chunk = uncached.slice(i, i + CHUNK_SIZE);
    const joinedPayload = chunk.join(DELIMITER);

    try {
      const response = await fetch(SARVAM_TRANSLATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': SARVAM_API_KEY
        },
        body: JSON.stringify({
          input: joinedPayload,
          source_language_code: sourceLang,
          target_language_code: targetLang,
          speaker_gender: 'Female',
          mode: 'formal',
          model: 'mayura:v1'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const translatedJoined = data?.translated_text || '';
        const translatedParts = translatedJoined.split(/\s*---\s*/);

        chunk.forEach((original, idx) => {
          if (BRAND_NAMES.has(original.toLowerCase())) {
            results.set(original, 'Quickfix');
            return;
          }
          const rawTrans = translatedParts[idx]?.trim() || original;
          const trans = preserveBrandName(rawTrans);
          setCachedSarvamTranslation(original, trans, targetLang, sourceLang);
          results.set(original, trans);
        });
      } else {
        // Fallback: keep original text
        chunk.forEach(original => results.set(original, original));
      }
    } catch (err) {
      console.warn('[Sarvam AI] Batch translate failed for chunk:', err);
      chunk.forEach(original => results.set(original, original));
    }
  }

  persistCache();
  return results;
}

/**
 * Transcribe citizen voice recording via Sarvam AI Speech-to-Text API (Saaras)
 */
export async function transcribeWithSarvam(
  audioBlob: Blob,
  languageCode: SupportedLanguageCode = 'hi-IN'
): Promise<string> {
  if (!SARVAM_API_KEY) {
    throw new Error('Sarvam API key is missing.');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'citizen_voice_recording.wav');
  formData.append('language_code', languageCode);
  formData.append('model', 'saaras:v3');
  formData.append('mode', 'transcribe');

  try {
    const response = await fetch(SARVAM_STT_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`STT failed with code ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data?.transcript || '';
  } catch (error) {
    console.error('[Sarvam AI STT] Transcription failed:', error);
    throw error;
  }
}
