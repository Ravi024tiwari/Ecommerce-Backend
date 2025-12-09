import { Router } from "express";
import { verifyToken, isAdmin } from "../Middleware/isAuthenticated.js";
import { getDashboardSummary } from "../Controllers/AdminDashboardController.js";

const AdminDashBoardRoute = Router();

AdminDashBoardRoute.get("/dashboard-summary", verifyToken, isAdmin, getDashboardSummary);

export  {AdminDashBoardRoute};
