// Seed script for FastBar demo data
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);
const auth = getAuth(app);

// Demo data
const demoEvent = {
  name: 'Demo Festival',
  date: new Date('2025-10-31T20:00:00'),
  location: 'Demo Club',
  active: true,
  redeemTtlMinutes: 20,
  bars: [
    { id: 'bar-1', name: 'Barra Principal' },
    { id: 'bar-2', name: 'Barra VIP' },
  ],
};

const demoProducts = [
  {
    name: 'Cerveza Rubia',
    priceCents: 800,
    category: 'bebidas',
    active: true,
  },
  {
    name: 'Cerveza IPA',
    priceCents: 900,
    category: 'bebidas',
    active: true,
  },
  {
    name: 'Gin Tonic',
    priceCents: 1200,
    category: 'bebidas',
    active: true,
  },
  {
    name: 'Fernet con Cola',
    priceCents: 1000,
    category: 'bebidas',
    active: true,
  },
  {
    name: 'Agua Mineral',
    priceCents: 500,
    category: 'bebidas',
    active: true,
  },
  {
    name: 'Gaseosa',
    priceCents: 600,
    category: 'bebidas',
    active: true,
  },
];

const demoUsers = [
  {
    email: 'user@example.com',
    password: 'password123',
    displayName: 'Demo User',
    role: 'user',
  },
  {
    email: 'staff@example.com',
    password: 'password123',
    displayName: 'Demo Staff',
    role: 'staff',
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    displayName: 'Demo Admin',
    role: 'admin',
  },
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting seed process...');

    // Create demo event
    console.log('Creating demo event...');
    const eventRef = db.collection('events').doc('demo-event');
    await eventRef.set({
      ...demoEvent,
      createdAt: new Date(),
    });
    console.log('✅ Demo event created!');

    // Create demo products
    console.log('Creating demo products...');
    const productsPromises = demoProducts.map((product, index) => {
      return eventRef.collection('products').doc(`product-${index + 1}`).set({
        ...product,
        createdAt: new Date(),
      });
    });
    await Promise.all(productsPromises);
    console.log('✅ Demo products created!');

    // Create demo users
    console.log('Creating demo users...');
    for (const user of demoUsers) {
      try {
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.displayName,
        });

        // Set custom claims for role
        await auth.setCustomUserClaims(userRecord.uid, { role: user.role });

        // Create Firestore user document
        await db.collection('users').doc(userRecord.uid).set({
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          createdAt: new Date(),
        });

        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } catch (error) {
        // If user already exists, just update the role
        if (error.code === 'auth/email-already-exists') {
          const userRecord = await auth.getUserByEmail(user.email);
          await auth.setCustomUserClaims(userRecord.uid, { role: user.role });
          
          await db.collection('users').doc(userRecord.uid).set({
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            updatedAt: new Date(),
          }, { merge: true });
          
          console.log(`✅ Updated existing user: ${user.email} (${user.role})`);
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error);
        }
      }
    }

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed function
seedDatabase().then(() => process.exit(0));
