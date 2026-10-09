export type SupportedLanguageCode =
  | 'en-IN'
  | 'hi-IN'
  | 'mr-IN'
  | 'gu-IN'
  | 'bn-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'pa-IN'
  | 'od-IN';

export interface LanguageInfo {
  code: SupportedLanguageCode;
  shortCode: string;
  name: string;
  nativeName: string;
  scriptBadge: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en-IN', shortCode: 'en', name: 'English', nativeName: 'English', scriptBadge: 'EN' },
  { code: 'hi-IN', shortCode: 'hi', name: 'Hindi', nativeName: 'हिन्दी', scriptBadge: 'हि' },
  { code: 'mr-IN', shortCode: 'mr', name: 'Marathi', nativeName: 'मराठी', scriptBadge: 'म' },
  { code: 'gu-IN', shortCode: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', scriptBadge: 'ગુ' },
  { code: 'bn-IN', shortCode: 'bn', name: 'Bengali', nativeName: 'বাংলা', scriptBadge: 'বা' },
  { code: 'ta-IN', shortCode: 'ta', name: 'Tamil', nativeName: 'தமிழ்', scriptBadge: 'த' },
  { code: 'te-IN', shortCode: 'te', name: 'Telugu', nativeName: 'తెలుగు', scriptBadge: 'తె' },
  { code: 'kn-IN', shortCode: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', scriptBadge: 'ಕ' },
  { code: 'ml-IN', shortCode: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', scriptBadge: 'മ' },
  { code: 'pa-IN', shortCode: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', scriptBadge: 'ਪੰ' },
  { code: 'od-IN', shortCode: 'od', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', scriptBadge: 'ଓ' },
];
