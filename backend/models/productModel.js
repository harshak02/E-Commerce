const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        //if true then true else false then execute that line of code
        required : [true,"Please Enter Product Name"],
        trim : true,
    },
    description : {
        type : String,
        required : [true,"Please Enter Product Desc"],
    },
    price : {
        type : Number,
        required : [true,"Please Enter product price"],
        maxLength : [8,"Price cannot exceed * chars"],
    },
    rating : {
        type : Number,
        default : 0,
    },
    images : [
        {
            //id of image
            public_id : {
                type : String,
                required : true,
            },
            //uploaded 
            url : {
                type : String,
                required : true,
            }
        }
    ],
    catogery : {
        type : String,
        required : [true,"Please Enter catogery"],
    },
    Stock : {
        type : Number,
        required : [true,"Please Enter stock of product"],
        maxLength : [4,"Stock cannot exceed 4 chars"],
        default : 1,
    },
    numOfReviews : {
        type : Number,
        default : 0,
    },
    reviews : [
        {
            name : {
                type : String,
                required : true,
            },
            rating : {
                type : Number,
                required : true,
            },
            comment : {
                type : String,
                required : true,
            }
        }
    ],

    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },


});

module.exports = mongoose.model("Product",productSchema);