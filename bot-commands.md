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
    case 'profile':
      // Show user profile
      await showUserProfile(chatId);
      break;
    case 'browse':
      // Open mini app for browsing
      await openMiniApp(chatId);
      break;
    case 'orders':
      // Show user orders
      await showUserOrders(chatId);
      break;
  }
});
```

### 3. User Registration Flow

```javascript
// Simple user registration - just assign user role
async function registerUser(chatId) {
  // Save user with 'user' role to database
  await saveUserRole(chatId, 'user');
  
  const successMessage = "🎉 Welcome! You're now registered. You can browse and order products in the mini app.";
  
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

### 4. User Role Assignment

```javascript
// After successful registration, assign role
async function assignUserRole(chatId, role) {
  // Save user role to database
  await saveUserRole(chatId, role);
  
  const successMessage = "🎉 Welcome! You can now browse and order products in the mini app.";
    
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
