import mongoose, { Schema } from "mongoose"
const cartItemSchema=Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    quantity:{
        type:Number,
        default:1,
        min:[1,"Quantity of product atleast 1"]
    },
    priceAtAddTime:{
        type:Number,
        required:true //price snapshot when added to cart
    },
},{_id:false})

const cartSchema =Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    cartItems:[cartItemSchema],
    totalPrice:{
        type:Number,
        default:0
    },
},{timestamps:true})

export default mongoose.model('Cart',cartSchema)