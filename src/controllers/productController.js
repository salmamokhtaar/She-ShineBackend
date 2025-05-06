// ✅ controllers/productController.js
const Product = require("../models/Product");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      isFeatured,
      discount,
      tags,
      rating,
      ratingCount,
    } = req.body;

    const image = req.file ? `/productUploads/${req.file.filename}` : null;
    if (!image) return res.status(400).json({ message: "Image file is required" });

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      isFeatured,
      discount,
      image,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      rating: rating || 0,
      ratingCount: ratingCount || 0,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.categoryName;
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all categories and their products grouped
exports.getAllCategoriesWithProducts = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const results = {};

    for (const category of categories) {
      const products = await Product.find({ category });
      results[category] = products;
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured products
exports.getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};