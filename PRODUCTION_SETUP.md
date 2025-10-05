# Production Setup Guide

## Environment Variables Required

Create a `.env.local` file in the root directory with the following variables:

```env
# Backend API URL
REACT_APP_API_BASE_URL=https://ulgur-backend-production-53b2.up.railway.app/webapp

# Telegram Bot Configuration
REACT_APP_TELEGRAM_BOT_TOKEN=your_bot_token_here
REACT_APP_BOT_USERNAME=your_bot_username

# Admin Configuration
REACT_APP_ADMIN_TELEGRAM_ID=your_admin_telegram_id_here
REACT_APP_ADMIN_PASSWORD=your_secure_admin_password

# WebApp URL (for Telegram WebApp)
REACT_APP_WEBAPP_URL=https://your-domain.com
```

## How Role Detection Works in Production

### 1. **Admin Role Detection**
- Set `REACT_APP_ADMIN_TELEGRAM_ID` to your Telegram user ID
- Users with this Telegram ID will automatically get admin role
- Admin users will need to enter password (set in `REACT_APP_ADMIN_PASSWORD`)

### 2. **Seller Role Detection**
- Sellers are detected through backend authentication
- The app calls `/auth/telegram` endpoint with Telegram init data
- Backend responds with user role (user/seller/admin)
- If backend returns "seller", user gets seller dashboard

### 3. **User Role (Default)**
- All other users get "user" role by default
- They see the user dashboard with product discovery

## Backend Requirements

Your backend must have:
1. `/auth/telegram` endpoint that accepts `{ initData: string }`
2. Returns user data with role: `{ role: 'user' | 'seller' | 'admin' }`
3. Proper Telegram WebApp authentication validation

## Testing in Production

1. **Deploy the app** to your hosting platform
2. **Set up Telegram bot** with WebApp URL pointing to your deployed app
3. **Configure environment variables** with real values
4. **Test with different users**:
   - Regular users should see user dashboard
   - Sellers should see seller dashboard (if backend recognizes them)
   - Admin should see admin dashboard (if Telegram ID matches)

## Troubleshooting

- **All users see user dashboard**: Check backend `/auth/telegram` endpoint
- **Admin not working**: Verify `REACT_APP_ADMIN_TELEGRAM_ID` matches your Telegram ID
- **Sellers not detected**: Check backend authentication and role assignment
