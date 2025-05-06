const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("products.productId");

    if (!cart) {
      return res.status(200).json({ products: [] });
    }

    // Filter out products with null productId
    if (cart.products && Array.isArray(cart.products)) {
      // Remove products with null productId from the cart in the database
      const validProducts = cart.products.filter(item => item && item.productId);

      // If there are invalid products, update the cart in the database
      if (validProducts.length !== cart.products.length) {
        cart.products = validProducts;
        await cart.save();
      }
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Verify the product exists
    const Product = require("../models/Product");
    const productExists = await Product.findById(productId);

    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId: req.user.id,
        products: [{ productId, quantity: Math.max(1, quantity) }]
      });
    } else {
      // Check if product already exists in cart
      const existingProductIndex = cart.products.findIndex(
        p => p.productId && p.productId.toString() === productId
      );

      if (existingProductIndex >= 0) {
        // Update quantity of existing product
        cart.products[existingProductIndex].quantity += quantity;

        // Ensure quantity is at least 1
        if (cart.products[existingProductIndex].quantity < 1) {
          cart.products[existingProductIndex].quantity = 1;
        }
      } else {
        // Add new product to cart
        cart.products.push({
          productId,
          quantity: Math.max(1, quantity)
        });
      }

      // Filter out any null products that might have gotten in
      cart.products = cart.products.filter(item => item && item.productId);
    }

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate("products.productId");
    res.status(200).json({ message: "Added to cart", cart: populatedCart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: error.message });
  }
};


// Remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Find the cart first
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the product
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { products: { productId } } },
      { new: true }
    );

    // Return populated cart
    const populatedCart = await Cart.findById(updatedCart._id).populate("products.productId");
    res.status(200).json({ message: "Product removed from cart", cart: populatedCart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Move item from wishlist to cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Verify the product exists
    const Product = require("../models/Product");
    const productExists = await Product.findById(productId);

    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId: req.user.id,
        products: [{ productId, quantity: 1 }]
      });
    } else {
      // Check if product already exists in cart
      const existingProduct = cart.products.find(
        p => p.productId && p.productId.toString() === productId
      );

      if (!existingProduct) {
        // Add to cart if not already there
        cart.products.push({ productId, quantity: 1 });
      }

      // Filter out any null products
      cart.products = cart.products.filter(item => item && item.productId);
    }

    // Remove from wishlist
    try {
      await Wishlist.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { products: { productId } } }
      );
    } catch (wishlistError) {
      console.error("Error removing from wishlist:", wishlistError);
      // Continue even if wishlist removal fails
    }

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate("products.productId");
    res.status(200).json({ message: "Moved to cart", cart: populatedCart });
  } catch (error) {
    console.error("Error moving to cart:", error);
    res.status(500).json({ message: error.message });
  }
};
