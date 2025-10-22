// Time formatting utilities for consistent display across the app

export const formatTime = (isoString: string, language: 'uz' | 'ru' = 'uz'): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Use 24-hour format for consistency
  };
  
  return date.toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'ru-RU', options);
};

export const formatDateTime = (isoString: string, language: 'uz' | 'ru' = 'uz'): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', options);
};

export const formatDate = (isoString: string, language: 'uz' | 'ru' = 'uz'): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', options);
};

export const formatRelativeTime = (isoString: string, language: 'uz' | 'ru' = 'uz'): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 0) {
    // Past time
    const absDiff = Math.abs(diffInMinutes);
    if (absDiff < 60) {
      return language === 'uz' ? `${absDiff} daqiqa oldin` : `${absDiff} минут назад`;
    } else if (absDiff < 1440) {
      const hours = Math.floor(absDiff / 60);
      return language === 'uz' ? `${hours} soat oldin` : `${hours} часов назад`;
    } else {
      const days = Math.floor(absDiff / 1440);
      return language === 'uz' ? `${days} kun oldin` : `${days} дней назад`;
    }
  } else {
    // Future time
    if (diffInMinutes < 60) {
      return language === 'uz' ? `${diffInMinutes} daqiqadan keyin` : `через ${diffInMinutes} минут`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return language === 'uz' ? `${hours} soatdan keyin` : `через ${hours} часов`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return language === 'uz' ? `${days} kundan keyin` : `через ${days} дней`;
    }
  }
};

export const isTimeExpired = (isoString: string): boolean => {
  if (!isoString) return true;
  
  const date = new Date(isoString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return true;
  
  return date.getTime() < new Date().getTime();
};
