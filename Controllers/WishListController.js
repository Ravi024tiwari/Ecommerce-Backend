import User from "../Models/UserModel.js";
import Product from "../Models/ProductModel.js";


//TOGGLE WISHLIST OF THE PRODUCT

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // Step 1 → Check if product exists
    const product = await Product.findById(productId);//this product added into wishlist of that user
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Step 2 → Get user
    const user = await User.findById(userId);

    // Step 3 → Check if product already in wishlist
    const alreadyExist = user.wishlist.some((id) => id.toString() === productId);

    
    if (alreadyExist) {
      // REMOVE from wishlist
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        isLiked: false,
        wishlistCount: user.wishlist.length,//here we send that user as well
        user,
      });
    } else {
      // ADD to wishlist
      user.wishlist.push(productId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        isLiked: true,
        wishlistCount: user.wishlist.length,
        user
      });
    }
  } catch (error) {
    console.log("Toggle Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
    });
  }
};

//GET WISHLIST
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("wishlist");

    return res.status(200).json({
      success: true,
      wishlistCount: user.wishlist.length,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.log("Get Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

//GET COUNT OF THE WISHLISTS
export const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    return res.status(200).json({
      success: true,
      count: user.wishlist.length,// HERE WE GET THAT LENGTH OF THE ADDED PRODUCT ON THE WISHLIST
    });
  } catch (error) {
    console.log("Wishlist Count Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist count",
    });
  }
};


export {toggleWishlist}
