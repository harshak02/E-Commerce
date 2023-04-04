const app = require("./app"); //importing app from app.js
const dotenv = require("dotenv");//import dotenv 
const connectDatabase = require("./config/database");//connecting DB from config

//handling uncaught exception ex: console.log(Youtube);
process.on("uncaughtException",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting down the server due to unCaught error");
    process.exit(1);
})

//config
dotenv.config({path:"backend/config/config.env"});

//conecting to datbase
connectDatabase();

//checking if port is working or not
//imports port number from the config.env by dotenv module
//store in server variable
const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
})

//unhandled promise rejection
//handles the catch blocks
process.on("unhandledRejection",err=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting down the server due to unhandled promise rejection");
    server.close(()=>{
        process.exit(1);
    })
})