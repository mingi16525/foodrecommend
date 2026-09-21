import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../auth/authMiddleware';
import { db } from '../db';
import { paymentService, zaloPayService } from '../services/payment.service';

const router = Router();

// Create payment
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { amount, groupOrderId } = req.body;
  const userId = req.user?.userId;

  if (!amount || !groupOrderId) {
    return res.status(400).json({ error: 'amount and groupOrderId are required' });
  }

  try {
    // Save to payments table
    const result = await db.query(
      `INSERT INTO payments (group_order_id, user_id, amount, payment_method)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [groupOrderId, userId, amount, 'MOMO']
    );
    
    const paymentId = result.rows[0].id;
    const orderInfo = `Pay for group order ${groupOrderId}`;

    const paymentResponse = await paymentService.createPayment(paymentId, amount, orderInfo);
    
    res.json({ data: paymentResponse });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Momo IPN Webhook
router.post('/ipn', async (req, res) => {
  const data = req.body;
  
  if (!paymentService.verifyIpnSignature(data)) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const { orderId, resultCode, transId } = data;
  
  try {
    const status = resultCode === 0 ? 'SUCCESS' : 'FAILED';
    
    await db.query(
      `UPDATE payments 
       SET status = $1, transaction_id = $2, metadata = $3, updated_at = NOW() 
       WHERE id = $4`,
      [status, transId, JSON.stringify(data), orderId]
    );

    res.status(204).send();
  } catch (error) {
    console.error('IPN processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// ZaloPay: Create Payment
router.post('/zalopay/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { amount, groupOrderId } = req.body;
  const userId = req.user?.userId;

  if (!amount || !groupOrderId) {
    return res.status(400).json({ error: 'amount and groupOrderId are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO payments (group_order_id, user_id, amount, payment_method)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [groupOrderId, userId, amount, 'ZALOPAY']
    );
    
    const paymentId = result.rows[0].id;
    const orderInfo = `Pay for group order ${groupOrderId}`;
    
    const paymentResponse = await zaloPayService.createPayment(paymentId, amount, orderInfo);
    
    res.json({ data: paymentResponse });
  } catch (error) {
    console.error('Create zalopay payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ZaloPay: IPN Webhook
router.post('/zalopay/ipn', async (req, res) => {
  const result: Record<string, string | number> = {};
  
  try {
    const reqMac = req.body.mac;
    
    const isValid = zaloPayService.verifyIpnSignature(req.body, reqMac);
    
    if (!isValid) {
      result.return_code = -1;
      result.return_message = 'mac not equal';
    } else {
      // Update payment status (Mock extraction)
      result.return_code = 1;
      result.return_message = 'success';
    }
  } catch {
    result.return_code = 0; 
    result.return_message = 'error';
  }
  
  res.json(result);
});

export default router;
