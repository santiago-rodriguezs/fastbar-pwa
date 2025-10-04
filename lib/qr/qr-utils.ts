import * as qrcode from 'qrcode';
import jwt from 'jsonwebtoken';

// QR JWT payload interface
export interface QrJwtPayload {
  orderId: string;
  eventId: string;
  exp: number;
}

// Generate QR code as SVG from JWT
export async function generateQrSvg(qrJwt: string): Promise<string> {
  try {
    return await qrcode.toString(qrJwt, {
      type: 'svg',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    
    // #TODO: Return mock QR for demo purposes
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <rect width="100%" height="100%" fill="white" />
        <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle">
          QR demo – #TODO integrate qrcode lib
        </text>
        <rect x="50" y="100" width="200" height="100" fill="none" stroke="black" stroke-width="2" />
      </svg>
    `;
  }
}

// Generate JWT for QR code
export function generateQrJwt(
  orderId: string,
  eventId: string,
  expiresInMinutes: number
): { qrJwt: string; expiresAt: Date } {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiresInMinutes * 60 * 1000));
    
    const qrJwt = jwt.sign(
      {
        orderId,
        eventId,
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      process.env.QR_JWT_SECRET || ''
    );
    
    return { qrJwt, expiresAt };
  } catch (error) {
    console.error('Error generating QR JWT:', error);
    
    // #TODO: Return mock JWT for demo purposes
    const mockExpiresAt = new Date(Date.now() + (20 * 60 * 1000));
    return {
      qrJwt: 'mock.jwt.token',
      expiresAt: mockExpiresAt,
    };
  }
}

// Verify QR JWT
export function verifyQrJwt(qrJwt: string): QrJwtPayload | null {
  try {
    return jwt.verify(qrJwt, process.env.QR_JWT_SECRET || '') as QrJwtPayload;
  } catch (error) {
    console.error('Error verifying QR JWT:', error);
    return null;
  }
}

// Calculate remaining time in seconds from expiration date
export function getRemainingTimeInSeconds(expiresAt: Date): number {
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

// Format remaining time as MM:SS
export function formatRemainingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
