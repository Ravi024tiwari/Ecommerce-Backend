import express from "express"
import { Signup,LoginUser,AdminLogin,Logout } from "../Controllers/AuthControllers.js";
import { verifyToken } from "../Middleware/isAuthenticated.js";
const AuthRoute =express();

AuthRoute.post("/signup",Signup);//here we call them
AuthRoute.post("/admin/login",AdminLogin)
AuthRoute.post("/user/login",LoginUser)
AuthRoute.post("/logout",verifyToken,Logout)// here its logout both the admin and user for the same routes


export {AuthRoute}