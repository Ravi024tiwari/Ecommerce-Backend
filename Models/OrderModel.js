import mongoose, { Schema } from "mongoose";

// 🛒 Item Schema
const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtOrder: {
    type: Number,
    required: true
  }
}, { _id: false });


// 💳 Payment Info
const paymentInfoSchema = new Schema({
  paymentId: String,
  orderId: String,
  signature: String,
  method: { type: String, default: "razorpay" },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  }
}, { _id: false });


// 🏠 Shipping Address
const shippingAddressSchema = new Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: false });


// 🧾 Order Schema
const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [orderItemSchema],

  totalAmount: {
    type: Number,
    required: true
  },

  paymentInfo: paymentInfoSchema,

  shippingAddress: shippingAddressSchema,

  orderStatus: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },

  deliveredAt: Date,//this is the delivrey date of the order

  notes: {
    type: String,
    trim: true
  },

  orderNumber: { type: String, unique: true }
}, { timestamps: true });


// Auto-generate readable Order Number
orderSchema.pre("save", function(next) {
  if (!this.orderNumber) {
    this.orderNumber = "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  }
  next();
});

// Indexing
orderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
