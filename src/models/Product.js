const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ["women", "kids", "sales", "new-arrivals", "recommended"] 
    },
    tags: [{ 
      type: String 
    }], // 🆕 New field for multiple tags
    stock: { type: Number, required: true, default: 0 },
    image: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }, // average rating
    ratingCount: { type: Number, default: 0 } // total number of ratings

  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
