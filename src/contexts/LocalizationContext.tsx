import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'uz' | 'ru';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType>({
  language: 'uz',
  setLanguage: () => {},
  t: () => '',
});

interface TranslationKeys {
  [key: string]: string;
}

const translations: Record<Language, TranslationKeys> = {
  uz: {
    // Navigation
    home: 'Bosh sahifa',
    search: 'Qidirish',
    orders: 'Buyurtmalar',
    profile: 'Profil',
    
    // Common
    loading: 'Yuklanmoqda...',
    retry: 'Qayta urinish',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    
    // Dashboard
    dashboard: 'Boshqaruv paneli',
    analytics: 'Tahlil',
    products: 'Mahsulotlar',
    
    // Messages
    success: 'Muvaffaqiyat',
    error: 'Xatolik',
    
    // Home page
    discover: 'Mahsulotlarni topish',
    searchProducts: 'Mahsulotlarni qidirish...',
    allCategories: 'Barcha kategoriyalar',
    featuredProducts: 'Tavsiya etilgan mahsulotlar',
    
    // Business types
    bakery: 'Nonvoyxona',
    restaurant: 'Restoran',
    cafe: 'Kafe',
    grocery: 'Oziq-ovqat do\'koni',
    
    // Seller Dashboard
    myStore: 'Mening do\'konim',
    myProducts: 'Mening mahsulotlarim',
    totalProducts: 'Jami mahsulotlar',
    totalOrders: 'Jami buyurtmalar',
    revenue: 'Daromad',
    rating: 'Baho',
    quickActions: 'Tezkor amallar',
    addProduct: 'Mahsulot qo\'shish',
    viewOrders: 'Buyurtmalarni ko\'rish',
    recentOrders: 'So\'nggi buyurtmalar',
    noOrdersYet: 'Hali buyurtma yo\'q',
    
    // Order statuses
    filterByStatus: 'Holat bo\'yicha filtr',
    allStatuses: 'Barcha holatlar',
    pending: 'Kutilmoqda',
    confirmed: 'Tasdiqlangan',
    preparing: 'Tayyorlanmoqda',
    ready: 'Tayyor',
    delivered: 'Yetkazilgan',
    cancelled: 'Bekor qilingan',
    
    // Notifications
    productDeleted: 'Mahsulot ochirildi',
    productDeletedSuccess: 'Mahsulot muvaffaqiyatli ochirildi.',
    deleteFailed: 'ochirishda xatolik',
    deleteFailedMessage: 'Mahsulotni ochirishda xatolik. Qayta urinib koring.',
    orderUpdated: 'Buyurtma yangilandi',
    orderStatusChanged: 'Buyurtma holati ozgartirildi',
    updateFailed: 'Yangilashda xatolik',
    updateFailedMessage: 'Buyurtma holatini yangilashda xatolik.',
    imageUploaded: 'Rasm yuklandi',
    businessImageUpdated: 'Biznes rasmi yangilandi.',
    uploadFailed: 'Yuklashda xatolik',
    uploadFailedMessage: 'Rasmni yuklashda xatolik. Qayta urinib koring.',
  },
  ru: {
    // Navigation
    home: 'Главная',
    search: 'Поиск',
    orders: 'Заказы',
    profile: 'Профиль',
    
    // Common
    loading: 'Загрузка...',
    retry: 'Повторить',
    save: 'Сохранить',
    cancel: 'Отмена',
    
    // Dashboard
    dashboard: 'Панель управления',
    analytics: 'Аналитика',
    products: 'Товары',
    
    // Messages
    success: 'Успех',
    error: 'Ошибка',
    
    // Home page
    discover: 'Найти товары',
    searchProducts: 'Поиск товаров...',
    allCategories: 'Все категории',
    featuredProducts: 'Рекомендуемые товары',
    
    // Business types
    bakery: 'Пекарня',
    restaurant: 'Ресторан',
    cafe: 'Кафе',
    grocery: 'Продуктовый магазин',
    
    // Seller Dashboard
    myStore: 'Мой магазин',
    myProducts: 'Мои товары',
    totalProducts: 'Всего товаров',
    totalOrders: 'Всего заказов',
    revenue: 'Доход',
    rating: 'Рейтинг',
    quickActions: 'Быстрые действия',
    addProduct: 'Добавить товар',
    viewOrders: 'Просмотр заказов',
    recentOrders: 'Последние заказы',
    noOrdersYet: 'Заказов пока нет',
    
    // Order statuses
    filterByStatus: 'Фильтр по статусу',
    allStatuses: 'Все статусы',
    pending: 'Ожидает',
    confirmed: 'Подтвержден',
    preparing: 'Готовится',
    ready: 'Готов',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
    
    // Notifications
    productDeleted: 'Товар удален',
    productDeletedSuccess: 'Товар успешно удален.',
    deleteFailed: 'Ошибка удаления',
    deleteFailedMessage: 'Ошибка при удалении товара. Попробуйте снова.',
    orderUpdated: 'Заказ обновлен',
    orderStatusChanged: 'Статус заказа изменен',
    updateFailed: 'Ошибка обновления',
    updateFailedMessage: 'Ошибка при обновлении статуса заказа.',
    imageUploaded: 'Изображение загружено',
    businessImageUpdated: 'Изображение бизнеса обновлено.',
    uploadFailed: 'Ошибка загрузки',
    uploadFailedMessage: 'Ошибка при загрузке изображения. Попробуйте снова.',
  }
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('uz');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // You can add logic here to persist language preference
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'uz' || savedLanguage === 'ru')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};







