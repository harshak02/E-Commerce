const mongoose = require("mongoose");

//here .then means after happening of that connection and .catch means if error occured
//process.env.DB_URI is good practice takes the value from config
//creating a function connectDataBase and putting inside it and exporting
//we have removed the useCreateIndex **
const connectDataBase = ()=>{
    mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then((data)=>{
        console.log(`MongoDB connected with server data: ${data.connection.host}`);
    })//removed the catch block becasue we handled that in server unhandled promise rejection
}

module.exports = connectDataBase;