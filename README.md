# Mazza Frontend - Telegram Mini App

This is the React frontend for the Mazza food waste reduction platform, designed to run as a Telegram Mini App.

## Features

- **User Dashboard**: Browse products, view orders, and statistics
- **Seller Dashboard**: Manage products, view orders, and business analytics
- **Admin Panel**: System management and oversight
- **Product Discovery**: Find nearby food deals with filters
- **Order Management**: Complete order flow with confirmation codes
- **Location-based**: Find nearby stores and products
- **Multi-language**: Support for Uzbek and Russian

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios for API calls
- Telegram Web App SDK

## Setup

### Development

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.development .env.local
```

3. Start development server:
```bash
npm start
```

The app will be available at `http://localhost:3001`

### Production

1. Build the app:
```bash
npm run build
```

2. The built files will be in the `build/` directory and can be served by the backend.

## Integration with Backend

The frontend connects to the NestJS backend at `/webapp` endpoints. Key integrations:

- Authentication via Telegram Web App initData
- Role-based dashboard routing
- Real-time order management
- Location-based product discovery

## Project Structure

```
src/
├── components
```
