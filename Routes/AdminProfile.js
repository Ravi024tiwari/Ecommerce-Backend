import { Router } from "express";
import { verifyToken,isAdmin} from "../Middleware/isAuthenticated,js";
import upload from "../Middleware/Multer.js"
import { updateProfile,changePassword } from "../Controllers/UpdateProfileController.js";


const AdminProfile =Router()

AdminProfile.put("/update-profile", verifyToken, isAdmin,upload.single("profileImage"), updateProfile);
AdminProfile.put("/change-password", verifyToken, isAdmin, changePassword);

