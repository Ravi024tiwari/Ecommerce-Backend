import express from "express"
import dotenv from "dotenv"
import { dbConnect } from "./dbConnect/DbConnect.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import { AuthRoute } from "./Routes/AuthRoute.js";
import { ProductRoute } from "./Routes/ProductRoute.js";
import { WishlistRoute } from "./Routes/WishListRoute.js";
import { CartRoute } from "./Routes/CartRoute.js";
import { OrderRoute } from "./Routes/RazorpayRoute.js";
import { AdminOrderRoute } from "./Routes/AdminOrderRoute.js";
import { UserOrderRoute } from "./Routes/UserOrderRoute.js";
import { ReviewRoute } from "./Routes/ReviewRoute.js";
import {AdminDashBoardRoute} from "./Routes/DashBoardRoute.js";
import { UserProfileRoute } from "./Routes/UserProfileRoute.js";
import { addressRoute } from "./Routes/AddressRoute.js";
import { AdminUserRoute } from "./Routes/AdminUserRoute.js";
import { getAllProducts } from "./Controllers/ProductController.js";
import mongoose from "mongoose";
dotenv.config()//here we configure that as well

const app =express();
console.log(process.env.FRONTEND_URL)
//enbale the cors as well
app.use(cors({
    origin:"*", 
    credentials: true, // allow cookies + auth headers
  }))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())//configuring that cookie parser as well


app.get("/", (req, res)=>{
  return res.json({
    status: "healthy"
  })
})



mongoose.connect(process.env.MONGODB_URL).then(()=>console.log("success")).catch((e)=>console.error(e))

app.use("/api/v1",AuthRoute)//uske baad isko call kr dega for the authVerification
app.use("/api/v1",ProductRoute)
app.use("/api/v1",WishlistRoute)
app.use("/api/v1",CartRoute)
app.use("/api/v1",OrderRoute)
app.use("/api/v1",AdminOrderRoute)
app.use("/api/v1",UserOrderRoute)
app.use("/api/v1",ReviewRoute)//here its for reveiw route
app.use("/api/v1",AdminDashBoardRoute)
app.use("/api/v1",UserProfileRoute)
app.use("/api/v1",addressRoute)
app.use("/api/v1",AdminUserRoute)
app.get("/get-all-products-new",getAllProducts)

app.listen(8080, ()=>console.log("listening at 8080"))