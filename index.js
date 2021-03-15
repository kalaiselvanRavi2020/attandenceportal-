const express = require('express');
const mongodb = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');
const {createJWT}=require("./auth")



const router =express();
router.use(express.json());
router.use(cors());
dotenv.config();

const mongoClient =mongodb.MongoClient;
const objectId=mongodb.objectID;
const DB_URL = process.env.DBURL || "mongodb ://127.0.0.1:27017";
const port = process.env.PORT || 3000;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const saltrounds =10;


const transporter = nodemailer.createTransport({
    serivce : "gmail",
    auth :{
        user :EMAIL,
        pass : PASSWORD,
    }
})

// const mailData ={
//     from : process.env.EMAIL,
//     subject :" ATTANDANCE -REPORT"
// }


// const mailMessage = (url)=>{
//     return (
//         `<p>
//             Hi,this is your attandance report<br />
//             <a href = '${url}' target ="_blank">${url} </a><br />

//         </p>`
//     );
// }

// const eotp = (otp)=>{
//     return(
//         `<p>
//         your one time password is <br />
//         ${otp}<br />
//         </p>`
//     )
// }

// admin route

router.get('/admin', async (req, res) => {
    try {
        const client = await mongoClient.connect(DB_URL);
        const db = client.db('attandance');
        const result = await db.collection('users').find().
        // {emp_id: (req.params.emp_id)}
        // project({emp_id : 0,
        // email :0,
        // name : 0,
        // desigination:0,
        // password : 0}).
        toArray();
        res.status(200).json({
            message: "message have been fetched successfully",
             result
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    } finally {
        client.close();
    }
})


router.post("/admin-signup",async(req,res)=>{
    try{
        const client = await mongoClient.connect(DB_URL);
    const db = client.db('attandance');
    const salt = await bcryptjs.genSalt(saltrounds);
    const hash = await bcryptjs.hash(req.body.password,salt);
        const data = {
            emp_id : req.body.emp_id,
            email:req.body.email,
            name : req.body.name,
            password : hash,
        }
await  db.collection ('admin').insertOne(data);
const result =await db.collection('admin').findOne({email:data.email});
res.status(200).json({
    message:"you have successfully sign up"
})

    }
    catch(error){
        console.log("error")
    }finally{
        client.close();
    }
})

router.post ("/admin-login", async(req,res)=>{
    try{
        let client = await mongoClient.connect(DB_URL);
        let db = client.db('attandance');
        //finding user record in db
        let user =await db.collection('admin').findOne({email:req.body.email})
        if(user){
      
            // compare password
             //if both are similar allowuser

             let result =await  bcryptjs.compare(req.body.password,user.password)
        console.log(result);
        if(result){
            const token = await createJWT({id:user._id})
            console.log(token)
            res.status(200).json({
                message:"allow",
                token  
            })
        }else{
            res.status(200).json({
                message:"provided details are not correct"
            })
        } 

        }else{
            res.status(200).json({
                message:"no details avail"
            })
   }
     
    }catch(error){
        console.log("error");
        res.status(200).json({
            message:"wrong login statement or not get updated"
        })
    }finally{
        client.close();
    }
})




router.delete('/delete-user', async (req, res) => {
    try {
        const client = await mongoClient.connect(DB_URL);
        const db = client.db('attandance');
        const secret = await db.collection('users').findOne({emp_id: req.body.emp_id});
        if(secret){
            const compare = await bcryptjs.compare(req.body.password, secret.password);
            if (compare){
                await db.collection('users').findOneAndDelete({emp_id: req.body.emp_id});
                res.status(200).json({message: "message has been deleted successfully"});
            }else{
                res.status(401).json({message: "incorrect password!"})
            }
        }else{
            res.status(404).json({message: "secret key not found!!!"})
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    } finally{
        client.close()
    }
})




//user route


router.post ("/user-signup", async(req,res)=>{
    try{
        const client = await mongoClient.connect(DB_URL);
        const db = client.db("attandance");
        const salt =await bcryptjs.genSalt(saltrounds);
        const hash = await bcryptjs.hash(req.body.password,salt);
        const data = {
            emp_id : req.body.emp_id,
            email:req.body.email,
            name : req.body.name,
            desigination:req.body.desigination,
            password : hash,
        }
await  db.collection ('users').insertOne(data);
const result =await db.collection('users').findOne({email:data.email})

// const eotp = `${req.body.targetotp}?rs = ${result._email}`;
// mailData.to = req.body.targetMail;
// mailData.html = mailMessage(usrMailurl);
// await transporter.sendMail(mailData);
res.status(200).json({
    message:"you have successfully sign up"
})

}catch(error){
        console.log(error);
        res.sendStatus(500);
    }finally{
        client.close();
    }
})







router.post ("/user-login", async(req,res)=>{
    try{
        let client = await mongoClient.connect(DB_URL);
        let db = client.db('attandance');
        //finding user record in db
        let user =await db.collection('users').findOne({email:req.body.email})
        if(user){
      
            // compare password
             //if both are similar allowuser

             let result =await  bcryptjs.compare(req.body.password,user.password)
        console.log(result);
        if(result){
            const token = await createJWT({id:user._id})
            console.log(token)
            res.status(200).json({
                message:"allow",
                token  
            })
        }else{
            res.status(200).json({
                message:"provided details are not correct"
            })
        } 

        }else{
            res.status(200).json({
                message:"no details avail"
            })
   }
     
    }catch(error){
        console.log("error");
        res.status(200).json({
            message:"wrong login statement or not get updated"
        })
    }finally{
        client.close();
    }
})



router.get('/user/:emp_id', async (req, res) => {
    try {
        const client = await mongoClient.connect(DB_URL);
        const db = client.db('attandance');
        const result = await db.collection('users').find({emp_id: (req.params.emp_id)}).
        // project({emp_id : 0,
        // email :0,
        // name : 0,
        // desigination:0,
        // password : 0}).
        toArray();
        res.status(200).json({
            message: "message have been fetched successfully",
             result
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    } finally {
        client.close();
    }
})





router.listen(process.env.PORT || port,()=>{
    console.log(`app is running @${port}`);
})


