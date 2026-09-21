import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { db } from '../db';

// In a real scenario, we would load this from an env variable or json file
// For this project, we mock the initialization if not provided
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    // Mock init for tests
    process.env.FIREBASE_MOCK = 'true';
  }
} catch {
  console.warn('Firebase init failed, using mock mode');
  process.env.FIREBASE_MOCK = 'true';
}

export class NotificationService {
  async saveDeviceToken(userId: string, token: string) {
    await db.query(
      'UPDATE users SET device_token = $1 WHERE id = $2',
      [token, userId]
    );
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, string>) {
    const user = await db.query(
      'SELECT device_token FROM users WHERE id = $1',
      [userId]
    );
    
    if (!user.rows[0]?.device_token) {
      console.log(`User ${userId} has no device token`);
      return false;
    }
    
    const message = {
      notification: { title, body },
      data: data || {},
      token: user.rows[0].device_token
    };
    
    if (process.env.FIREBASE_MOCK === 'true' || process.env.NODE_ENV === 'test') {
      console.log('[MOCK FIREBASE] Sending push notification:', message);
      return true;
    }

    try {
      const response = await getMessaging().send(message);
      console.log('Successfully sent message:', response);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
