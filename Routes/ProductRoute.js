import express, { Router } from "express" 
import upload from "../Middleware/Multer.js"
import { verifyToken,isAdmin,isUser } from "../Middleware/isAuthenticated.js"
import { createProduct ,getAllProducts,getSingleProduct,updateProduct,deleteProduct,updateProductStatus,searchProducts,getSearchSuggestions,addRecentlyViewed,getRecentlyViewed } from "../Controllers/ProductController.js"
import { getHomeData } from "../Controllers/ProductController.js"
export const ProductRoute =Router()

ProductRoute.post("/create-product",verifyToken,isAdmin,upload.array("productImages",3),createProduct)//here we create the product
ProductRoute.get("/get-all-products",verifyToken,getAllProducts)
ProductRoute.get("/single-product/:id",verifyToken,getSingleProduct)
ProductRoute.put("/update-product/:id",verifyToken,upload.array("productImages",3),updateProduct)
ProductRoute.delete("/delete-product/:id",verifyToken,deleteProduct)
ProductRoute.put("/updateStatus/:id",verifyToken,updateProductStatus)
ProductRoute.get("/home-config/product",getHomeData)//trending products ko home page pr show krna
ProductRoute.get("/search",verifyToken,searchProducts)
ProductRoute.get("/search-suggestions", getSearchSuggestions);

//Here its for the recently viewed products
ProductRoute.post("/recently-viewed/:productId", verifyToken, addRecentlyViewed);
ProductRoute.get("/recently-viewed", verifyToken, getRecentlyViewed);




