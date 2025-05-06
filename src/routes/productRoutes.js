// ✅ routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const upload = require("../middleware/multerConfig");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/isAdmin");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getRecommendedProducts,
  getAllCategoriesWithProducts
} = require("../controllers/productController");

// ✅ Get all categories with grouped products
router.get("/categories", getAllCategoriesWithProducts);

// ✅ Get products for specific category
router.get("/category/:categoryName", getProductsByCategory);

// Place category/tag routes BEFORE /:id
router.get("/featured", getRecommendedProducts);
router.get("/category/:categoryName", getProductsByCategory);
router.get("/tag/:tagName", async (req, res) => {
  try {
    const tag = req.params.tagName;
    const products = await Product.find({ tags: tag });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/categories", async (req, res) => {
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
});


router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", authMiddleware, isAdmin, upload.single("image"), createProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;