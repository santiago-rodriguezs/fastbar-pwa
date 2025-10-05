# FastBar - Mobile-First PWA

FastBar is a Progressive Web App (PWA) that allows users to order and pay for drinks at events without waiting in line. The app is built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Features

- **Firebase Authentication**: Google and Email/Password sign-in
- **Firestore Database**: Secure data storage with Firebase Admin SDK
- **Payment Integration**: Mercado Pago (Checkout Pro) and Apple Pay via Stripe PaymentRequest
- **QR Code Generation**: Server-side QR code generation with JWT signing
- **Role-Based Access Control**: User, Staff, and Admin roles with middleware protection
- **PWA Features**: Manifest and service worker for offline support
- **Demo Mode**: Fallback mock data for all critical flows

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Mercado Pago
MP_ACCESS_TOKEN=your-mp-access-token
MP_WEBHOOK_SECRET=your-mp-webhook-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# QR JWT Secret
QR_JWT_SECRET=your-qr-jwt-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

## Seeding Demo Data

The application includes a seed script to populate the database with demo data. This script creates a demo event, products, and users with different roles.

```bash
# Install required dependencies for the seed script
npm install dotenv firebase-admin

# Run the seed script
node scripts/seed.js
```

The seed script will create the following users:

- **User**: user@example.com / password123
- **Staff**: staff@example.com / password123
- **Admin**: admin@example.com / password123

## Application Structure

- **/app**: Next.js App Router structure
  - **/api**: API routes for payments, orders, webhooks, etc.
  - **/public**: Public routes (login, events)
  - **/user**: User-specific routes (orders, cart)
  - **/staff**: Staff-specific routes (scan QR)
  - **/admin**: Admin-specific routes (dashboard)
- **/components**: React components
  - **/ui**: UI components (buttons, cards, etc.)
  - **/qr**: QR code related components
- **/lib**: Utility functions
  - **/auth**: Authentication context and utilities
  - **/firebase**: Firebase client and admin SDK setup
  - **/qr**: QR code generation and validation utilities
  - **/pwa**: PWA registration and service worker
- **/public**: Static assets and PWA files

## Testing Payments

### Mercado Pago

1. Use Mercado Pago's sandbox mode for testing
2. Use test credit cards from [Mercado Pago Test Documentation](https://www.mercadopago.com.ar/developers/es/guides/online-payments/checkout-pro/test-integration)
3. For webhook testing, use [ngrok](https://ngrok.com/) to expose your local server

### Stripe (Apple Pay)

1. Use Stripe's test mode for testing
2. For Apple Pay testing, use Safari on iOS or macOS
3. Use test cards from [Stripe Test Documentation](https://stripe.com/docs/testing)
4. For webhook testing, use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Demo Mode

The application includes fallback mock data for all critical flows to ensure the demo can continue without breaking. Look for `#TODO` comments in the code to identify these fallbacks.

When running in non-production mode (`NODE_ENV !== 'production'`), the app will allow access to protected routes without authentication and provide mock data for API responses.

## PWA Features

The application includes PWA features such as:

- **Manifest**: For add to home screen functionality
- **Service Worker**: For offline support and caching
- **Offline Page**: Fallback page when offline
- **QR Display**: With brightness control and expiration timer
- **QR Scanner**: For staff to scan and validate QR codes
