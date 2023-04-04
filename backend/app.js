const express = require("express");
const app = express(); //initializing express app
app.use(express.json());//setup

const errorMiddleware = require("./middleware/error");

//Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");

//postman url usgae
app.use("/api/v1",product);
app.use("/api/v1",user)

//Middleware for errors
app.use(errorMiddleware);

module.exports = app;