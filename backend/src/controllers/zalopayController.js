import crypto from 'crypto';
import axios from 'axios';
import moment from 'moment-timezone';
import { Order } from '../models/index.js';
import { catchAsync, NotFoundError, ValidationError } from '../utils/errors.js';

// ZaloPay config from environment variables
const config = {
  app_id: process.env.ZALOPAY_APP_ID || '2553',
  key1: process.env.ZALOPAY_KEY1 || 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
  key2: process.env.ZALOPAY_KEY2 || 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
  endpoint: process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create',
  callback_url: process.env.ZALOPAY_CALLBACK_URL || 'http://localhost:5000/api/v1/zalopay/callback',
  redirect_url: process.env.ZALOPAY_REDIRECT_URL || 'http://localhost:3000/checkout/result'
};

/**
 * Create ZaloPay payment order
 * POST /api/v1/zalopay/create-order
 */
export const createZaloPayOrder = catchAsync(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ValidationError('Order ID is required');
  }

  // Find the order
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Check if order is already paid
  if (order.paymentStatus === 'paid') {
    throw new ValidationError('Order is already paid');
  }

  // Generate transaction ID with format: yymmdd_orderId_timestamp
  const transID = `${moment().tz('Asia/Ho_Chi_Minh').format('YYMMDD')}_${order.id}_${Date.now()}`;

  // Prepare embed data
  const embed_data = JSON.stringify({
    redirecturl: `${config.redirect_url}?orderId=${order.id}`,
    orderId: order.id
  });

  // Prepare items info
  const items = JSON.stringify([{
    name: `Đơn hàng #${order.orderNumber}`,
    quantity: 1,
    price: Math.round(parseFloat(order.totalAmount))
  }]);

  // Get current timestamp
  const app_time = Date.now();

  // Prepare order data
  const orderData = {
    app_id: parseInt(config.app_id),
    app_trans_id: transID,
    app_user: order.userId?.toString() || 'guest',
    app_time: app_time,
    amount: Math.round(parseFloat(order.totalAmount)),
    item: items,
    embed_data: embed_data,
    description: `Bach Hoa Store - Thanh toán đơn hàng #${order.orderNumber}`,
    bank_code: '',
    callback_url: config.callback_url
  };

  // Create MAC signature
  // mac = HMAC(SHA256, key1, app_id|app_trans_id|app_user|amount|app_time|embed_data|item)
  const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
  orderData.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

  try {
    // Call ZaloPay API to create order
    const response = await axios.post(config.endpoint, null, {
      params: orderData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const zaloPayResponse = response.data;

    if (zaloPayResponse.return_code === 1) {
      // Save transaction ID to order for later verification
      await order.update({
        paymentTransactionId: transID,
        paymentMethod: 'zalopay'
      });

      res.json({
        status: 'success',
        message: 'ZaloPay order created successfully',
        data: {
          order_url: zaloPayResponse.order_url,
          zp_trans_token: zaloPayResponse.zp_trans_token,
          app_trans_id: transID,
          qr_code: zaloPayResponse.order_url // Can be used to generate QR
        }
      });
    } else {
      throw new ValidationError(`ZaloPay error: ${zaloPayResponse.return_message || 'Unknown error'}`);
    }
  } catch (error) {
    if (error.response) {
      console.error('ZaloPay API Error:', error.response.data);
      throw new ValidationError(`ZaloPay API error: ${error.response.data?.return_message || error.message}`);
    }
    throw error;
  }
});

/**
 * ZaloPay callback handler
 * POST /api/v1/zalopay/callback
 * ZaloPay will call this endpoint when payment is completed
 */
export const zalopayCallback = catchAsync(async (req, res) => {
  let result = {};

  try {
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    // Verify MAC
    const mac = crypto.createHmac('sha256', config.key2).update(dataStr).digest('hex');

    if (reqMac !== mac) {
      // MAC verification failed
      result.return_code = -1;
      result.return_message = 'mac not equal';
    } else {
      // MAC verified, process payment
      const dataJson = JSON.parse(dataStr);
      const appTransId = dataJson.app_trans_id;

      console.log('ZaloPay callback received:', {
        app_trans_id: appTransId,
        zp_trans_id: dataJson.zp_trans_id,
        amount: dataJson.amount
      });

      // Extract orderId from app_trans_id (format: yymmdd_orderId_timestamp)
      const parts = appTransId.split('_');
      const orderId = parts[1];

      // Find and update order
      const order = await Order.findByPk(orderId);

      if (order) {
        await order.update({
          paymentStatus: 'paid',
          paymentTransactionId: appTransId,
          paidAt: new Date()
        });

        console.log(`Order #${order.orderNumber} marked as paid via ZaloPay`);
      }

      result.return_code = 1;
      result.return_message = 'success';
    }
  } catch (error) {
    console.error('ZaloPay callback error:', error);
    result.return_code = 0;
    result.return_message = error.message;
  }

  // ZaloPay requires this response format
  res.json(result);
});

/**
 * Query ZaloPay order status
 * GET /api/v1/zalopay/query/:appTransId
 */
export const queryZaloPayOrder = catchAsync(async (req, res) => {
  const { appTransId } = req.params;

  if (!appTransId) {
    throw new ValidationError('Transaction ID is required');
  }

  const postData = {
    app_id: config.app_id,
    app_trans_id: appTransId
  };

  // Create MAC for query
  const data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
  postData.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

  try {
    const response = await axios.post('https://sb-openapi.zalopay.vn/v2/query', null, {
      params: postData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const queryResult = response.data;

    // return_code: 1 = success, 2 = failed, 3 = pending
    let paymentStatus = 'pending';
    if (queryResult.return_code === 1) {
      paymentStatus = 'paid';

      // Update order if paid
      const parts = appTransId.split('_');
      const orderId = parts[1];
      const order = await Order.findByPk(orderId);

      if (order && order.paymentStatus !== 'paid') {
        await order.update({
          paymentStatus: 'paid',
          paidAt: new Date()
        });
      }
    } else if (queryResult.return_code === 2) {
      paymentStatus = 'failed';
    }

    res.json({
      status: 'success',
      data: {
        return_code: queryResult.return_code,
        return_message: queryResult.return_message,
        payment_status: paymentStatus,
        zp_trans_id: queryResult.zp_trans_id,
        amount: queryResult.amount
      }
    });
  } catch (error) {
    console.error('ZaloPay query error:', error);
    throw new ValidationError('Failed to query ZaloPay order status');
  }
});
