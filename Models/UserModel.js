import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "", // by default empty or later add a placeholder
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    //its store multiple address where we have to dispatch the order
    addresses: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },

        name: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },

        isDefault: { type: Boolean, default: false },
      },
    ],
    isBlock: {
      type: Boolean,
      default: false,
    },
    recentlyViewed: [
      //Here is the recently viewed product push into the
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

//here we make the pre middleware to hash hte password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // agar mera passwrd modified nhi hhai
  this.password = await bcrypt.hash(this.password, 10);
  next(); //here we hash that passwrd when we created a new document
}); // before save means crete ye password ko hash kardega

//now make a method to compare that password

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password); //here we return true or false
};

export default mongoose.model("User", userSchema); //here we export that user
