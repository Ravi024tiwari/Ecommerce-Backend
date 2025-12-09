import { Router } from "express";
import { verifyToken,isUser ,isAdmin} from "../Middleware/isAuthenticated.js";
import upload from "../Middleware/Multer.js"
import { updateUserProfile,adminUpdateUser,changeUserPassword,adminChangeUserPassword } from "../Controllers/UpdateProfileController.js";


export const UserProfileRoute =Router()
//USER PROFILE UPDATE
UserProfileRoute.put("/update-profile",verifyToken,isUser,upload.single("profileImage"),updateUserProfile);

//UPDATE ADMIN PROFILE
UserProfileRoute.put("/update-user/:id",verifyToken,isAdmin,upload.single("profileImage"),adminUpdateUser);



//user change password
UserProfileRoute.put("/change-password",verifyToken,isUser,changeUserPassword );

//admin change password 
UserProfileRoute.put("/change-password/:id",verifyToken,isAdmin,adminChangeUserPassword);



