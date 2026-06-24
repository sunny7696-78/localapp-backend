const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Ride = require('../models/Ride');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/payment/create-order - create a Razorpay order for checkout
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // public key, safe to expose
    });
  } catch (err) {
    res.status(500).json({ message: 'Razorpay order creation failed', error: err.message });
  }
});

// @POST /api/payment/verify - verify payment signature after checkout success
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderType, refId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;
    if (!isValid) return res.status(400).json({ message: 'Payment verification failed - invalid signature' });

    // Mark the order/ride as paid
    if (orderType === 'order' && refId) {
      await Order.findByIdAndUpdate(refId, {
        paymentStatus: 'paid',
        paymentMethod: 'online',
        razorpayPaymentId: razorpay_payment_id,
      });
    } else if (orderType === 'ride' && refId) {
      await Ride.findByIdAndUpdate(refId, {
        paymentStatus: 'paid',
        paymentMethod: 'online',
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    res.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ message: 'Verification error', error: err.message });
  }
});

// @POST /api/payment/webhook - Razorpay webhook for async events (optional but recommended)
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    console.log('Razorpay webhook event:', event);
    // Handle events like payment.captured, payment.failed, etc. here if needed

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
