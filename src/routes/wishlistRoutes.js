const express = require("express");
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getWishlist);
router.post("/add", authMiddleware, addToWishlist);
router.delete("/remove/:productId", authMiddleware, removeFromWishlist);

module.exports = router;
