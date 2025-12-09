import Order from "../Models/OrderModel.js";

//get all user order
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }) // latest first
      .populate("items.productId", "title price productImages")  // UI ke liye perfect
      .populate("userId", "name email");

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.log("Get My Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};


//get single order
export const getSingleMyOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate("items.productId", "title price productImages description")
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent accessing other user's orders
    if (order.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized — This order does not belong to you",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.log("Get Single My Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};


