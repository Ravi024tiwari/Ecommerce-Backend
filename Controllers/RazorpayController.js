import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../Models/OrderModel.js";
import User from "../Models/UserModel.js";
import Product from "../Models/ProductModel.js";
import Cart from "../Models/CartModel.js";
import mongoose from "mongoose";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -------------------------------------------
// CREATE ORDER
// -------------------------------------------
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.body;

    // 1️⃣ Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Find the address
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Invalid address selected",
      });
    }

    // 3️⃣ Fetch cart
    const cart = await Cart.findOne({ userId }).populate("cartItems.productId");
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // Calculate total amount
    const totalAmount = cart.totalPrice * 100; // paise me convert for razorpay

    // 4️⃣ Create Razorpay order
    const options = {
      amount: totalAmount,
      currency: "INR",
      receipt: "order_rcpt_" + new Date().getTime(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 5️⃣ Create order in DB (Pending state)
    const newOrder = await Order.create({
      userId,
      items: cart.cartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        priceAtOrder: item.priceAtAddTime,
      })),
      totalAmount: cart.totalPrice,
      shippingAddress: {
        name: address.name,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
      },
      paymentInfo: {
        orderId: razorpayOrder.id,
        status: "pending",
      },
      orderStatus: "pending",
    });

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      razorpayOrder,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};


//now Verify the payment
export const verifyPayment = async (req, res) => {
  let session = null;

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // 1️⃣ Validate body fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    // 2️⃣ Validate signature from Razorpay docs
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Signature mismatch. Payment verification failed.",
      });
    }

    // 3️⃣ Fetch the order from DB
    const order = await Order.findOne({
      "paymentInfo.orderId": razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 4️⃣ Start MongoDB Transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 5️⃣ Update payment info
    order.paymentInfo = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "paid",
    };

    order.orderStatus = "processing";
    await order.save({ session });

    // 6️⃣ Reduce Stock + Increase soldCount
    for (const item of order.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity }, // Prevent negative stock
        },
        {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity,
          },
        },
        { new: true, session }
      );

      if (!updatedProduct) {
        // If stock problem: rollback
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.productId}`,
        });
      }
    }

    // 7️⃣ Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: order.userId },
      { cartItems: [], totalPrice: 0 },
      { session }
    );

    // 8️⃣ Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order confirmed!",
    });
  } catch (error) {
    console.log("Verify Payment Error:", error);

    // Safe rollback
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch {}
    }

    return res.status(500).json({
      success: false,
      message: "Payment verification failed. Please try again.",
    });
  }
};