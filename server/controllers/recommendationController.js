const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * AI Recommendation Engine
 * Hybrid approach: Content-Based + Collaborative Filtering + Trending
 */

// Content-based: compute tag/category similarity between products
const computeSimilarity = (productA, productB) => {
  const tagsA = new Set([...productA.tags, productA.category, productA.brand].filter(Boolean));
  const tagsB = new Set([...productB.tags, productB.category, productB.brand].filter(Boolean));

  const intersection = new Set([...tagsA].filter(x => tagsB.has(x)));
  const union = new Set([...tagsA, ...tagsB]);

  // Jaccard similarity
  const jaccardScore = union.size === 0 ? 0 : intersection.size / union.size;

  // Price proximity bonus (within 30% price range)
  const priceDiff = Math.abs(productA.price - productB.price);
  const priceScore = priceDiff < productA.price * 0.3 ? 0.2 : 0;

  return jaccardScore + priceScore;
};

// Trending score formula
const trendingScore = (product) => {
  const daysSinceCreated = (Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24);
  const recencyDecay = Math.max(0.1, 1 - daysSinceCreated / 365);
  return (product.views * 0.3 + product.purchases * 0.7) * recencyDecay + product.rating * 2;
};

// @desc    Get personalized recommendations for logged-in user
// @route   GET /api/recommendations
// @access  Private
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = Number(req.query.limit) || 8;

  // Get user's purchase history
  const userOrders = await Order.find({ user: userId }).select('items');
  const purchasedProductIds = new Set(
    userOrders.flatMap(o => o.items.map(i => i.product.toString()))
  );

  let recommendations = [];

  if (purchasedProductIds.size > 0) {
    // Collaborative filtering: find users who bought similar products
    const similarUserOrders = await Order.find({
      user: { $ne: userId },
      'items.product': { $in: [...purchasedProductIds] },
    }).select('items').limit(50);

    const collaborativeProductIds = new Set(
      similarUserOrders
        .flatMap(o => o.items.map(i => i.product.toString()))
        .filter(id => !purchasedProductIds.has(id))
    );

    if (collaborativeProductIds.size > 0) {
      const collaborativeProducts = await Product.find({
        _id: { $in: [...collaborativeProductIds] },
        isActive: true,
        stock: { $gt: 0 },
      }).select('-reviews').limit(20);

      recommendations.push(...collaborativeProducts.map(p => ({
        product: p,
        score: trendingScore(p) + 3, // Boost collaborative results
        reason: 'Users like you also bought',
      })));
    }

    // Content-based: find products similar to purchased ones
    const purchasedProducts = await Product.find({
      _id: { $in: [...purchasedProductIds] },
    }).select('tags category brand price');

    const allProducts = await Product.find({
      _id: { $nin: [...purchasedProductIds, ...recommendations.map(r => r.product._id.toString())] },
      isActive: true,
      stock: { $gt: 0 },
    }).select('-reviews').limit(50);

    for (const candidate of allProducts) {
      let maxSimilarity = 0;
      for (const purchased of purchasedProducts) {
        const sim = computeSimilarity(purchased, candidate);
        if (sim > maxSimilarity) maxSimilarity = sim;
      }
      if (maxSimilarity > 0.2) {
        recommendations.push({
          product: candidate,
          score: maxSimilarity * 5 + trendingScore(candidate),
          reason: 'Based on your purchases',
        });
      }
    }
  }

  // Cold start / fill up with trending products
  if (recommendations.length < limit) {
    const excludeIds = [
      ...purchasedProductIds,
      ...recommendations.map(r => r.product._id.toString()),
    ];
    const trending = await Product.find({
      _id: { $nin: excludeIds },
      isActive: true,
      stock: { $gt: 0 },
    }).select('-reviews').sort({ purchases: -1, rating: -1 }).limit(limit);

    trending.forEach(p => recommendations.push({
      product: p,
      score: trendingScore(p),
      reason: 'Trending now',
    }));
  }

  // Sort by score and deduplicate
  const seen = new Set();
  const uniqueRecs = recommendations
    .filter(r => {
      const id = r.product._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  res.json({ success: true, recommendations: uniqueRecs });
});

// @desc    Get similar products (for product detail page)
// @route   GET /api/recommendations/similar/:productId
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  const product = await Product.findById(req.params.productId).select('tags category brand price');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const candidates = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    stock: { $gt: 0 },
    $or: [
      { category: product.category },
      { tags: { $in: product.tags } },
      { brand: product.brand },
    ],
  }).select('-reviews').limit(30);

  const scored = candidates
    .map(c => ({ product: c, score: computeSimilarity(product, c) + trendingScore(c) * 0.1 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  res.json({ success: true, products: scored.map(s => s.product) });
});

// @desc    Get trending products
// @route   GET /api/recommendations/trending
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
    .select('-reviews')
    .limit(50);

  const scored = products
    .map(p => ({ product: p, score: trendingScore(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.product);

  res.json({ success: true, products: scored });
});

module.exports = { getPersonalizedRecommendations, getSimilarProducts, getTrendingProducts };
