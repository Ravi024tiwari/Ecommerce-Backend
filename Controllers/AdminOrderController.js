import Order from "../Models/OrderModel.js";
import Product from "../Models/ProductModel.js";

//get all order to admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email") // User details
      .populate({
        path: "items.productId", // 🔥 FIX: Product details ko bhi populate kiya
        select: "title price productImages category brand", // Sirf zaroori fields layenge
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.log("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

//get Single  order
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("Get Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

//update order Status
/* -----------------------------------------------------
   UPDATE ORDER STATUS  (processing → shipped → delivered)
------------------------------------------------------ */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowed = ["processing", "shipped", "delivered","cancelled"];

    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be updated",
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Status updated",
      order,
    });
  } catch (error) {
    console.log("Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

//cancel ordr by admin
/* -----------------------------------------------------
   ADMIN CANCEL ORDER  (Restore stock)
------------------------------------------------------ */
export const cancelOrderAdmin = async (req, res) => {
  let session;
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Cannot cancel shipped/delivered orders
    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }

    // Start transaction
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (error) {
      session = null;
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    // Update order status
    order.orderStatus = "cancelled";
    order.paymentInfo.status =
      order.paymentInfo.status === "paid" ? "refunded_or_cancelled" : "failed";

    await order.save({ session });

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled, stock restored",
    });
  } catch (error) {
    console.log("Cancel Order Error:", error);
    try {
      if (session) {
        await session.abortTransaction();
      }
    } catch {}
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};