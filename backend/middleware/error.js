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

    //default one
    res.status(err.statusCode).json({
        success : false,
        message : err.message
    });
}

