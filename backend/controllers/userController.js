const ErrorHandler = require("../utils/errorhandler");
//async errors are handled
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js"); 
const crypto = require("crypto");//for hashing (sha256)

//Register a User
exports.registerUser = catchAsyncErrors( async (req,res,next)=>{

    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar : {
            public_id : "This is sample id",
            url : "profilePicUrl"
        }
    });

    sendToken(user,201,res);

})


//Login User
exports.loginUser = catchAsyncErrors( async (req,res,next)=>{

    const {email,password} = req.body;

    //checking if valid email and password
    if(!email || !password){
        return next(new ErrorHandler("Please Enter email or password",400));
    }
    //select se specify karna password ko
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));//unauthorized
    }

    sendToken(user,200,res);
})

//logout user
exports.logout = catchAsyncErrors(async (req,res,next)=>{

    res.cookie("token",null,{
        expires : new Date(Date.now()),
        httpOnly : true
    });
    res.status(200).json({
        success : true,
        message : "Logged Out"
    })
})


//forgot password 
exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{

    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found!",404));
    }
    //get reset password token;
    const resetToken = user.getResetPasswordToken();

    //storing the resetpassword token generated into database
    await user.save({validateBeforeSave : false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you are not requested this email please ignore it`;

    try{
        await sendEmail({
            email : user.email,
            subject : `Ecommerce Password Recovery`,
            message
        });

        res.status(200).json({
            success : true,
            message : `Email sent ot ${user.email} successfully`
        })

    } catch (error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validationBeforeSave : false});
        return next(new ErrorHandler(error.message,500));
    }

});


//Reset Password 
exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{
    //accessing the email url sent (hashing the token)
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    //now find the user who is trying to reset password
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire : {$gt: Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or expired try again!",404));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password not matches",400));
    }

    user.password = req.body.password;
    //make undefined and save in DB
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    //log in the user and give him a token
    sendToken(user,200,res);

})