import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true, // faster product-based queries
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating between 1–5"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment should not exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate reviews from same user for same product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// ✅ Static method to recalculate Product average rating
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: "$productId",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const Product = mongoose.model("Product");

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats[0].avgRating,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    // If all reviews deleted
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

// ✅ Trigger avg rating recalculation on save and delete
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(this.productId);
});

reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRating(this.productId);
});

export default mongoose.model("Review", reviewSchema);
