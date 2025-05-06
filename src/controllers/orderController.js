const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { payByWaafiPay } = require("../../paymentEvc");

// Place an Order (Checkout)
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, paymentPhone, items } = req.body;
    let products = [];
    let totalAmount = 0;

    // Handle direct "Buy Now" purchase
    if (items && Array.isArray(items)) {
      // This is a direct purchase from product details page
      const productPromises = items.map(async (item) => {
        const product = await require('../models/Product').findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        totalAmount += product.price * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity
        };
      });

      products = await Promise.all(productPromises);
    } else {
      // Regular checkout from cart
      const cart = await Cart.findOne({ userId }).populate("products.productId");
      if (!cart || cart.products.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Filter out products with null productId and calculate total price
      const validProducts = cart.products.filter(item => item && item.productId);

      if (validProducts.length === 0) {
        return res.status(400).json({ message: "No valid products in cart" });
      }

      totalAmount = validProducts.reduce(
        (sum, item) => {
          // Ensure price is a number
          const price = typeof item.productId.price === 'number' ? item.productId.price : 0;
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          return sum + (price * quantity);
        },
        0
      );

      products = validProducts.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      }));
    }

    // Handle payment if needed
    if (paymentMethod === "evc-plus" && paymentPhone) {
      try {
        const waafiResponse = await payByWaafiPay({
          phone: paymentPhone,
          amount: totalAmount,
          merchantUid: process.env.merchantUid,
          apiUserId: process.env.apiUserId,
          apiKey: process.env.apiKey,
        });

        if (!waafiResponse.status) {
          return res.status(400).json({
            status: "failed",
            message: waafiResponse.error || "Payment Failed Try Again",
          });
        }
      } catch (paymentError) {
        return res.status(400).json({
          status: "failed",
          message: "Payment processing error: " + paymentError.message,
        });
      }
    }

    // Create the order
    const order = new Order({
      userId,
      products,
      totalAmount,
      paymentMethod: paymentMethod || "Credit Card",
      status: "pending"
    });

    await order.save();

    // Clear the cart after checkout if this was a cart checkout
    if (!items) {
      await Cart.findOneAndDelete({ userId });
    }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders for a User
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId").populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
