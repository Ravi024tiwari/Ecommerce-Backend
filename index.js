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
dotenv.config()//here we configure that as well

const app =express();
//enbale the cors as well
app.use(cors({
    origin:process.env.FRONTEND_URL, 
    credentials: true, // allow cookies + auth headers
  }))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())//configuring that cookie parser as well






app.listen(process.env.PORT, async()=>{
    await dbConnect();// here we conntect the data base
    console.log(`App is listening at port ,${process.env.PORT}`)
})

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
