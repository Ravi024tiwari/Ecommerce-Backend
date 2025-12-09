import { Router } from "express";
import { verifyToken, isUser } from "../Middleware/isAuthenticated.js";
import {
  addToCart,
  increaseQty,
  decreaseQty,
  removeItem,
  getCart,
  getCartCount,
  clearCart
} from "../Controllers/CartController.js";

export const CartRoute = Router();

CartRoute.post("/add", verifyToken, isUser, addToCart);
CartRoute.put("/increase-qty", verifyToken, isUser, increaseQty);
CartRoute.put("/decrease-qty", verifyToken, isUser, decreaseQty);
CartRoute.delete("/remove-item/:productId", verifyToken, isUser, removeItem);
CartRoute.get("/my-cart", verifyToken, isUser, getCart);
CartRoute.get("/count", verifyToken, isUser, getCartCount);
CartRoute.delete("/clear", verifyToken, isUser, clearCart);
