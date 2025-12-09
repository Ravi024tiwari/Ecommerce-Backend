import { Router } from "express";
import { verifyToken, isUser, isAdmin } from "../Middleware/isAuthenticated.js";
import {
  upsertReview,
  deleteReview,
  getProductReviews,
  getAllReviews
} from "../Controllers/ReviewController.js";

const ReviewRoute = Router();

ReviewRoute.put("/add/review", verifyToken, isUser, upsertReview);
ReviewRoute.delete("/reviews/delete/:reviewId", verifyToken, deleteReview);
ReviewRoute.get("/product/review/:productId", getProductReviews);
ReviewRoute.get("/admin/all-reviews", verifyToken, isAdmin, getAllReviews);

export  {ReviewRoute};
