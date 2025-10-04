# FastBar

A mobile-first PWA for event ordering and QR code-based fulfillment.

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
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

# QR
QR_JWT_SECRET=your-qr-jwt-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development

```bash
npm install
npm run dev
```

## Testing Payments

### Mercado Pago Sandbox

1. Use test cards from [Mercado Pago Test Documentation](https://www.mercadopago.com.ar/developers/en/docs/checkout-api/integration-test/test-cards)
2. For webhooks, use ngrok: `ngrok http 3000`
3. Update webhook URL in Mercado Pago dashboard with your ngrok URL

### Stripe Testing

1. Use test cards from [Stripe Testing Documentation](https://stripe.com/docs/testing)
2. For webhooks, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Demo Mode

If any part of the application fails (payments, auth, etc.), it will automatically fall back to demo mode with mock data to ensure the demo flow continues without interruption. Look for `#TODO` comments in the code to identify these fallback points.
