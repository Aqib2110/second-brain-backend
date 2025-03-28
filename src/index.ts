import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { userModel,contentModel,shareModel } from './db';
import {AuthMiddleware} from './middleware';
import { random } from './utils';
const app = express();
dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
async function connect(): Promise<void> {
    const mongoURI = process.env.MONGO_URI;
  
    if (!mongoURI) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      process.exit(1); 
    }
  
    try {
      await mongoose.connect(mongoURI);
      console.log("✅ Connected to MongoDB successfully");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
    }
  }
connect();  
let secret = "ILOVEALLAH";
app.post('/api/v1/signup',async(req,res)=>{
    try {  
const username = req.body.username;
const password = req.body.password;
console.log(req.body);
const hashedPassword = await bcrypt.hashSync(password,10);
console.log(hashedPassword);

await userModel.create({
    username:username,
    password:hashedPassword
})
res.send({
    message:"sign up successfully"
})
    } catch (error) {
      console.log(error);  
    }
})

app.post('/api/v1/signin',async(req,res)=>{
   try {
    const {username,password} = req.body;
    const user = await userModel.findOne({
        username:username,
    })
    if(user)
    {
        let matched = await bcrypt.compare(password,user.password);
        if(matched)
        {
            const token = jwt.sign({ id: user._id }, secret);
            res.header('Authorization', `Bearer ${token}`);
            res.json({
            data: "sign in successfully",
            token: token
            });
        }
        else {
            res.json({
            message: "invalid credentials"
            });
        }

      
    }
    else{
        res.json({
            message:"invalid credentials"
        })
    }
   } catch (error)
    {
    console.log(error);
   }
})
//@ts-ignore
app.post('/api/v1/content',AuthMiddleware,async(req,res)=>{
    const {title,link} = req.body;
    //@ts-ignore
    const userId = req.userId;
    await contentModel.create({
link,
title,
tags:[],
userId:userId
    })
  res.json({
    message:"content posted successfully"
  })
})
//@ts-ignore
app.get('/api/v1/content',AuthMiddleware,async(req,res)=>{
    //@ts-ignore
    const userId = req.userId;
    const content = await contentModel.find({
userId:userId
    }).populate("userId","username");
    res.json({
        content
    })
})
 //@ts-ignore
app.delete('/api/v1/content',AuthMiddleware,async(req,res)=>{
      //@ts-ignore
      const contentId = req.body._id;
      const content = await contentModel.deleteOne({
  _id:contentId
      })
      res.json({
          message:"content deleted successfully"
      })
})
 //@ts-ignore
app.post('/api/v1/brain/share', AuthMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const userId = req.userId;
    const share  = req.body.share;
    console.log(share);
    if(share) 
    {
      const existingLink = await shareModel.findOne({ userId });
      if (existingLink) {
        console.log(existingLink);
        return res.json({
          message: "Link already created",
          data: existingLink,
        });
      } else {
        const hash = random(10);
        await shareModel.create({ hash, userId });
        return res.json({
          message: "Link created successfully",
          data: hash,
        });
      }
    } 
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
});
 //@ts-ignore
app.delete('/api/v1/brain/share', AuthMiddleware, async (req, res) => {
try {
   //@ts-ignore
  const userId = req.userId;
  const share  = req.body.share;
  if(share){
    await shareModel.deleteOne({ userId });
    console.log("deleted");
    return res.json({
      message: "Link deleted successfully",
    });
  }
  else{
    return res.json({
      message: "bad request",
    });
  }
} catch (error) {
  console.log(error);
}

})

app.get('/api/v1/brain/:shareLink',async(req,res)=>{
  try {
    const shareLink = String(req.params.shareLink || '');
    const hash = shareLink.split('').filter((value:any,index:any)=>index>1).join('');
    console.log(hash);
    const Link = await shareModel.findOne({
        hash:hash,
    })
    if(Link){
         //@ts-ignore
        const userId = Link.userId;
    const data = await contentModel.find({
userId:userId,
      });
      const user = await userModel.findOne({
        userId:userId
      })
if(data){
    res.json({
        user:user?.username,
        data:data
    })
}
else{
    res.json({
        message:"No data found"
    })
}
    }
    else{
        res.json({
            message:"no Link found",
        })
    }
  } catch (error) {
    console.log(error);
  }
})

app.listen(3000,()=>{
    console.log(`server is listening at http://localhost:3000`)
})