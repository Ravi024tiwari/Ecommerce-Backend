import User from "../Models/UserModel.js";

// ✅ Get All Users
export const getAllUsers = async (req, res) => {
  try {
    // Sirf users chahiye, password nahi
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("Get All Users Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};