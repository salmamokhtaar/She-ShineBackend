const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).populate("products.productId");
    if (!wishlist) return res.status(200).json({ products: [] });

    const validProducts = wishlist.products.filter(p => p.productId);
    res.status(200).json({ products: validProducts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [{ productId }] });
    } else {
      const exists = wishlist.products.some(p => p.productId.toString() === productId);
      if (exists) return res.status(400).json({ message: "Product already in wishlist" });
      wishlist.products.push({ productId });
    }

    await wishlist.save();
    res.status(200).json({ message: "Added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const updated = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { products: { productId: new mongoose.Types.ObjectId(productId) } } },
      { new: true }
    ).populate("products.productId");

    res.status(200).json({ message: "Removed from wishlist", products: updated?.products || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
