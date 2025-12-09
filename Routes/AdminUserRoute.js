import { Router } from "express";
import { isAdmin,verifyToken } from "../Middleware/isAuthenticated.js";
import { getAllUsers,deleteUser } from "../Controllers/AdminUserControllers.js";
export const AdminUserRoute =Router();

AdminUserRoute.get("/admin/users/get-all", verifyToken, isAdmin, getAllUsers);
AdminUserRoute.delete("/admin/users/delete/:id", verifyToken, isAdmin, deleteUser);