import crypto from 'crypto';

export class PaymentService {
  private partnerCode = process.env.MOMO_PARTNER_CODE || 'MOCK_PARTNER_CODE';
  private accessKey = process.env.MOMO_ACCESS_KEY || 'MOCK_ACCESS_KEY';
  private secretKey = process.env.MOMO_SECRET_KEY || 'MOCK_SECRET_KEY';
  private endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
  
  async createPayment(orderId: string, amount: number, orderInfo: string) {
    const requestId = this.generateRequestId();
    const extraData = '';
    const orderGroupId = '';
    const autoCapture = true;
    const lang = 'vi';
    const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/return';
    const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:3000/api/payment/ipn';
    const requestType = 'captureWallet';
    
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: 'FoodRecommend',
      storeId: 'FoodRecommend',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      orderGroupId,
      signature,
      extraData
    };
    
    if (process.env.NODE_ENV === 'test' || this.partnerCode === 'MOCK_PARTNER_CODE') {
      return {
        partnerCode: this.partnerCode,
        orderId,
        requestId,
        amount,
        responseTime: Date.now(),
        message: "Success",
        resultCode: 0,
        payUrl: `https://test-payment.momo.vn/pay?orderId=${orderId}`,
        deeplink: `momo://pay?orderId=${orderId}`,
        qrCodeUrl: "https://test-payment.momo.vn/qr"
      };
    }
    
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      return await response.json();
    } catch (error) {
      console.error('Momo Payment Error:', error);
      throw new Error('Failed to create payment', { cause: error });
    }
  }
  
  verifyIpnSignature(data: Record<string, string | number>): boolean {
    const {
      partnerCode, orderId, requestId, amount, orderInfo,
      orderType, transId, resultCode, message, payType, responseTime,
      extraData, signature
    } = data;
    
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
      
    return signature === expectedSignature;
  }
  
  private generateRequestId(): string {
    return crypto.randomUUID();
  }
}

export class ZaloPayService {
  private appId = process.env.ZALOPAY_APP_ID || '2553';
  private key1 = process.env.ZALOPAY_KEY1 || 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL';
  private key2 = process.env.ZALOPAY_KEY2 || 'kLtgPl8YESD71R1sCApA';
  private endpoint = process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create';

  async createPayment(orderId: string, amount: number, description: string) {
    const embed_data = {};
    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${transID}`;
    const app_time = Date.now();
    
    const order = {
      app_id: this.appId,
      app_trans_id: app_trans_id,
      app_user: 'user123',
      app_time: app_time,
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: description,
      bank_code: '',
      mac: ''
    };

    const data = this.appId + '|' + order.app_trans_id + '|' + order.app_user + '|' + order.amount + '|' + order.app_time + '|' + order.embed_data + '|' + order.item;
    order.mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex');

    if (process.env.NODE_ENV === 'test' || this.appId === '2553') {
      return {
        return_code: 1,
        return_message: 'Success',
        order_url: `https://test-payment.zalopay.vn/pay?orderId=${orderId}`,
        app_trans_id
      };
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return await response.json();
    } catch (error) {
      console.error('ZaloPay Payment Error:', error);
      throw new Error('Failed to create zalopay payment', { cause: error });
    }
  }

  verifyIpnSignature(data: Record<string, string>, mac: string): boolean {
    const expectedMac = crypto.createHmac('sha256', this.key2).update(data.data).digest('hex');
    return mac === expectedMac;
  }
}

export const paymentService = new PaymentService();
export const zaloPayService = new ZaloPayService();
