const express = require('express');
const router = express.Router();
const {
  createPaymentIntent, createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/payment-intent', protect, createPaymentIntent);
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
