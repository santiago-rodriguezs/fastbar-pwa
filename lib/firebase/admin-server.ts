// Mock implementation for server-side Firebase Admin SDK

// Mock Firestore for development
function createMockFirestore() {
  const mockCollection = (collectionPath: string) => ({
    doc: (docId: string) => ({
      get: async () => ({
        exists: true,
        id: docId,
        data: () => ({ 
          name: 'Mock Product', 
          priceCents: 1000,
          status: 'PENDING_PAYMENT',
          userId: 'mock-user-id',
          eventId: 'mock-event-id',
          role: 'user'
        }),
      }),
      collection: mockCollection,
      update: async (data: any) => Promise.resolve(),
      set: async (data: any) => Promise.resolve(),
    }),
    add: async (data: any) => ({ id: 'mock-id-' + Date.now() }),
    where: () => ({
      get: async () => ({
        empty: false,
        docs: [
          {
            id: 'mock-doc-id',
            data: () => ({ name: 'Mock Data' }),
            exists: true
          }
        ]
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({
            empty: false,
            docs: [
              {
                id: 'mock-doc-id',
                data: () => ({ name: 'Mock Data' }),
                exists: true
              }
            ]
          })
        })
      })
    })
  });
  
  return {
    collection: mockCollection,
  } as any;
}

// Mock Auth for development
function createMockAuth() {
  return {
    verifyIdToken: async (token: string) => ({
      uid: 'mock-user-id',
      role: 'user',
    }),
    verifySessionCookie: async (cookie: string) => ({
      uid: 'mock-user-id',
      role: 'user',
    }),
    createCustomToken: async (uid: string) => 'mock-custom-token',
  } as any;
}

// Export mock Firebase Admin instances for development
export const db = createMockFirestore();
export const auth = createMockAuth();
