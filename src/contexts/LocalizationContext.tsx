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
    available: 'Mavjud',
    
    // Dashboard
    dashboard: 'Boshqaruv paneli',
    analytics: 'Tahlil',
    products: 'Mahsulotlar',
    
    // Messages
    success: 'Muvaffaqiyat',
    error: 'Xatolik',
    noRatingsYet: 'Hali baho yo\'q',
    quantityExceedsAvailable: 'Miqdor mavjud miqdordan oshib ketdi',
    
    // Home page
    discover: 'Mahsulotlarni topish',
    searchProducts: 'Mahsulotlarni qidirish...',
    allCategories: 'Barcha kategoriyalar',
    featuredProducts: 'Tavsiya etilgan mahsulotlar',
    
    // Search page
    searchPlaceholder: 'Mahsulotlar yoki sotuvchilarni qidiring...',
    filters: 'Filtrlar',
    clear: 'Tozalash',
    distance: 'km',
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
    markComplete: 'Yakunlandi deb belgilash',
    
    // Status Messages
    warning: 'Ogohlantirish',
    info: 'Ma\'lumot',
    
    // User Profile
    profile: 'Profil',
    personalInfo: 'Shaxsiy ma\'lumotlar',
    businessInfo: 'Biznes ma\'lumotlari',
    settings: 'Sozlamalar',
    logout: 'Chiqish',
    accountSection: 'Hisob bo\'limi',
    settingsSection: 'Sozlamalar bo\'limi',
    til: 'Til',
    
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
    
    // Search and filtering
    searchProductsAndStores: 'Mahsulotlar va do\'konlarni qidirish...',
    noProductsFound: 'Mahsulot topilmadi',
    tryDifferentSearch: 'Boshqa qidiruv so\'zini sinab ko\'ring',
    
    // Product Details
    productDetails: 'Mahsulot tafsilotlari',
    productNotFound: 'Mahsulot topilmadi',
    goBack: 'Orqaga',
    confirmYourOrder: 'Buyurtmangizni tasdiqlang',
    product: 'Mahsulot',
    unitPrice: 'Birlik narxi',
    savings: 'Tejash',
    total: 'Jami',
    so_m: 'so\'m',
    confirmOrder: 'Buyurtmani tasdiqlash',
    
    // Additional translations for beautiful UI
    createNewProduct: 'Yangi mahsulot yaratish',
    updateProductDetails: 'Mahsulot ma\'lumotlarini yangilash',
    productImage: 'Mahsulot rasmi',
    pricing: 'Narxlash',
    availability: 'Mavjudlik',
    businessImage: 'Biznes rasmi',
    businessInformation: 'Biznes ma\'lumotlari',
    manageYourBusinessProfile: 'Biznes profilingizni boshqaring',
    manageYourAccount: 'Hisobingizni boshqaring',
    manageNotifications: 'Bildirishnomalarni boshqaring',
    signOutOfAccount: 'Hisobdan chiqish',
    clearSearch: 'Qidiruvni tozalash',
    items: 'ta',
    placingOrder: 'Buyurtma berilmoqda...',
    placing: 'Berilmoqda...',
    orderFailed: 'Buyurtma muvaffaqiyatsiz',
    orderFailedMessage: 'Buyurtma berishda xatolik. Qayta urinib ko\'ring yoki qo\'llab-quvvatlash xizmati bilan bog\'laning.',
    userNotFound: 'Foydalanuvchi topilmadi. Sahifani yangilang va qayta urinib ko\'ring.',
    failedToLoadProduct: 'Mahsulotni yuklashda xatolik. Qayta urinib ko\'ring.',
    kmAway: 'km uzoqlikda',
    
    // Account Settings
    accountSettings: 'Hisob sozlamalari',
    personalInformation: 'Shaxsiy ma\'lumotlar',
    contactInformation: 'Aloqa ma\'lumotlari',
    preferences: 'Sozlamalar',
    emailPlaceholder: 'your@email.com',
    phonePlaceholder: '+998 90 123 45 67',
    saving: 'Saqlanmoqda...',
    saveChanges: 'O\'zgarishlarni saqlash',
    settingsSavedSuccessfully: 'Sozlamalar muvaffaqiyatli saqlandi',
    
    // Location Services
    locationPermissionTitle: 'Joylashuv ruxsati',
    locationPermissionMessage: 'Sizga yaqin mahsulotlarni ko\'rsatish uchun joylashuvingizni bilishimiz kerak.',
    locationPermissionDenied: 'Joylashuv ruxsati rad etildi. Sizga yaqin mahsulotlar ko\'rsatilmaydi.',
    locationPermissionGranted: 'Joylashuv ruxsati berildi. Yaqin mahsulotlar yuklanmoqda...',
    locationError: 'Joylashuvni aniqlashda xatolik. Qayta urinib ko\'ring.',
    enableLocation: 'Joylashuvni yoqish',
    locationRequired: 'Joylashuv talab qilinadi',
    locationRequiredMessage: 'Mahsulotlarni ko\'rish uchun joylashuv ruxsati kerak.',
    
    // Search Results and Product Cards
    viewDetails: 'Tafsilotlarni ko\'rish',
    until: 'gacha',
    discount: 'Chegirma',
    
    // Order Notifications
    orderConfirmed: 'Buyurtma tasdiqlandi',
    orderConfirmationMessage: 'Buyurtmangiz muvaffaqiyatli yaratildi',
    orderCreated: 'Yangi buyurtma',
    orderCreatedMessage: 'Sizga yangi buyurtma keldi',
    orderStatusChangedMessage: 'Buyurtma holati yangilandi',
    orderCancelled: 'Buyurtma bekor qilindi',
    orderCancelledMessage: 'Buyurtma bekor qilindi',
    orderDelivered: 'Buyurtma yetkazildi',
    orderDeliveredMessage: 'Buyurtma muvaffaqiyatli yetkazildi',
    
    // Seller Notifications
    productStatusChanged: 'Mahsulot holati o\'zgartirildi',
    productStatusChangedMessage: 'Mahsulot holati yangilandi',
    newOrderReceived: 'Yangi buyurtma',
    newOrderReceivedMessage: 'Sizga yangi buyurtma keldi',
    orderUpdatedMessage: 'Buyurtma ma\'lumotlari yangilandi',
    
    // Notification Types
    notification: 'Bildirishnoma',
    notifications: 'Bildirishnomalar',
    markAsRead: 'O\'qilgan deb belgilash',
    markAllAsRead: 'Barchasini o\'qilgan deb belgilash',
    noNotifications: 'Bildirishnoma yo\'q',
    noNotificationsMessage: 'Hali bildirishnoma yo\'q',
    justNow: 'Hozir',
    minutesAgo: 'daqiqa oldin',
    hoursAgo: 'soat oldin',
    daysAgo: 'kun oldin',
    all: 'Barchasi',
    unread: 'O\'qilmagan',
    
    // Order details
    contactSeller: 'Sotuvchi bilan bog\'lanish',
    reorder: 'Qayta buyurtma berish',
    loadingOrders: 'Buyurtmalar yuklanmoqda...',
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
    available: 'Доступно',
    
    // Dashboard
    dashboard: 'Панель управления',
    analytics: 'Аналитика',
    products: 'Товары',
    
    // Messages
    success: 'Успех',
    error: 'Ошибка',
    noRatingsYet: 'Пока нет оценок',
    quantityExceedsAvailable: 'Количество превышает доступное',
    
    // Home page
    discover: 'Найти товары',
    searchProducts: 'Поиск товаров...',
    allCategories: 'Все категории',
    featuredProducts: 'Рекомендуемые товары',
    
    // Search page
    searchPlaceholder: 'Поиск товаров или продавцов...',
    filters: 'Фильтры',
    clear: 'Очистить',
    distance: 'км',
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
    markComplete: 'Отметить как выполнен',
    
    // Status Messages
    warning: 'Предупреждение',
    info: 'Информация',
    
    // User Profile
    profile: 'Профиль',
    personalInfo: 'Личная информация',
    businessInfo: 'Информация о бизнесе',
    settings: 'Настройки',
    logout: 'Выйти',
    accountSection: 'Раздел аккаунта',
    settingsSection: 'Раздел настроек',
    til: 'Язык',
    
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
    
    // Search and filtering
    searchProductsAndStores: 'Поиск товаров и магазинов...',
    noProductsFound: 'Товары не найдены',
    tryDifferentSearch: 'Попробуйте другие поисковые слова',
    
    // Product Details
    productDetails: 'Детали товара',
    productNotFound: 'Товар не найден',
    goBack: 'Назад',
    confirmYourOrder: 'Подтвердите ваш заказ',
    product: 'Товар',
    unitPrice: 'Цена за единицу',
    savings: 'Экономия',
    total: 'Итого',
    so_m: 'сум',
    confirmOrder: 'Подтвердить заказ',
    
    // Additional translations for beautiful UI
    createNewProduct: 'Создать новый товар',
    updateProductDetails: 'Обновить детали товара',
    productImage: 'Изображение товара',
    pricing: 'Ценообразование',
    availability: 'Доступность',
    businessImage: 'Изображение бизнеса',
    businessInformation: 'Информация о бизнесе',
    manageYourBusinessProfile: 'Управление профилем бизнеса',
    manageYourAccount: 'Управление аккаунтом',
    manageNotifications: 'Управление уведомлениями',
    signOutOfAccount: 'Выйти из аккаунта',
    clearSearch: 'Очистить поиск',
    items: 'шт',
    placingOrder: 'Размещение заказа...',
    placing: 'Размещение...',
    orderFailed: 'Заказ не удался',
    orderFailedMessage: 'Не удалось разместить заказ. Попробуйте еще раз или обратитесь в службу поддержки.',
    userNotFound: 'Пользователь не найден. Обновите страницу и попробуйте еще раз.',
    failedToLoadProduct: 'Ошибка загрузки товара. Попробуйте еще раз.',
    kmAway: 'км от вас',
    
    // Account Settings
    accountSettings: 'Настройки аккаунта',
    personalInformation: 'Личная информация',
    contactInformation: 'Контактная информация',
    preferences: 'Настройки',
    emailPlaceholder: 'your@email.com',
    phonePlaceholder: '+998 90 123 45 67',
    saving: 'Сохранение...',
    saveChanges: 'Сохранить изменения',
    settingsSavedSuccessfully: 'Настройки успешно сохранены',
    
    // Location Services
    locationPermissionTitle: 'Разрешение на местоположение',
    locationPermissionMessage: 'Нам нужно знать ваше местоположение, чтобы показать товары рядом с вами.',
    locationPermissionDenied: 'Разрешение на местоположение отклонено. Близкие товары не будут показаны.',
    locationPermissionGranted: 'Разрешение на местоположение предоставлено. Загружаются близкие товары...',
    locationError: 'Ошибка определения местоположения. Попробуйте еще раз.',
    enableLocation: 'Включить местоположение',
    locationRequired: 'Требуется местоположение',
    locationRequiredMessage: 'Для просмотра товаров требуется разрешение на местоположение.',
    
    // Search Results and Product Cards
    viewDetails: 'Просмотр деталей',
    until: 'до',
    discount: 'Скидка',
    
    // Order Notifications
    orderConfirmed: 'Заказ подтвержден',
    orderConfirmationMessage: 'Ваш заказ успешно создан',
    orderCreated: 'Новый заказ',
    orderCreatedMessage: 'У вас новый заказ',
    orderStatusChangedMessage: 'Статус заказа обновлен',
    orderCancelled: 'Заказ отменен',
    orderCancelledMessage: 'Заказ отменен',
    orderDelivered: 'Заказ доставлен',
    orderDeliveredMessage: 'Заказ успешно доставлен',
    
    // Seller Notifications
    productStatusChanged: 'Статус товара изменен',
    productStatusChangedMessage: 'Статус товара обновлен',
    newOrderReceived: 'Новый заказ',
    newOrderReceivedMessage: 'У вас новый заказ',
    orderUpdatedMessage: 'Информация о заказе обновлена',
    
    // Notification Types
    notification: 'Уведомление',
    notifications: 'Уведомления',
    markAsRead: 'Отметить как прочитанное',
    markAllAsRead: 'Отметить все как прочитанные',
    noNotifications: 'Нет уведомлений',
    noNotificationsMessage: 'Пока нет уведомлений',
    justNow: 'Сейчас',
    minutesAgo: 'минут назад',
    hoursAgo: 'часов назад',
    daysAgo: 'дней назад',
    all: 'Все',
    unread: 'Непрочитанные',
    
    // Order details
    contactSeller: 'Связаться с продавцом',
    reorder: 'Повторить заказ',
    loadingOrders: 'Загрузка заказов...',
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







