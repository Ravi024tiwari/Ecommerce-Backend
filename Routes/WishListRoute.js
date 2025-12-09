import { Router } from "express";
import { verifyToken,isUser } from "../Middleware/isAuthenticated.js";
import { toggleWishlist,getWishlist,getWishlistCount } from "../Controllers/WishListController.js";

const WishlistRoute =Router()


WishlistRoute.post("/toggle/:productId", verifyToken, toggleWishlist);
WishlistRoute.get("/my-wishlist", verifyToken, getWishlist);
WishlistRoute.get("/count", verifyToken, getWishlistCount);







export {WishlistRoute}