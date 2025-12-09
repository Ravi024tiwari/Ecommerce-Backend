import mongoose from "mongoose";

const dbConnect =async(req,res)=>{
    try {
        const db =await mongoose.connect(process.env.MONGODB_URL)
        if(db){
            console.log('MongoDb connected successfully..');
        }
    } catch (error) {
        console.log(error)
    }
}

export {dbConnect}//here we connect the database to it