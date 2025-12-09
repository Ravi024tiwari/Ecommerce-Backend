import { Router } from "express";
import { verifyToken } from "../Middleware/isAuthenticated.js";
import { addAddress,getAllAddresses,updateAddress,deleteAddress,setDefaultAddress,getDefaultAddress } from "../Controllers/AddressController.js";

export const addressRoute =Router()


addressRoute.post("/add-address", verifyToken, addAddress);

// 2. Get All Addresses of User
addressRoute.get("/get-all-address", verifyToken, getAllAddresses);

// 3. Update Address
addressRoute.put("/update/:addressId", verifyToken, updateAddress);

// 4. Delete Address
addressRoute.delete("/delete-address/:addressId", verifyToken, deleteAddress);

// 5. Set Default Address
addressRoute.put("/set-default/:addressId", verifyToken, setDefaultAddress);

// 6. Get Default Address (For checkout auto-select)
addressRoute.get("/get-default", verifyToken, getDefaultAddress);

