import mongoose, { Schema,model } from "mongoose";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})

const contentSchema = new Schema({
    link:String,
    title:String,
    tags:[{type:mongoose.Types.ObjectId,ref:'Tag'}],
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
           }
})
const shareSchema = new Schema({
    hash:String,
    userId:{
        type:mongoose.Types.ObjectId,
      ref:'User',
      required:true   
    }
})
export const contentModel = model("Content",contentSchema);
export const userModel = model("User",userSchema);
export const shareModel = model("Share",shareSchema);