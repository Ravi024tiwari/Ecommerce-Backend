import User from "../Models/UserModel.js";
import bcrypt from "bcryptjs";

//update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // logged-in user
    const { name, email, phone, address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔥 Profile photo update
    if (req.file) {
      user.profileImage = req.file.path; // cloudinary URL
    }

    // 🔥 Email change check
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log("User Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

//update admin profile

export const adminUpdateUser = async (req, res) => {
  try {
    const userId = req.params.id; // user to update
    const { name, email, phone, address, isBlocked, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔥 Profile image update (Cloudinary)
    if (req.file) {
      user.profileImage = req.file.path;
    }

    // 🔥 Email change check
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // Admin-specific updates
    if (typeof isBlocked === "boolean") {
      user.isBlocked = isBlocked;
    }

    if (role) {
      user.role = role; // optional future: admin/user
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log("Admin Update User Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update user" });
  }
};






// -------------------------------------------
// 2️⃣ CHANGE PASSWORD (User / Admin)
// -------------------------------------------
export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both old and new passwords",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔥 Match old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // 🔥 Set new password
    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("User Change Password Error:", error);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

//update  ADMIN PASSWORD 
export const adminChangeUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 Admin directly sets new password (no old password check)
    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully by admin",
    });
  } catch (error) {
    console.log("Admin Change Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change user password",
    });
  }
};

