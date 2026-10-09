import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { SupportedLanguageCode, LanguageInfo } from '@/types/language';
import { SUPPORTED_LANGUAGES } from '@/types/language';
import { UI_DICTIONARY } from '@/services/translations/uiDictionary';
import {
  translateWithSarvam,
  translateBatchWithSarvam,
  getCachedSarvamTranslation,
  setCachedSarvamTranslation,
  BRAND_NAMES,
  preserveBrandName
} from '@/services/sarvamService';

interface LanguageContextType {
  currentLanguage: SupportedLanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (lang: SupportedLanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
  translateDynamic: (text: string, sourceLang?: SupportedLanguageCode) => Promise<string>;
  supportedLanguages: LanguageInfo[];
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'quickfix_selected_language';
const DYNAMIC_CACHE_PREFIX = 'quickfix_dyn_trans_';

// Tags and classes that must NEVER be translated
const IGNORE_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'CODE',
  'PRE',
  'SVG',
  'PATH',
  'SELECT',
  'OPTION',
  'IFRAME',
  'CANVAS'
]);

// WeakMaps to remember original English content for clean reversion
const originalTextMap = new WeakMap<Node, string>();
const originalPlaceholderMap = new WeakMap<Element, string>();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguageCode>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const valid = SUPPORTED_LANGUAGES.some(l => l.code === saved);
    return valid ? (saved as SupportedLanguageCode) : 'en-IN';
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [, setVersion] = useState(0);

  // In-memory dynamic translation cache keyed by lang -> sourceText -> translatedText
  const dynamicCacheRef = useRef<Record<string, Record<string, string>>>({});
  const pendingBatchQueueRef = useRef<Set<string>>(new Set());
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMutatingDOMRef = useRef(false);

  // Load dynamic cache from localStorage and purge any corrupted brand translations
  useEffect(() => {
    try {
      const cacheKey = `${DYNAMIC_CACHE_PREFIX}${currentLanguage}`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed['Quickfix'];
        delete parsed['quickfix'];
        delete parsed['QuickFix'];
        dynamicCacheRef.current[currentLanguage] = parsed;
      } else if (!dynamicCacheRef.current[currentLanguage]) {
        dynamicCacheRef.current[currentLanguage] = {};
      }

      // Also clean any mapped Quickfix translations in sarvam cache
      const sarvamStored = localStorage.getItem('quickfix_sarvam_cache');
      if (sarvamStored) {
        const parsed = JSON.parse(sarvamStored);
        let modified = false;
        Object.keys(parsed).forEach(k => {
          if (k.toLowerCase().includes('quickfix')) {
            parsed[k] = 'Quickfix';
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem('quickfix_sarvam_cache', JSON.stringify(parsed));
        }
      }
    } catch {
      if (!dynamicCacheRef.current[currentLanguage]) {
        dynamicCacheRef.current[currentLanguage] = {};
      }
    }
  }, [currentLanguage]);

  // Fast phrase lookup map built from UI_DICTIONARY: English Phrase -> Target Phrase
  const phraseDictionary = useMemo(() => {
    const map = new Map<string, string>();
    if (currentLanguage === 'en-IN') return map;

    const enDict = UI_DICTIONARY['en-IN'] || {};
    const targetDict = UI_DICTIONARY[currentLanguage] || {};

    Object.keys(enDict).forEach(k => {
      const enVal = enDict[k]?.trim();
      const targetVal = targetDict[k]?.trim();
      if (enVal && targetVal && enVal.length > 0) {
        if (!BRAND_NAMES.has(enVal.toLowerCase())) {
          map.set(enVal.toLowerCase(), preserveBrandName(targetVal));
        }
      }
    });

    return map;
  }, [currentLanguage]);

  // Lookup translated string from all available sources
  const getTranslationForPhrase = useCallback(
    (raw: string): string | null => {
      const trimmed = raw.trim();
      if (!trimmed || trimmed.length < 2) return null;
      if (BRAND_NAMES.has(trimmed.toLowerCase())) return 'Quickfix';
      if (currentLanguage === 'en-IN') return trimmed;

      // 1. Direct dictionary match
      const dictMatch = phraseDictionary.get(trimmed.toLowerCase());
      if (dictMatch) return preserveBrandName(dictMatch);

      // 2. Dynamic cache ref
      const dyn = dynamicCacheRef.current[currentLanguage]?.[trimmed];
      if (dyn) return preserveBrandName(dyn);

      // 3. Sarvam cache
      const sarvamCache = getCachedSarvamTranslation(trimmed, currentLanguage);
      if (sarvamCache) return preserveBrandName(sarvamCache);

      return null;
    },
    [currentLanguage, phraseDictionary]
  );

  // Dispatch batch request to Sarvam AI for newly discovered strings
  const scheduleBatchTranslation = useCallback(() => {
    if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);

    batchTimeoutRef.current = setTimeout(async () => {
      const itemsToTranslate = Array.from(pendingBatchQueueRef.current);
      pendingBatchQueueRef.current.clear();

      if (itemsToTranslate.length === 0 || currentLanguage === 'en-IN') return;

      setIsTranslating(true);
      try {
        const resultMap = await translateBatchWithSarvam(itemsToTranslate, currentLanguage, 'en-IN');

        if (!dynamicCacheRef.current[currentLanguage]) {
          dynamicCacheRef.current[currentLanguage] = {};
        }

        resultMap.forEach((trans, orig) => {
          dynamicCacheRef.current[currentLanguage][orig] = trans;
          setCachedSarvamTranslation(orig, trans, currentLanguage, 'en-IN');
        });

        // Save updated cache to localStorage
        try {
          const storageKey = `${DYNAMIC_CACHE_PREFIX}${currentLanguage}`;
          localStorage.setItem(storageKey, JSON.stringify(dynamicCacheRef.current[currentLanguage]));
        } catch {
          // Ignore storage quota
        }

        // Trigger DOM re-scan to apply newly received translations
        triggerDOMScan();
        setVersion(v => v + 1);
      } catch (err) {
        console.warn('[Sarvam Multilingual] Batch translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    }, 120);
  }, [currentLanguage]);

  // Universal DOM Tree Scanner & Indic Auto-Translator
  const scanAndTranslateDOM = useCallback(() => {
    if (typeof document === 'undefined') return;
    const root = document.getElementById('root') || document.body;
    if (!root) return;

    isMutatingDOMRef.current = true;

    try {
      // 1. If English selected, restore all original text nodes & placeholders
      if (currentLanguage === 'en-IN') {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node: Node | null = walker.nextNode();
        while (node) {
          if (originalTextMap.has(node)) {
            const originalVal = originalTextMap.get(node);
            if (originalVal !== undefined && node.nodeValue !== originalVal) {
              node.nodeValue = originalVal;
            }
          }
          node = walker.nextNode();
        }

        // Restore placeholders
        const inputs = root.querySelectorAll('input, textarea');
        inputs.forEach(el => {
          if (originalPlaceholderMap.has(el)) {
            const origPl = originalPlaceholderMap.get(el);
            if (origPl !== undefined && el.getAttribute('placeholder') !== origPl) {
              el.setAttribute('placeholder', origPl);
            }
          }
        });

        return;
      }

      // 2. Target Indic language active: translate text nodes
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const parent = n.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (IGNORE_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.closest('[data-no-translate]') || parent.closest('.notranslate')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('svg') || parent.classList.contains('lucide')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let node: Node | null = walker.nextNode();
      while (node) {
        const text = node.nodeValue;
        if (text) {
          const trimmed = text.trim();

          // Brand name protection: never translate 'Quickfix', and restore if already translated
          if (BRAND_NAMES.has(trimmed.toLowerCase())) {
            if (node.nodeValue?.trim() !== 'Quickfix') {
              node.nodeValue = 'Quickfix';
            }
            node = walker.nextNode();
            continue;
          }

          // If text contains 'शीघ्र-समाधान' or other Indic translations of Quickfix, fix it
          if (/शीघ्र\s*[-–—]?\s*समाधान|त्वरित\s*[-–—]?\s*समाधान/i.test(text)) {
            const cleaned = preserveBrandName(text);
            if (node.nodeValue !== cleaned) {
              node.nodeValue = cleaned;
            }
          }

          // Check if candidate for translation:
          // Must have at least 2 chars, letters, not purely numeric/punctuation, not already in Indic script
          const hasLetters = /[a-zA-Z]{2,}/.test(trimmed);
          const isPureSymbols = /^[0-9\s.,:;!?₹$%()/\-#+@*&^~`'"|\\]+$/.test(trimmed);
          const isAlreadyIndic = /[\u0900-\u0DFF]/.test(trimmed);
          const isUrl = /^https?:\/\//.test(trimmed);

          if (hasLetters && !isPureSymbols && !isAlreadyIndic && !isUrl) {
            // Save original English text if first time seen
            if (!originalTextMap.has(node)) {
              originalTextMap.set(node, text);
            }

            const baseEnglish = originalTextMap.get(node) || text;
            const baseTrimmed = baseEnglish.trim();

            if (BRAND_NAMES.has(baseTrimmed.toLowerCase())) {
              if (node.nodeValue?.trim() !== 'Quickfix') {
                node.nodeValue = 'Quickfix';
              }
              node = walker.nextNode();
              continue;
            }

            const rawTranslation = getTranslationForPhrase(baseTrimmed);
            const translation = rawTranslation ? preserveBrandName(rawTranslation) : null;
            if (translation) {
              // Preserve original leading and trailing whitespace
              const leadingWs = baseEnglish.match(/^\s*/)?.[0] || '';
              const trailingWs = baseEnglish.match(/\s*$/)?.[0] || '';
              const targetFull = leadingWs + translation + trailingWs;

              if (node.nodeValue !== targetFull) {
                node.nodeValue = targetFull;
              }
            } else {
              // Enqueue for batch translation with Sarvam AI
              if (!pendingBatchQueueRef.current.has(baseTrimmed)) {
                pendingBatchQueueRef.current.add(baseTrimmed);
                scheduleBatchTranslation();
              }
            }
          }
        }
        node = walker.nextNode();
      }

      // 3. Translate Placeholders
      const inputs = root.querySelectorAll('input[placeholder], textarea[placeholder]');
      inputs.forEach(el => {
        const pl = el.getAttribute('placeholder');
        if (pl && /[a-zA-Z]{2,}/.test(pl) && !/[\u0900-\u0DFF]/.test(pl)) {
          if (!originalPlaceholderMap.has(el)) {
            originalPlaceholderMap.set(el, pl);
          }
          const basePl = originalPlaceholderMap.get(el) || pl;
          const translation = getTranslationForPhrase(basePl.trim());
          if (translation) {
            if (el.getAttribute('placeholder') !== translation) {
              el.setAttribute('placeholder', translation);
            }
          } else {
            if (!pendingBatchQueueRef.current.has(basePl.trim())) {
              pendingBatchQueueRef.current.add(basePl.trim());
              scheduleBatchTranslation();
            }
          }
        }
      });
    } finally {
      // Release lock so observer can resume watching normal mutations
      setTimeout(() => {
        isMutatingDOMRef.current = false;
      }, 50);
    }
  }, [currentLanguage, getTranslationForPhrase, scheduleBatchTranslation]);

  // Throttled trigger helper
  const triggerDOMScan = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        scanAndTranslateDOM();
      });
    }
  }, [scanAndTranslateDOM]);

  // Run DOM scan whenever language changes or dynamic data loads
  useEffect(() => {
    scanAndTranslateDOM();
    const timer = setTimeout(scanAndTranslateDOM, 300);
    return () => clearTimeout(timer);
  }, [currentLanguage, scanAndTranslateDOM]);

  // MutationObserver to auto-translate newly mounted views, route changes & modals
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let rafId: number | null = null;
    const observer = new MutationObserver(mutations => {
      if (isMutatingDOMRef.current) return;

      let hasRelevantChange = false;
      for (const m of mutations) {
        if (m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
          hasRelevantChange = true;
          break;
        }
        if (m.type === 'characterData') {
          // If a text node changed and wasn't our mutation
          const val = m.target.nodeValue || '';
          if (/[a-zA-Z]{2,}/.test(val) && !/[\u0900-\u0DFF]/.test(val)) {
            hasRelevantChange = true;
            break;
          }
        }
      }

      if (hasRelevantChange) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          scanAndTranslateDOM();
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scanAndTranslateDOM]);

  const setLanguage = useCallback((lang: SupportedLanguageCode) => {
    setCurrentLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    try {
      document.documentElement.lang = lang.split('-')[0];
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = currentLanguage.split('-')[0];
    } catch {
      // Ignore
    }
  }, [currentLanguage]);

  // Universal lookup: Static Dictionary -> English -> Dynamic Cache -> Auto Batch Queue
  const t = useCallback(
    (key: string, defaultText?: string): string => {
      if (defaultText && BRAND_NAMES.has(defaultText.trim().toLowerCase())) return defaultText;
      if (key && BRAND_NAMES.has(key.trim().toLowerCase())) return key;

      // 1. Direct key match in current language dictionary
      const currentDict = UI_DICTIONARY[currentLanguage];
      if (currentDict && currentDict[key]) {
        return preserveBrandName(currentDict[key]);
      }

      // If user selected English, return English dictionary or fallback
      if (currentLanguage === 'en-IN') {
        if (UI_DICTIONARY['en-IN'] && UI_DICTIONARY['en-IN'][key]) {
          return UI_DICTIONARY['en-IN'][key];
        }
        return defaultText !== undefined ? defaultText : key;
      }

      // 2. Check dynamic cache for key OR defaultText
      const langCache = dynamicCacheRef.current[currentLanguage];
      if (langCache) {
        if (langCache[key]) return preserveBrandName(langCache[key]);
        if (defaultText && langCache[defaultText]) return preserveBrandName(langCache[defaultText]);
      }

      // 3. Fallback to English dictionary lookup for the text representation
      const englishText = (UI_DICTIONARY['en-IN'] && UI_DICTIONARY['en-IN'][key]) || defaultText || key;

      // 4. Check if translated version exists in Sarvam cache
      const cached = getCachedSarvamTranslation(englishText, currentLanguage);
      if (cached) return preserveBrandName(cached);

      // 5. Queue for batch translation if natural text
      if (englishText && englishText.length > 1 && !englishText.startsWith('data:') && !englishText.startsWith('http')) {
        if (!BRAND_NAMES.has(englishText.trim().toLowerCase())) {
          if (!pendingBatchQueueRef.current.has(englishText)) {
            pendingBatchQueueRef.current.add(englishText);
            scheduleBatchTranslation();
          }
        }
      }

      return defaultText !== undefined ? defaultText : (UI_DICTIONARY['en-IN']?.[key] || key);
    },
    [currentLanguage, scheduleBatchTranslation]
  );

  // Explicit Dynamic Translation via Sarvam AI
  const translateDynamic = useCallback(
    async (text: string, sourceLang: SupportedLanguageCode = 'en-IN'): Promise<string> => {
      if (!text?.trim() || currentLanguage === sourceLang) return text;
      setIsTranslating(true);
      try {
        const result = await translateWithSarvam({
          text,
          targetLang: currentLanguage,
          sourceLang
        });
        return result;
      } finally {
        setIsTranslating(false);
      }
    },
    [currentLanguage]
  );

  const languageInfo =
    SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageInfo,
        setLanguage,
        t,
        translateDynamic,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isTranslating
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
