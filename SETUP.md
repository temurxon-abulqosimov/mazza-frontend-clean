# Mazza Frontend Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_API_BASE_URL=https://ulgur-backend-production-53b2.up.railway.app/webapp
REACT_APP_TELEGRAM_BOT_TOKEN=your_bot_token_here
REACT_APP_ADMIN_TELEGRAM_ID=your_admin_telegram_id_here
REACT_APP_ADMIN_PASSWORD=your_secure_admin_password
REACT_APP_WEBAPP_URL=https://your-webapp-url.com
REACT_APP_BOT_USERNAME=your_bot_username
```

## How the Authentication Flow Works

1. **User opens the mini app** - The app initializes Telegram WebApp
2. **Authentication check** - App tries to authenticate with the backend using Telegram init data
3. **If user is registered** - They are redirected to their role-based dashboard (user/seller/admin)
4. **If user is not registered** - They see a registration required screen with instructions to register in the bot first
5. **If admin user** - They see admin login form to enter password (no registration needed)

## User Flow

### For Unregistered Users:
1. User opens mini app
2. Sees "Registration Required" screen
3. Clicks "Open Telegram Bot" button
4. Registers in the bot (chooses role: user/seller)
5. Returns to mini app
6. Gets redirected to appropriate dashboard based on role

### For Admin Users:
1. Admin opens mini app
2. Sees admin login form
3. Enters admin password
4. Gets redirected to admin dashboard

### For Registered Users:
1. User opens mini app
2. App authenticates automatically
3. User is redirected to their role-based dashboard:
   - **User**: Product discovery and ordering
   - **Seller**: Product management and seller dashboard
   - **Admin**: Platform management and analytics

## Bot Integration

### Required Bot Commands

Your Telegram bot needs these features:

1. **Main Menu with Mini App Button**
   ```javascript
   const mainMenuKeyboard = {
     inline_keyboard: [
       [
         {
           text: "🏠 Open Mini App",
           web_app: { url: "https://your-webapp-url.com" }
         }
       ],
       [
         { text: "👤 My Profile", callback_data: "profile" },
         { text: "🛍️ Browse Products", callback_data: "browse" },
         { text: "🏪 Become Seller", callback_data: "become_seller" }
       ]
     ]
   };
   ```

2. **User Registration Flow**
   - Handle user/seller registration
   - Assign roles after registration
   - Show mini app button after successful registration

3. **Admin Access**
   - Admin users don't need registration
   - They enter password in mini app
   - Admin Telegram ID is configured in environment

## Backend Requirements

The backend should have the following endpoint:
- `POST /auth/telegram` - Authenticates Telegram WebApp users using init data

## Development

```bash
npm install
npm start
```

## Production Build

```bash
npm run build
```

## Important Notes

- Users must register in the Telegram bot first before using the mini app
- The bot should assign roles (user/seller/admin) during registration
- Admin accounts are pre-configured in the backend
- The mini app handles authentication automatically using Telegram's init data
