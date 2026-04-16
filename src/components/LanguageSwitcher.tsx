import { useLanguage } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();

  if (variant === 'dark') {
    return (
      <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5 border border-white/15">
        <button
          onClick={() => setLang('en')}
          className={`px-2.5 py-1 rounded-md text-[12px] transition-all ${
            lang === 'en'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/50 hover:text-white/80'
          }`}
          style={{ fontWeight: lang === 'en' ? 700 : 400 }}
          title="English"
        >
          EN
        </button>
        <button
          onClick={() => setLang('vi')}
          className={`px-2.5 py-1 rounded-md text-[12px] transition-all ${
            lang === 'vi'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/50 hover:text-white/80'
          }`}
          style={{ fontWeight: lang === 'vi' ? 700 : 400 }}
          title="Tiếng Việt"
        >
          VI
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
      <button
        onClick={() => setLang('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] transition-all ${
          lang === 'en'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        style={{ fontWeight: lang === 'en' ? 700 : 400 }}
        title="English"
      >
        <span>🇺🇸</span> EN
      </button>
      <button
        onClick={() => setLang('vi')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] transition-all ${
          lang === 'vi'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        style={{ fontWeight: lang === 'vi' ? 700 : 400 }}
        title="Tiếng Việt"
      >
        <span>🇻🇳</span> VI
      </button>
    </div>
  );
}
