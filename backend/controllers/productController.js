//controllers matlab helper functions of that particular route

//importing created model here
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
//async errors are handled
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
//import ApiFeatures
const ApiFeatures = require("../utils/apifeatures");

//create product
exports.createProduct = catchAsyncErrors(async (req,res,next)=>{
    //creating and waiting till its get created
    const product = await Product.create(req.body);
    res.status(201).json({success : true,product});
});

//get all products (admin route)
exports.getAllProducts = catchAsyncErrors(async (req,res)=>{

    //number of objs to be shown in single oage (Pagination)
    const resultPerPage = 5;
    const productCount = await Product.countDocuments();//for frontend
    //req.query => keyword=xxxx
    const apiFeatures = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
    //productRoute's controller.. getting all products
    //getting from apis
    const products = await apiFeatures.query; 
    res.status(200).json({
        success : true,
        productCount,
        products
    });
});

//update product (admin route)
exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{

    let product = await Product.findById(req.params.id);
    if(!product){
        //next -> call back function
        return next(new ErrorHandler("Product not found",404));
    }
    else{
        //updating product syntax
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false,
        });
        return res.status(200).json({
            success : true,
            product
        })       

    }
});

//delete product (admin route)
exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{

    const product = await Product.findById(req.params.id);
    
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    else{
        //removing the obj
        await Product.findByIdAndDelete(req.params.id);
        //return keep or not needed
        return res.status(200).json({
            success : true,
            message : "Product Deleted!"
        })       
    }
});

//get Product Details 
exports.getProductDetails = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    else{
        return res.status(200).json({
            success : true,
            product
        })       

    }
});