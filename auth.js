const JWT = require('jsonwebtoken');

const  secret ="abcdefg";

const createJWT = async({id})=>{
    return  await JWT.sign({id},secret,{expiresIn :"1h"})
}

const authenticate = async(req,res,next)=>{
    try{
            const bearer =await req.headers["authorization"];
            if(!bearer) {
                return res.json({
                    message:"acess failed"
                })
            }
            else{
                JWT.verify(bearer,secret,(err,res)=>{
                    if(res){
                        next();
                    }else{
                        res.json({
                            message :"something went wrong in authorization"
                        })
                    }
                })
            } 
    }catch(error){
        return res.json({
                message:"something went wrong"
        })
    }
}
module.exports = {createJWT , authenticate }