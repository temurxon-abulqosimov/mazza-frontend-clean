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
    
    // Product Form
    addProduct: 'Mahsulot qo\'shish',
    editProduct: 'Mahsulotni tahrirlash',
    productImage: 'Mahsulot rasmi',
    productImageDescription: 'Bu mahsulot sizning biznes rasmingizdan foydalanadi',
    yourBusiness: 'Sizning biznesingiz',
    productDescription: 'Mahsulot tavsifi',
    productDescriptionPlaceholder: 'Mahsulotingizni tavsiflang...',
    salePrice: 'Sotish narxi',
    originalPrice: 'Asl narx',
    quantityAvailable: 'Mavjud miqdor',
    category: 'Kategoriya',
    availableFrom: 'Mavjud bo\'lish vaqti (ixtiyoriy)',
    availableUntil: 'Mavjud bo\'lish muddati',
    createProduct: 'Mahsulot yaratish',
    updateProduct: 'Mahsulotni yangilash',
    productCreated: 'Mahsulot muvaffaqiyatli yaratildi',
    productUpdated: 'Mahsulot muvaffaqiyatli yangilandi',
    productCreationFailed: 'Mahsulot yaratishda xatolik',
    productUpdateFailed: 'Mahsulot yangilashda xatolik',
    
    // Product Categories
    food: 'Oziq-ovqat',
    drinks: 'Ichimliklar',
    electronics: 'Elektronika',
    clothing: 'Kiyim',
    books: 'Kitoblar',
    sports: 'Sport',
    beauty: 'Go\'zallik',
    homeCategory: 'Uy',
    automotive: 'Avtomobil',
    
    // Form Validation
    required: 'Majburiy maydon',
    invalidPrice: 'Noto\'g\'ri narx',
    invalidQuantity: 'Noto\'g\'ri miqdor',
    invalidDate: 'Noto\'g\'ri sana',
    nameRequired: 'Mahsulot nomi kiritilishi shart',
    priceRequired: 'Narx kiritilishi shart',
    quantityRequired: 'Miqdor kiritilishi shart',
    dateRequired: 'Sana kiritilishi shart',
    
    // Common Actions
    back: 'Orqaga',
    next: 'Keyingi',
    submit: 'Yuborish',
    edit: 'Tahrirlash',
    delete: 'O\'chirish',
    view: 'Ko\'rish',
    close: 'Yopish',
    confirm: 'Tasdiqlash',
    
    // Status Messages
    warning: 'Ogohlantirish',
    info: 'Ma\'lumot',
    
    // User Profile
    profile: 'Profil',
    personalInfo: 'Shaxsiy ma\'lumotlar',
    businessInfo: 'Biznes ma\'lumotlari',
    settings: 'Sozlamalar',
    logout: 'Chiqish',
    
    // Registration
    registration: 'Ro\'yxatdan o\'tish',
    registrationRequired: 'Ro\'yxatdan o\'tish talab qilinadi',
    registrationInstructions: 'Bu mini ilovadan foydalanish uchun avval Telegram botimizda ro\'yxatdan o\'ting.',
    howToRegister: 'Qanday ro\'yxatdan o\'tish:',
    step1: '1. Quyidagi tugmani bosing va botimizni oching',
    step2: '2. Bot bilan suhbatni boshlang',
    step3: '3. Ro\'yxatdan o\'tish jarayonini bajaring',
    step4: '4. Rolingizni tanlang (Foydalanuvchi/Sotuvchi/Admin)',
    step5: '5. Bu mini ilovaga qayting',
    afterRegistration: 'Ro\'yxatdan o\'tgandan so\'ng, sahifani yangilang va dashboardingizga kirish uchun.',
    refreshPage: 'Sahifani yangilash',
    
    // Roles
    user: 'Foydalanuvchi',
    seller: 'Sotuvchi',
    admin: 'Administrator',
    
    // Business Types
    pharmacy: 'Dorixona',
  },
  ru: {
    // Navigation
    home: 'Главная',
    search: 'Поиск',
    orders: 'Заказы',
    
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
    
    // Product Form
    addProduct: 'Добавить товар',
    editProduct: 'Редактировать товар',
    productImage: 'Изображение товара',
    productImageDescription: 'Этот товар будет использовать изображение вашего бизнеса',
    yourBusiness: 'Ваш бизнес',
    productDescription: 'Описание товара',
    productDescriptionPlaceholder: 'Опишите ваш товар...',
    salePrice: 'Цена продажи',
    originalPrice: 'Оригинальная цена',
    quantityAvailable: 'Доступное количество',
    category: 'Категория',
    availableFrom: 'Доступно с (необязательно)',
    availableUntil: 'Доступно до',
    createProduct: 'Создать товар',
    updateProduct: 'Обновить товар',
    productCreated: 'Товар успешно создан',
    productUpdated: 'Товар успешно обновлен',
    productCreationFailed: 'Ошибка создания товара',
    productUpdateFailed: 'Ошибка обновления товара',
    
    // Product Categories
    food: 'Еда',
    drinks: 'Напитки',
    electronics: 'Электроника',
    clothing: 'Одежда',
    books: 'Книги',
    sports: 'Спорт',
    beauty: 'Красота',
    homeCategory: 'Дом',
    automotive: 'Автомобили',
    
    // Form Validation
    required: 'Обязательное поле',
    invalidPrice: 'Неверная цена',
    invalidQuantity: 'Неверное количество',
    invalidDate: 'Неверная дата',
    nameRequired: 'Название товара обязательно',
    priceRequired: 'Цена обязательна',
    quantityRequired: 'Количество обязательно',
    dateRequired: 'Дата обязательна',
    
    // Common Actions
    back: 'Назад',
    next: 'Далее',
    submit: 'Отправить',
    edit: 'Редактировать',
    delete: 'Удалить',
    view: 'Просмотр',
    close: 'Закрыть',
    confirm: 'Подтвердить',
    
    // Status Messages
    warning: 'Предупреждение',
    info: 'Информация',
    
    // User Profile
    profile: 'Профиль',
    personalInfo: 'Личная информация',
    businessInfo: 'Информация о бизнесе',
    settings: 'Настройки',
    logout: 'Выйти',
    
    // Registration
    registration: 'Регистрация',
    registrationRequired: 'Требуется регистрация',
    registrationInstructions: 'Для использования этого мини-приложения сначала зарегистрируйтесь в нашем Telegram боте.',
    howToRegister: 'Как зарегистрироваться:',
    step1: '1. Нажмите кнопку ниже, чтобы открыть нашего бота',
    step2: '2. Начните разговор с ботом',
    step3: '3. Следуйте процессу регистрации',
    step4: '4. Выберите свою роль (Пользователь/Продавец/Админ)',
    step5: '5. Вернитесь к этому мини-приложению',
    afterRegistration: 'После регистрации обновите страницу для доступа к вашей панели управления.',
    refreshPage: 'Обновить страницу',
    
    // Roles
    user: 'Пользователь',
    seller: 'Продавец',
    admin: 'Администратор',
    
    // Business Types
    pharmacy: 'Аптека',
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







