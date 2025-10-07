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
    noRatingsYet: 'Hali baho yo\'q',
    
    // Home page
    discover: 'Mahsulotlarni topish',
    searchProducts: 'Mahsulotlarni qidirish...',
    allCategories: 'Barcha kategoriyalar',
    featuredProducts: 'Tavsiya etilgan mahsulotlar',
    
    // Search page
    searchPlaceholder: 'Mahsulotlar yoki sotuvchilarni qidiring...',
    filters: 'Filtrlar',
    clear: 'Tozalash',
    distance: 'Masofa',
    price: 'Narx',
    newest: 'Yangi',
    min: 'Min',
    max: 'Max',
    noResults: 'Natija topilmadi',
    tryAdjustingSearch: 'Qidiruv yoki filtrlarni o\'zgartiring',
    
    // Register page
    registerAs: 'Ro\'yxatdan o\'tish',
    registerAsUser: 'Foydalanuvchi sifatida',
    registerAsSeller: 'Sotuvchi sifatida',
    businessName: 'Biznes nomi',
    businessNamePlaceholder: 'Biznesingiz nomi',
    phoneNumber: 'Telefon raqami',
    language: 'Til',
    businessType: 'Biznes turi',
    openingHours: 'Ish vaqti',
    opensAt: 'Ochilish vaqti',
    closesAt: 'Yopilish vaqti',
    registering: 'Ro\'yxatdan o\'tkazilmoqda...',
    registerButton: 'Ro\'yxatdan o\'tish',
    registrationFailed: 'Ro\'yxatdan o\'tish muvaffaqiyatsiz. Qayta urinib ko\'ring.',
    
    // Product form
    addProduct: 'Mahsulot qo\'shish',
    editProduct: 'Mahsulotni tahrirlash',
    productDescription: 'Mahsulot tavsifi',
    productDescriptionPlaceholder: 'Mahsulot tavsifini kiriting',
    salePrice: 'Sotish narxi',
    originalPrice: 'Asl narx (ixtiyoriy)',
    quantity: 'Miqdor',
    availableUntil: 'Mavjud bo\'lish muddati',
    availableFrom: 'Mavjud bo\'lish vaqti',
    category: 'Kategoriya',
    productDescriptionRequired: 'Mahsulot tavsifi kiritilishi shart',
    productDescriptionMinLength: 'Mahsulot tavsifi kamida 3 ta belgi bo\'lishi kerak',
    validPriceRequired: 'To\'g\'ri narx kiritilishi shart',
    availableUntilRequired: 'Mavjud bo\'lish muddati kiritilishi shart',
    productCreated: 'Mahsulot muvaffaqiyatli yaratildi',
    productUpdated: 'Mahsulot muvaffaqiyatli yangilandi',
    productCreateError: 'Mahsulot yaratishda xatolik',
    productUpdateError: 'Mahsulot yangilashda xatolik',
    
    // Product display
    unknownSeller: 'Noma\'lum sotuvchi',
    freshSurplusFood: 'Yangilangan ortiqcha oziq-ovqat mavjud',
    quantityAvailable: 'mavjud',
    nearby: 'Yaqin atrofda',
    open: 'Ochiq',
    closed: 'Yopiq',
    store: 'Do\'kon',
    grocery: 'Oziq-ovqat do\'koni',
    pleaseRegister: 'Iltimos, avval Telegram bot orqali ro\'yxatdan o\'ting.',
    accessDenied: 'Kirish rad etildi. Iltimos, qo\'llab-quvvatlash xizmati bilan bog\'laning.',
    failedToLoadHome: 'Bosh sahifa ma\'lumotlarini yuklashda xatolik',
    failedToLoadDashboard: 'Boshqaruv paneli ma\'lumotlarini yuklashda xatolik',
    searchFailed: 'Qidiruv muvaffaqiyatsiz. Qayta urinib ko\'ring.',
    
    // Business types
    bakery: 'Nonvoyxona',
    restaurant: 'Restoran',
    cafe: 'Kafe',
    
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
    
    // Product Categories
    breadBakery: 'Non va pishiriq',
    pastry: 'Pishiriq',
    mainDishes: 'Asosiy taomlar',
    desserts: 'Shirinliklar',
    beverages: 'Ichimliklar',
    other: 'Boshqa',
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
    openTelegramBot: 'Telegram botni ochish',
    
    // Roles
    user: 'Foydalanuvchi',
    seller: 'Sotuvchi',
    admin: 'Administrator',
    
    // Business Types
    pharmacy: 'Dorixona',
    
    // User Dashboard specific
    searchResults: 'Qidiruv natijalari',
    myOrders: 'Mening buyurtmalarim',
    noOrdersYet: 'Hali buyurtma yo\'q',
    startExploringProducts: 'Birinchi buyurtmangizni berish uchun mahsulotlarni o\'rganishni boshlang!',
    orderNumber: 'Buyurtma #',
    searchButton: 'Qidirish',
    
    // Language names
    uzbek: 'O\'zbek',
    russian: 'Русский',
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
    noRatingsYet: 'Пока нет оценок',
    
    // Home page
    discover: 'Найти товары',
    searchProducts: 'Поиск товаров...',
    allCategories: 'Все категории',
    featuredProducts: 'Рекомендуемые товары',
    
    // Search page
    searchPlaceholder: 'Поиск товаров или продавцов...',
    filters: 'Фильтры',
    clear: 'Очистить',
    distance: 'Расстояние',
    price: 'Цена',
    newest: 'Новое',
    min: 'Мин',
    max: 'Макс',
    noResults: 'Результаты не найдены',
    tryAdjustingSearch: 'Попробуйте изменить поиск или фильтры',
    
    // Register page
    registerAs: 'Регистрация',
    registerAsUser: 'Как пользователь',
    registerAsSeller: 'Как продавец',
    businessName: 'Название бизнеса',
    businessNamePlaceholder: 'Название вашего бизнеса',
    phoneNumber: 'Номер телефона',
    language: 'Язык',
    businessType: 'Тип бизнеса',
    openingHours: 'Часы работы',
    opensAt: 'Время открытия',
    closesAt: 'Время закрытия',
    registering: 'Регистрация...',
    registerButton: 'Зарегистрироваться',
    registrationFailed: 'Регистрация не удалась. Попробуйте еще раз.',
    
    // Product form
    addProduct: 'Добавить товар',
    editProduct: 'Редактировать товар',
    productDescription: 'Описание товара',
    productDescriptionPlaceholder: 'Введите описание товара',
    salePrice: 'Цена продажи',
    originalPrice: 'Оригинальная цена (необязательно)',
    quantity: 'Количество',
    availableUntil: 'Доступно до',
    availableFrom: 'Доступно с',
    category: 'Категория',
    productDescriptionRequired: 'Описание товара обязательно',
    productDescriptionMinLength: 'Описание товара должно содержать минимум 3 символа',
    validPriceRequired: 'Требуется корректная цена',
    availableUntilRequired: 'Требуется дата доступности',
    productCreated: 'Товар успешно создан',
    productUpdated: 'Товар успешно обновлен',
    productCreateError: 'Ошибка создания товара',
    productUpdateError: 'Ошибка обновления товара',
    
    // Product display
    unknownSeller: 'Неизвестный продавец',
    freshSurplusFood: 'Свежие излишки еды доступны',
    quantityAvailable: 'доступно',
    nearby: 'Рядом',
    open: 'Открыто',
    closed: 'Закрыто',
    store: 'Магазин',
    grocery: 'Продуктовый магазин',
    pleaseRegister: 'Пожалуйста, сначала зарегистрируйтесь через Telegram бота.',
    accessDenied: 'Доступ запрещен. Пожалуйста, обратитесь в службу поддержки.',
    failedToLoadHome: 'Ошибка загрузки данных главной страницы',
    failedToLoadDashboard: 'Ошибка загрузки данных панели управления',
    searchFailed: 'Поиск не удался. Попробуйте еще раз.',
    
    // Business types
    bakery: 'Пекарня',
    restaurant: 'Ресторан',
    cafe: 'Кафе',
    
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
    
    
    // Product Categories
    breadBakery: 'Хлеб и выпечка',
    pastry: 'Выпечка',
    mainDishes: 'Основные блюда',
    desserts: 'Десерты',
    beverages: 'Напитки',
    other: 'Другое',
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
    openTelegramBot: 'Открыть Telegram бота',
    
    // Roles
    user: 'Пользователь',
    seller: 'Продавец',
    admin: 'Администратор',
    
    // Business Types
    pharmacy: 'Аптека',
    
    // User Dashboard specific
    searchResults: 'Результаты поиска',
    myOrders: 'Мои заказы',
    noOrdersYet: 'Заказов пока нет',
    startExploringProducts: 'Начните изучать товары, чтобы сделать первый заказ!',
    orderNumber: 'Заказ #',
    searchButton: 'Поиск',
    
    // Language names
    uzbek: 'O\'zbek',
    russian: 'Русский',
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







