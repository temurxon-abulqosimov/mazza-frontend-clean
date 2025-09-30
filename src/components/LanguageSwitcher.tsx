import React from 'react';
import { Globe } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';

interface LanguageSwitcherProps {
  showLabel?: boolean;
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  showLabel = true, 
  compact = false 
}) => {
  const { language, setLanguage, t } = useLocalization();

  const handleLanguageChange = (newLanguage: 'uz' | 'ru') => {
    setLanguage(newLanguage);
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <Globe className="w-4 h-4 text-gray-500" />
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as 'uz' | 'ru')}
          className="text-sm border-none bg-transparent focus:outline-none focus:ring-0"
        >
          <option value="uz">UZ</option>
          <option value="ru">RU</option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {showLabel && (
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{t('language')}</span>
        </div>
      )}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleLanguageChange('uz')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            language === 'uz'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('uzbek')}
        </button>
        <button
          onClick={() => handleLanguageChange('ru')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            language === 'ru'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('russian')}
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher; 
