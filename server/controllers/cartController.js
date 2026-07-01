const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock isActive');

  if (!cart) {
    return res.json({ success: true, cart: { items: [], totalItems: 0, totalPrice: 0 } });
  }

  // Filter out inactive products
  cart.items = cart.items.filter(item => item.product && item.product.isActive);
  res.json({ success: true, cart });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} items in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingIndex >= 0) {
    const newQty = cart.items[existingIndex].quantity + Number(quantity);
    if (newQty > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} items in stock`);
    }
    cart.items[existingIndex].quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.images[0] || '',
      price: product.price,
      quantity: Number(quantity),
      stock: product.stock,
    });
  }

  await cart.save();
  res.json({ success: true, cart });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === req.params.productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(req.params.productId);
    if (quantity > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} items in stock`);
    }
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  res.json({ success: true, cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== req.params.productId
  );

  await cart.save();
  res.json({ success: true, cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], totalItems: 0, totalPrice: 0 }
  );
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
