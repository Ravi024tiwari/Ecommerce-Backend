import jwt from "jsonwebtoken"
import User from "../Models/UserModel.js"

const verifyToken =async(req,res,next)=>{
    try {
        const token =req.cookies.token || req.headers.authorization?.split(" ")[1]; ;//here we get that token 
        console.log("Token from the backend :",token)

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unotherized..please login"
            })
        }
        const decoded =jwt.verify(token, process.env.JWT_TOKEN)//here  we verify that token that stored into cookie
        const user=await User.findById(decoded.id);//jo hamne coookie me store kiya tha

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
       if(user.isBlocked){//agar koi blocked user login krne ki kosish kr rha hai
         return res.status(403).json({
        success: false,
        message: "Account blocked by admin. Contact support.",
      });
       }
       req.user =user;//yha uss logged in user ko daal diay

       next() //pass the controller to other middleware

    } catch (error) {
        console.log("Verify token error",error);
        return res.status(401).json({
            success:false,
            message:"Token is expired..Please login again"
        })
    }
}

// ✅ Check if the logged-in user is a normal user
 const isUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (req.user.role !== "user") {
    return res.status(403).json({
      success: false,
      message: "Access denied — Users only",
    });
  }

  next();
};

// ✅ Check if the logged-in user is an admin
 const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied — Admins only",
    });
  }

  next();
};


export {verifyToken,isUser,isAdmin} //its used in the routes as a middleware to gt that