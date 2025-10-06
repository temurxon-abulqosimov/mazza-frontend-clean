export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://ulgur-backend-production-53b2.up.railway.app',
  TELEGRAM_BOT_TOKEN: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
  ADMIN_TELEGRAM_ID: process.env.REACT_APP_ADMIN_TELEGRAM_ID || '',
  ADMIN_PASSWORD: process.env.REACT_APP_ADMIN_PASSWORD || 'admin123',
  WEBAPP_URL: process.env.REACT_APP_WEBAPP_URL || '',
  BOT_USERNAME: process.env.REACT_APP_BOT_USERNAME || 'your_bot_username',
};
