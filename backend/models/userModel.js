const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");//forgot passwords

const userSchema = new mongoose.Schema({

    name : {
        type : String,
        reqired : [true,"Please enter your name"],
        maxLength : [30,"Name cannot exceed 30 chars"],
        minLength : [4,"Name should have more than 5 chars"]
    },
    email : {
        type : String,
        required : [true,"Please enter your email"],
        unique : true,
        validate : [validator.isEmail,"Please enter valid email"]
    },
    password : {
        type : String,
        required : [true,"Please enter the password"],
        minLength : [8, "Please enter the password with more than 8 Chars"],
        select : false, // wont be queried by anyone in find method
    },
    avatar : {
        public_id : {
            type : String,
            required : true,
        }, 
        url : {
            type : String,
            required : true,
        }
    },
    role : {
        type : String,
        default : "user",

    },
    resetPasswordToken : String,
    resetPasswordExpire : Date,
});

//pre is an event that is before save run this
//we cant use this keyword in nrml
userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

//JWT TOKEN
userSchema.methods.getJWTToken = function(){
    //random key given to the user separetely
    return jwt.sign({id : this._id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRE,
    });
}

//comparing passwords while login
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

//forgot passwoord logic (generating password reset token)
userSchema.methods.getResetPasswordToken = function(){

    const resetToken = crypto.randomBytes(20).toString("hex");
    //hashing and adding to user Schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15*60*1000;//expire of reset password

    return resetToken;
}

module.exports = mongoose.model("User",userSchema);