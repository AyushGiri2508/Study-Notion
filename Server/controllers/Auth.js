    const User=require('../models/User');
    const OTP=require('../models/OTP');
    const otpGenerator=require('otp-generator');
    const bcrypt=require('bcrypt');
    const jwt=require('jsonwebtoken');
    require('dotenv').config();


// Sendotp
    exports.sendOTP= async (req,res)=>{
        try {

             // fetch email from req.body
        const {email}= req.body;

        // check if user already exists
        const checkUserPresent= await User.findOne({email});

        // if user already exists, send  response.
        if(checkUserPresent){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            })

        }
        // generate  digit otp
        var otp= otpGenerator.generate(6,{upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false});
        console.log(otp);

        // check if otp already exists for the email, if yes then update it, else create a new otp entry

        let result= await OTP>findOne({otp:otp});
        while(result){
            otp= otpGenerator.generate(6,{upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false});
            result= await OTP.findOne({otp:otp});
        }

        const otpPayload={email,otp};
        // create a new otp entry
        const otpBody= await OTP.create(otpPayload);
        console.log(otpBody);

        // return response
        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp,


        })
    }
        catch(error) {
            console.log(error);
            res.status(500).json({
                success:false,
                message:error.message,
            })
        }


    }
    


// sign up
        exports.signUp= async (req,res)=>{
            try{

                // data fetch from request ki body
            const{
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                accountType,
                contactNumber,
                otp,
            }= req.body;
            // validate krlo

            if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
                return res.status(403).json({
                    success:false,
                    message:"All fields are required",
                })
            }
            // 2 password match krlo
            if(password!==confirmPassword){
                return res.status(400).json({
                    success:false,
                    message:"Password and confirm password do not match, please try again",
                })
            }
            // check if user already exists or not
            const existingUser= await User.findOne({email});
            if(existingUser){
                return res.status(400).json({
                    success:false,
                    message:"User already exists, please login",
                })
            }

            // find most recent otp for the email and match it with the otp sent by user
                const recentOTP= await OTP.find({email}).sort({createdAt:-1}).limit(1);
                console.log(recentOTP);

            // validate otp
            if(recentOTP.length===0){

                // no otp found for the email
                return res.status(400).json({
                    success:false,
                    message:"OTP not found for the email, please request for OTP",
                })
            }
            else if(recentOTP[0].otp!==otp){
                // Invalid otp
                return res.status(400).json({
                    success:false,
                    message:"Invalid OTP, please try again",
                })
            }

            // hash password
            const hashedPassword= await bcrypt.hash(password,10);
            // create entry in DB
            const profileDetails=await Profile.create({
                gender:null,
                dateOfBirth:null,
                about:null,
                contactNumber:null,
            })


            const user = await User.create({
                firstName,
                lastName,
                email,  
                contactNumber,
                password:hashedPassword,
                accountType,
                additionalDetails:profileDetails._id,
                image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
            })

            // return response
            return res.status(200).json({
                success:true,
                message:"User registered successfully",
                user,   
            

            })
            }
            catch(error){
                console.log(error);
                return res.status(500).json({
                    success:false,
                    message:"User cant be registered, please try again ",
                })
            }

        }



// login

        exports.login= async (req,res)=>{
            try{

                //  get data from request body
                const {email,password}= req.body;
                // validate data
                if(!email || !password){
                    return res.status(403).json({
                        success:false,
                        message:"All fields are required,Please try again",
                    })
                }
                // check if user exists or not
                const user= await User.findOne({email}).populate("additionalDetails");
                if(!user){
                    return res.status(401).json({
                        success:false,
                        message:"User not found, please sign up",
                    })
                }
                // generate JWT token,after password match
                    if(await bcrypt.compare(password,user.password)){
                        const payload={
                            email:user.email,
                            id:user._id,
                            accountType:user.accountType,
                        }
                        const token =jwt.sign(payload,process.env.JWT_SECRET,{
                            expiresIn:"2h",
                        });
                        user.token=token;
                        user.password=undefined;

                    
                // create a cookie and send response
                const options={
                    expires:new Date(Date.now()+3*24*60*60*1000),
                    httpOnly:true,
                }
                    res.cookie("token",token,options).status(200).json({
                        success:true,
                        token,
                        user,
                        message:"Logged in successfully",

            })
        }
            else{
                return res.status(401).json({
                    success:false,
                    message:"Invalid credentials, please try again",
                });

            }
        }
            catch(error){
                console.log(error);
                return res.status(500).json({
                    success:false,
                    message:"Login failed, please try again",
                })

            }

        };



// change password

exports.changePassword= async (req,res)=>{
    try{
        // get data from request body
        // getold password,newpassword,confirm password
        // validation

        // updatepwd in Db
        // send mail to user about password change
        // return response
    }catch(error){
    }


}
