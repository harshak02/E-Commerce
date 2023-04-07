const express = require("express");
const app = express(); //initializing express app
const cookieParser = require("cookie-parser");

app.use(express.json());//setup
app.use(cookieParser());

const errorMiddleware = require("./middleware/error");

//Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");

//postman url usgae
app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);

//Middleware for errors
app.use(errorMiddleware);

module.exports = app;