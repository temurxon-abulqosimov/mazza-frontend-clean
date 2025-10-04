# Telegram Bot Commands for Mini App

## Required Bot Commands

Add these commands to your Telegram bot:

### 1. Main Menu with Mini App Button

```javascript
// In your bot's main menu handler
const mainMenuKeyboard = {
  inline_keyboard: [
    [
      {
        text: "🏠 Open Mini App",
        web_app: {
          url: "https://your-webapp-url.com"
        }
      }
    ],
    [
      {
        text: "👤 My Profile",
        callback_data: "profile"
      },
      {
        text: "📋 My Orders", 
        callback_data: "orders"
      }
    ],
    [
      {
        text: "🛍️ Browse Products",
        callback_data: "browse"
      },
      {
        text: "🏪 Become Seller",
        callback_data: "become_seller"
      }
    ]
  ]
};

// Send main menu
bot.sendMessage(chatId, "Welcome to Mazza! Choose an option:", {
  reply_markup: mainMenuKeyboard
});
```

### 2. Registration Flow

```javascript
// Handle registration based on user choice
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  switch(data) {
    case 'become_seller':
      // Start seller registration flow
      await startSellerRegistration(chatId);
      break;
    case 'profile':
      // Show user profile
      await showUserProfile(chatId);
      break;
    case 'browse':
      // Open mini app for browsing
      await openMiniApp(chatId);
      break;
  }
});
```

### 3. Seller Registration Flow

```javascript
async function startSellerRegistration(chatId) {
  const registrationKeyboard = {
    inline_keyboard: [
      [
        {
          text: "📝 Start Registration",
          callback_data: "start_seller_registration"
        }
      ]
    ]
  };
  
  bot.sendMessage(chatId, 
    "To become a seller, you need to provide:\n" +
    "• Business name\n" +
    "• Business type\n" +
    "• Location\n" +
    "• Contact information\n\n" +
    "Click below to start registration:",
    { reply_markup: registrationKeyboard }
  );
}

// Handle seller registration
bot.on('callback_query', async (query) => {
  if (query.data === 'start_seller_registration') {
    // Start conversation flow for seller registration
    await startSellerConversation(query.message.chat.id);
  }
});
```

### 4. User Role Assignment

```javascript
// After successful registration, assign role
async function assignUserRole(chatId, role) {
  // Save user role to database
  await saveUserRole(chatId, role);
  
  const successMessage = role === 'seller' 
    ? "🎉 Congratulations! You're now a seller. You can start adding products in the mini app."
    : "🎉 Welcome! You can now browse and order products in the mini app.";
    
  const miniAppKeyboard = {
    inline_keyboard: [
      [
        {
          text: "🚀 Open Mini App",
          web_app: {
            url: "https://your-webapp-url.com"
          }
        }
      ]
    ]
  };
  
  bot.sendMessage(chatId, successMessage, {
    reply_markup: miniAppKeyboard
  });
}
```

## Environment Variables for Bot

Add these to your bot's environment:

```env
WEBAPP_URL=https://your-webapp-url.com
ADMIN_TELEGRAM_ID=your_admin_telegram_id
ADMIN_PASSWORD=your_secure_admin_password
```

## Mini App Integration

The mini app will automatically:
1. Detect user's role from Telegram init data
2. Show appropriate dashboard (user/seller/admin)
3. Handle authentication based on registration status
4. Redirect unregistered users to registration flow
