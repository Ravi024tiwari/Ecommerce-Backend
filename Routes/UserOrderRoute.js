import { Router } from "express";
import { verifyToken, isUser } from "../Middleware/isAuthenticated.js";
import { getMyOrders, getSingleMyOrder } from "../Controllers/UserOrderController.js";

export const UserOrderRoute = Router();

// ✔ Get all orders
UserOrderRoute.get("/my-orders", verifyToken, isUser, getMyOrders);

// ✔ Get single order
UserOrderRoute.get("/my-orders/:id", verifyToken, isUser, getSingleMyOrder);
