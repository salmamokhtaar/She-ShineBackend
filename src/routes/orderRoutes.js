const express = require("express");
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/checkout", authMiddleware, placeOrder);
router.get("/", authMiddleware, getUserOrders);
router.get("/all", authMiddleware, getAllOrders); // Admin only
router.put("/:orderId", authMiddleware, updateOrderStatus); // Admin only

module.exports = router;
