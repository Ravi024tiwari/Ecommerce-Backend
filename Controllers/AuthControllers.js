import User from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const Signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; //here we get that
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Registration credentils is incomplete",
      });
    }
    //Check kro kya phle se koi issi email se registered nhi hai
    const isAlreadyExit = await User.findOne({ email }); //
    if (isAlreadyExit) {
      return res.status(500).json({
        success: false,
        message: "Email is already registerd ..try Again",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role, //role bhi to lena padega
    }); //here we create the new user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "New User registration failed",
      });
    }
    //agar successfully create ho gya
    return res.status(200).json({
      success: true,
      message: `${name} registration successfully`, //here we send the resposne from the backend
      user
    });
  } catch (error) {
    console.log(error);
    return res.staus(500).json({
      success: false,
      message: "Registration failed..",
    });
  }
};

//Now we do login for User and admin
const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter all credentils ..",
      });
    }

    const user = await User.findOne({ email }); // here we get that user
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Pls Enter correct email and password..",
      });
    }
    //agar user blocked hai by admin
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Contact support.",
      });
    }
   

    if (user.role !== "user") {
      //agr jisne login kiya hai vo admin nhi hai
      return res.status(403).json({
        success: false,
        message: "Access denied! This route is for normal users only.",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password); //kya password shi hai ya nhi
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect..Try Again",
      });
    }

    // now we make the token for jwt
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_TOKEN,
      { expiresIn: "1d" }
    );

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login token creation failed",
      });
    }
    //here we send the token into Cookie .. to save into cookie taki hum baad me verify kr sakte hai

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 5 days
    });

    //afte that jab sb kuch ho jaae
     user.password =undefined
    return res.status(200).json({
      success: true,
      message: `${user.name} login successfully`,
      user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User login failed.. try again",
    });
  }
};



//now we make the admin
const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password.",
      });
    }

    // 2️⃣ Check if user exists
    const admin = await User.findOne({ email })
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3️⃣ Check if user is actually admin
    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied! This route is for admins only.",
      });
    }

    // 4️⃣ Check if admin account is blocked
    if (admin.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Admin account is blocked. Contact super admin.",
      });
    }

    // 5️⃣ Compare password (using model method)
    const isPasswordCorrect = await admin.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    // 6️⃣ Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_TOKEN,
      { expiresIn: "1d" }
    );

    // 7️⃣ Store token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // 8️⃣ Send success response
    return res.status(200).json({
      success: true,
      message: `${admin.name} logged in successfully as Admin.`,
      admin,
      token // optional for testing
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Admin login failed. Please try again later.",
    });
  }
};

//now we make the logout for both
const Logout =async(req,res)=>{
    try {
        //make the cookie clear 
        const loggedInUser =await req.user; //here we get that logged in user or admin
        res.clearCookie("token",{ // here we clear that token from the backend..
            httpOnly:true,
            sameSite:"strict",
        })
    return res.status(200).json({
        success:true,
        message:`Successfully logout the user..`,
        loggedInUser
    })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
export { Signup,LoginUser ,AdminLogin,Logout};
