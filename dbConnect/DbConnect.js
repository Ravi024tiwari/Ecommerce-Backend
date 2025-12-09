// import mongoose from "mongoose";

// const dbConnect =async(req,res)=>{
//     try {
//         const db =await mongoose.connect(process.env.MONGODB_URL)
//         if(db){
//             console.log('MongoDb connected successfully..');
//         }
//     } catch (error) {
//         console.log(error)
//     }
// }

// export {dbConnect}

import mongoose from 'mongoose';


if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(process.env.MONGODB_URL);
  }

  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}

export {dbConnect};
