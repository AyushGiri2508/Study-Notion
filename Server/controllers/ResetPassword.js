const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    //    get email from req.body
    const email = req.body.email;
    //   check if user exists for this email, if not send response
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Your email is not registerd with us",
      });
    }
    // generate token
    const token = crypto.randomUUID();
    // update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true },
    );
    // create url
    const url = `http://localhost:3000/update-password/${token}`;
    // send email to user with the url
    await mailsender(
      email,
      "Password reset link",
      `Click on the link to reset your password ${url} . This link is valid for 5 minutes`,
    );

    // send response
    return res.status(200).json({
      success: true,
      message:
        "Password reset link has been sent to your email account, please check your inbox",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Soimething went wrong, while sending the password reset email, please try again later",
    });
  }
};

// resetPassword

exports.resetPassword = async (req, res) => {
  try {
    // get token from req.params and new password from req.body
    const { password, confirmPassword, token } = req.body;
    // validate the token by checking if there is a user with the token and the token has not expired
    if (password != confirmPassword) {
      return res.json({
        success: false,
        message: "Password not matching",
      });
    }
    // get user details from db
    const userDetails = await User.findOne({ token: token });
    // if no entry-invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "token is invalid",
      });
    }
    // token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired,please regenrate your token",
      });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // update user by setting new password and removing token and expiration time
    await User.findOneAndUpdate(
      { token: token },
      { password: password },
      { new: true },
    );
    // send response
    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Soimething went wrong, while sending the password reset email, please try again later",
    });
  }
};
