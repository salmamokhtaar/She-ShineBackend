const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID (admin or own user)
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is requesting their own info or is admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin or own user)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, role, password } = req.body;

    // Check if user is updating their own profile or is admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    // If trying to change role to admin, ensure requester is admin
    if (role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Cannot change role to admin." });
    }

    // Find user
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role && req.user.role === "admin") user.role = role;
    
    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(userId).select("-password");
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
