const express = require("express");
const { getCart, addToCart, removeFromCart, moveToCart } = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.delete("/remove/:productId", authMiddleware, removeFromCart);
router.post("/move-to-cart", authMiddleware, moveToCart);

module.exports = router;
