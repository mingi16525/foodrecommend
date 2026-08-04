export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class NotificationService {
  private static userTokens: Map<string, string[]> = new Map();

  /**
   * Đăng ký device token cho user
   */
  static registerToken(userId: string, token: string) {
    const tokens = this.userTokens.get(userId) || [];
    if (!tokens.includes(token)) {
      tokens.push(token);
      this.userTokens.set(userId, tokens);
      console.log(`[NotificationService] Registered token for user ${userId}: ${token}`);
    }
  }

  /**
   * Gửi thông báo đến 1 user
   */
  static async sendToUser(userId: string, payload: PushNotificationPayload) {
    const tokens = this.userTokens.get(userId) || [];
    if (tokens.length === 0) {
      console.log(`[NotificationService] No device tokens for user ${userId}. Notification skipped.`);
      return;
    }

    // Mock sending FCM
    tokens.forEach(token => {
      console.log(`[FCM Mock] Sending to token ${token}:`, payload);
    });
    
    return { success: true, count: tokens.length };
  }

  /**
   * Gửi thông báo broadcast (tất cả token)
   */
  static async broadcast(payload: PushNotificationPayload) {
    console.log(`[FCM Mock] Broadcasting:`, payload);
    return { success: true };
  }
}
