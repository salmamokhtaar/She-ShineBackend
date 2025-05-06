const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["EVC-Plus", "evc-plus", "Credit Card", "credit-card", "Cash", "cash"],
      required: true,
      set: function(value) {
        // Normalize the payment method to handle different cases
        return value ? value.toLowerCase() : value;
      }
    },
    status: { type: String, enum: ["pending", "shipped", "delivered", "canceled"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
