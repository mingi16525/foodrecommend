import { Router } from 'express';
import { db } from '../db';
import { paymentService, zaloPayService } from '../services/payment.service';
import { authenticateToken, AuthRequest } from '../auth/authMiddleware';

export const subscriptionRouter = Router();

// Mock pricing: Premium costs 50,000 VND
const PREMIUM_PRICE = 50000; 

// Initiate Premium Subscription Payment
subscriptionRouter.post('/upgrade', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    // Assume ZaloPay or MoMo
    const paymentMethod = req.body.paymentMethod || 'momo'; 

    const orderId = `premium_${userId}_${Date.now()}`;
    const amount = PREMIUM_PRICE;
    const orderInfo = `Upgrade to Premium for user ${userId}`;

    let paymentResponse;
    if (paymentMethod === 'zalopay') {
      paymentResponse = await zaloPayService.createPayment(orderId, amount, orderInfo);
    } else {
      paymentResponse = await paymentService.createPayment(orderId, amount, orderInfo);
    }

    res.json({ data: paymentResponse });
  } catch (error) {
    next(error);
  }
});

// Generic Webhook IPN to handle subscription successful payment
subscriptionRouter.post('/ipn', async (req, res) => {
  const result: Record<string, string | number> = {};
  
  try {
    // In a real app, you would verify the signature from ZaloPay/MoMo here.
    // For MVP, we will extract the userId from the orderId and upgrade the user.
    const { orderId } = req.body; // e.g. premium_u1_123456
    
    if (orderId && orderId.startsWith('premium_')) {
      const parts = orderId.split('_');
      const userId = parts[1];

      if (userId) {
        // Upgrade to Premium for 1 month
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await db.query(
          'UPDATE users SET subscription_tier = $1, subscription_expires_at = $2 WHERE id = $3',
          ['PREMIUM', expiresAt, userId]
        );
      }
    }
    
    result.return_code = 1;
    result.return_message = 'success';
  } catch {
    result.return_code = 0; 
    result.return_message = 'error';
  }
  
  res.json(result);
});
