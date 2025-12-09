import mongoose, { Schema } from  "mongoose"

const productSchema =Schema({
    title:{
        type:String,
        required:[true,"Product title is required"],
        trim:true,
        index:true
    },
    description:{
        type:String,
        required:[true,"Product description is required"],
        trim:true
    },
    price:{
        type:Number,
        required:[true,"Product price is required."],
        min:[0,"Price must be positive"]
    },
    currency:{
        type:String,
        default:"INR",
    },
    category:{
        type:String,
        required:[true,"Category is required"],
        trim:true,
    },
    brand:{
        type:String,
        trim:true,
        default:"Generic"
    },
    stock:{
        type:Number,
        default:0,
        min:[0,"Stock can't be negative"],
    },
    productImages:[
        {
            type:String,
            required:true
        }
    ],
    attributes:{
        type:Map,
        of:String,
        default:{}
    },
    averageRating:{
        type:Number,
        default:0,
        min:0,
        max:5,
    },
    reviewCount:{
        type:Number,
        default:0,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    soldCount: {
    type: Number,
    default: 0
    },
    status:{
        type:String,
        enum:["active","in-active","out-of-stock"],
        default:"active"
    },
},{timestamps:true})

//now we Text serh for them
productSchema.index({title:"text",description:"text",category:"text"})
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ soldCount: -1 });


export default mongoose.model("Product",productSchema)