const express = require("express");
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

// Get all users (admin only)
router.get("/", authMiddleware, getAllUsers);

// Get user by ID (admin or own user)
router.get("/:id", authMiddleware, getUserById);

// Update user (admin or own user)
router.put("/:id", authMiddleware, updateUser);

// Delete user (admin only)
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
