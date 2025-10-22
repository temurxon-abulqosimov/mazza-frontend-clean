# Admin Setup Guide

## Backend Environment Variables

Make sure these environment variables are set in your backend (Railway/Render/etc.):

```bash
ADMIN_TELEGRAM_ID=794464667
ADMIN_USERNAME=@avtemur
ADMIN_PASSWORD=your_secure_password_here
```

## Frontend Environment Variables (Optional)

If you want to set frontend environment variables, create a `.env` file in the `mazza-frontend-clean` directory:

```bash
REACT_APP_ADMIN_TELEGRAM_ID=794464667
REACT_APP_ADMIN_PASSWORD=your_secure_password_here
```

**Note**: The frontend no longer automatically logs in as admin using environment variables. Admin authentication is now handled through the proper login flow.

## How to Access Admin Dashboard

1. **Via Telegram Bot**: 
   - Start the bot and type "admin"
   - Enter your admin password when prompted
   - Use the "Open Admin Panel" button

2. **Via Miniapp**:
   - Open the miniapp with your admin Telegram account
   - You'll be prompted to enter your admin password
   - After successful authentication, you'll be redirected to the admin dashboard

## Admin Authentication Flow

1. The system checks if your Telegram ID matches the `ADMIN_TELEGRAM_ID` in the backend
2. If you're an admin, you'll be prompted for a password
3. The password is verified against `ADMIN_PASSWORD` in the backend
4. Upon successful authentication, you receive a JWT token
5. The token is used to access admin-only endpoints

## Troubleshooting

### "No authentication token found"
- Make sure you're logged in through the proper admin flow
- Check that your Telegram ID matches the backend configuration

### "Authentication expired"
- Your JWT token has expired
- Log in again through the admin login form

### "Invalid admin credentials"
- Verify your Telegram ID and password match the backend environment variables
- Check the backend logs for detailed authentication debugging

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for admin accounts
- Regularly rotate admin passwords
- Monitor admin access logs
