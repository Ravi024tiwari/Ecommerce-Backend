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

// lib/mongodb.js
import mongoose from 'mongoose';
import dotenv from "dotenv"
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URL;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable required');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, 
      family: 4,              
      maxPoolSize: 10,        
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export {dbConnect};

