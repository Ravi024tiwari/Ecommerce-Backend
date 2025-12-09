import { Router } from "express";
import { verifyToken, isAdmin } from "../Middleware/isAuthenticated.js";
import {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  cancelOrderAdmin
} from "../Controllers/AdminOrderController.js";

export const AdminOrderRoute = Router();

AdminOrderRoute.get("/get-all-orders", verifyToken, isAdmin, getAllOrders);
AdminOrderRoute.get("/order/:id", verifyToken, isAdmin, getOrderByIdAdmin);
AdminOrderRoute.put("/order/update-status/:id", verifyToken, isAdmin, updateOrderStatus);
AdminOrderRoute.put("/order/cancel/:id", verifyToken, isAdmin, cancelOrderAdmin);
