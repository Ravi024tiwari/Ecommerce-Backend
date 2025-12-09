import Review from "../Models/ReviewModel.js";
import Product from "../Models/ProductModel.js";

/* -------------------------------------------------
   CREATE or UPDATE REVIEW
-------------------------------------------------- */
export const upsertReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Product id & rating are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed
    let review = await Review.findOne({ productId, userId });

    if (review) {
      // Update review
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        productId,
        userId,
        rating,
        comment,
      });
    }

    // Recalculate product rating & count
    const reviews = await Review.find({ productId });

    const avg =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    product.averageRating = avg;
    product.reviewCount = reviews.length;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review submitted",
      review,
    });
  } catch (error) {
    console.log("Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* -------------------------------------------------
   DELETE REVIEW
-------------------------------------------------- */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    // Only user or admin can delete
    if (review.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this review",
      });
    }

    const productId = review.productId;

    await review.deleteOne();

    // Recalculate rating
    const reviews = await Review.find({ productId });
    let avg = 0;

    if (reviews.length > 0) {
      avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    }

    await Product.findByIdAndUpdate(productId, {
      averageRating: avg,
      reviewCount: reviews.length,
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.log("Delete Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

/* -------------------------------------------------
   GET ALL REVIEWS FOR A PRODUCT
-------------------------------------------------- */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).populate(
      "userId",
      "name profileImage"
    );

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("Get Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};
//get all the reviews from the database

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name email profileImage") // User details (Name, Email, Image)
      .populate("productId", "title productImages")  // Product details (Title, Image)
      .sort({ createdAt: -1 }); // Latest reviews first

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.log("Get All Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};