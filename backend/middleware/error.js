const ErrorHandler = require("../utils/errorhandler");

//error handling 
module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //manually we are entering the error
    //wrong mongodb id format error
    //castError -> first word in the occured error in console.log
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid : ${err.path}`;
        err = new ErrorHandler(message,400);
    }

    //dupliacte emails while registering
    //not working will resolve later
    if(err.name === "E11000 duplicate key error collection"){
        const message = `Duplicate Emails ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message,400);
    }

    //jwt errors 
    if(err.name === "JsonWebTokenError"){
        const message = `Json web token is invalid try again. Invalid`;
        err = new ErrorHandler(message,400);
    }

    //jwt expire error
    if(err.name === "TokenExpiredError"){
        const message = `Json web token is expired try again. Invalid`;
        err = new ErrorHandler(message,400);
    }

    //default one
    res.status(err.statusCode).json({
        success : false,
        message : err.message
    });
}

