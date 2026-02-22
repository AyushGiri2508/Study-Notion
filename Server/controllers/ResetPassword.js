  const User = require("../models/User");
  const mailSender = require("../utils/mailSender");


// resetPasswordToken
exports.resetPasswordToken= async (req,res)=>{
    try {

        //    get email from req.body
const email=req.body.email;
//   check if user exists for this email, if not send response
const user= await User.findOne({email:email});
if(!user){
    return res.status(400).json({
        success:false,
        message:"Your email is not registerd with us"
    });
}
// generate token
const token=crypto.randomUUID();
// update user by adding token and expiration time
const updatedDetails= await User.findOneAndUpdate({email:email},{
    token:token,
    resetPasswordExpires:Date.now()+5*60*1000,
},{new:true});
// create url
const url= `http://localhost:3000/update-password/${token}`;
// send email to user with the url
await mailsender(email,"Password reset link",`Click on the link to reset your password ${url} . This link is valid for 5 minutes`);

// send response
return res.status(200).json({
    success:true,
    message:"Password reset link has been sent to your email account, please check your inbox",
})
 

    } catch(error) {

        
    }



}



// resetPassword



