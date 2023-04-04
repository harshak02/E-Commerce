const ErrorHandler = require("../utils/errorhandler");
//async errors are handled
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken")


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