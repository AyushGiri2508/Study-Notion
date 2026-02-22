const jwt=require('jsonwebtoken');
require('dotenv').config();
const User=require('../models/User');

//auth
exports.auth=async(req,res,next)=>{
try{
    // exract token from header
    const token=req.cookies.token||req.body.token||req.header('Authorisation').replace('Bearer ','');
    if(!token){
        return res.status(401).json({success:false,message:'Not authorised to access this route'});
    }
    // verify token
    try{
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            console.log(decoded);
            req.user=decoded;
    }catch{
        // verification failed
        return res.status(401).json({success:false,message:'Not authorised to access this route'});
    }
    next();
}
catch(err){
    return res.status(401).json({success:false,message:'Server error ,something went wrong'});

}
}



// isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=='Student'){
            return res.status(401).json({success:false,message:'This is proted rote only for students, please login as a student to access'});
        }

    }catch{
        return res.status(401).json({success:false,message:'user role cananot be verified,please login again'});

    }

}



// isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=='Admin'){
            return res.status(401).json({success:false,message:'This is proted rote only for Admin, please login as a student to access'});
        }

    }catch{
        return res.status(401).json({success:false,message:'user role cananot be verified,please login again'});

    }

}


// isInstructor
exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType!=='Instructor'){
            return res.status(401).json({success:false,message:'This is proted rote only for Instructor only, please login as a student to access'});
        }

    }catch{
        return res.status(401).json({success:false,message:'user role cananot be verified,please login again'});

    }

}