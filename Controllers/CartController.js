import Cart from "../Models/CartModel.js";
import Product from "../Models/ProductModel.js";

// its calculate the total price
const calculateTotal = (items) => {
  return items.reduce((acc, item) => acc + item.quantity * item.priceAtAddTime, 0);
};


// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    // If no cart exists → create new cart
    if (!cart) {
      cart = await Cart.create({
        userId,
        cartItems: [
          {
            productId,
            quantity: 1,
            priceAtAddTime: product.price,
          },
        ],
        totalPrice: product.price,
      });

      return res.status(200).json({
        success: true,
        message: "Item added to cart",
        cart,
      });
    }

    // If cart exists, check if product already added
    let existingItem = cart.cartItems.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItem) {
      // Increase quantity
      existingItem.quantity += 1;
    } else {
      // Add new item
      cart.cartItems.push({
        productId,
        quantity: 1,
        priceAtAddTime: product.price,
      });
    }

    // Recalculate total
    cart.totalPrice = calculateTotal(cart.cartItems);

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });

  } catch (error) {
    console.log("Add To Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to add to cart" });
  }
};



// 2️⃣ INCREASE QUANTITY
// --------------------------------------------------
export const increaseQty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.cartItems.find(
      (i) => i.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.quantity += 1;

    cart.totalPrice = calculateTotal(cart.cartItems);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Quantity increased",
      cart,
    });
  } catch (error) {
    console.log("Increase Qty Error:", error);
    res.status(500).json({ success: false, message: "Failed to increase quantity" });
  }
};





// 3️⃣ DECREASE QUANTITY
// --------------------------------------------------
export const decreaseQty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.cartItems.find(
      (i) => i.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      // If quantity becomes zero → remove item
      cart.cartItems = cart.cartItems.filter(
        (i) => i.productId.toString() !== productId
      );
    }

    cart.totalPrice = calculateTotal(cart.cartItems);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart,
    });
  } catch (error) {
    console.log("Decrease Qty Error:", error);
    res.status(500).json({ success: false, message: "Failed to decrease quantity" });
  }
};




// 4️⃣ REMOVE ITEM FROM CART
// --------------------------------------------------
export const removeItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.cartItems = cart.cartItems.filter(
      (i) => i.productId.toString() !== productId
    );

    cart.totalPrice = calculateTotal(cart.cartItems);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed",
      cart,
    });
  } catch (error) {
    console.log("Remove Item Error:", error);
    res.status(500).json({ success: false, message: "Failed to remove item" });
  }
};




// 5️⃣ GET USER CART
// --------------------------------------------------
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate("cartItems.productId");

    if (!cart) {
      return res.status(200).json({
        success: true,
        cartItems: [],
        totalPrice: 0,
        count: 0
      });
    }

    return res.status(200).json({
      success: true,
      cartItems: cart.cartItems,
      totalPrice: cart.totalPrice,
      count: cart.cartItems.length,
    });
  } catch (error) {
    console.log("Get Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
};



// 6️⃣ GET CART COUNT
// --------------------------------------------------
export const getCartCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });

    return res.status(200).json({
      success: true,
      count: cart ? cart.cartItems.length : 0,
    });
  } catch (error) {
    console.log("Cart Count Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch count" });
  }
};




// 7️⃣ CLEAR CART
// --------------------------------------------------
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.findOneAndUpdate(
      { userId },
      { cartItems: [], totalPrice: 0 }
    );

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.log("Clear Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
};

