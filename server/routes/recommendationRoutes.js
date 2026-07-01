const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations, getSimilarProducts, getTrendingProducts,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPersonalizedRecommendations);
router.get('/trending', getTrendingProducts);
router.get('/similar/:productId', getSimilarProducts);

module.exports = router;
