import User from "../Models/UserModel.js";
import mongoose from "mongoose";

//here we create a new address 
export const addAddress = async (req, res) => {
  try {
    // Middleware se user ID aayegi
    const userId = req.user._id; 
    const {
      name,
      phone,
      street,
      city,
      state,
      pincode,
      country = "India",
      isDefault,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required address fields.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // New Address Object (Mongoose ko _id khud banane do)
    const newAddress = {
      name,
      phone,
      street,
      city,
      state,
      pincode,
      country,
      isDefault: false, // Default false set kiya
    };

    // 1️⃣ Sabhi purane addresses ko default: false karo agar naya address default set ho raha hai
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      newAddress.isDefault = true;
    }

    // 2️⃣ Naya address array mein push karo (Mongoose ab _id generate karega)
    user.addresses.push(newAddress);

    // 3️⃣ User ko save karo (Yehi zaroori 'await' hai)
    await user.save(); 

    // Save hone ke baad, addresses ko sort karke bhejo
    const sortedAddresses = [...user.addresses].sort(
        (a, b) => (b.isDefault === true) - (a.isDefault === true)
    );
    console.log("New Address added successfully...")
    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: sortedAddresses, // Frontend ko addresses bhejo
    });

  } catch (error) {
    console.log("Add Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

//get all the address of that logged in user
export const getAllAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Default address ko top par lane ke liye sort
    const sortedAddresses = [...user.addresses].sort(
      (a, b) => (b.isDefault === true) - (a.isDefault === true)
    );

    return res.status(200).json({
      success: true,
      addresses: sortedAddresses,
    });
  } catch (error) {
    console.log("Get Addresses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

//update the address of the user
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const {
      name,
      phone,
      street,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Address find karo
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Update allowed fields
    if (name) address.name = name;
    if (phone) address.phone = phone;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (country) address.country = country;

    // Handle default logic
    if (isDefault === true) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      address.isDefault = true;
    }

    // Save user
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.log("Update Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

//delete address 
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault; // check if default

    // 1️⃣ Remove the address
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId.toString()
    );

    // 2️⃣ If deleted address was default & some addresses remain → make first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.log("Delete Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

//set the default address for placing order 
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Sabko default false karo
    user.addresses.forEach((addr) => (addr.isDefault = false));

    // Selected address ko default true
    address.isDefault = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.log("Set Default Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update default address",
    });
  }
};

//get tje default address of the order placed
export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find default address
    const defaultAddress = user.addresses.find(
      (addr) => addr.isDefault === true
    );

    return res.status(200).json({
      success: true,
      defaultAddress: defaultAddress || null,
    });
  } catch (error) {
    console.log("Get Default Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get default address",
    });
  }
};