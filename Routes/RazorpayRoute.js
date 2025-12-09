import { Router } from "express";
import { verifyToken, isUser } from "../Middleware/isAuthenticated.js";
import { createOrder, verifyPayment } from "../Controllers/RazorpayController.js";

export const OrderRoute = Router();

OrderRoute.post("/create-order", verifyToken, isUser, createOrder);
OrderRoute.post("/verify-payment", verifyToken, isUser, verifyPayment);
