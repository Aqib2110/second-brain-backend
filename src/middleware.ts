import jwt from 'jsonwebtoken'
import { Request,Response,NextFunction } from "express"
export const AuthMiddleware = async(req:Request,res:Response,next:NextFunction)=>{
const jwttoken = req.headers['authorization']?.split(' ')[1];
console.log(jwttoken);
if (!jwttoken) {
    return res.status(401).json({ message: 'No token provided' });
}
try {
    const authentic = await jwt.verify(jwttoken,"ILOVEALLAH");
   if(authentic){
    //@ts-ignore
req.userId = authentic.id;
next();
   }
   else{
return res.json({
    message:"invalid token"
})
   }
   
} catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
}
}