const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorhandler");
//async errors are handled
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Product = require("../models/productModel");

//create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        user: req.user.id,
    });

    res.status(201).json({
        success: true,
        order
    });


});



//Get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {

    //populate means user table me jakar instead of user id it gives name and email of user
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("order not found with this id", 404));
    }

    res.status(200).json({
        success: true,
        order
    });


});



//get logged in and see user orders --user
exports.myOrders = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.find({user : req.user.id});

    res.status(201).json({
        success : true,
        order
    });
});



//get all orders for admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {

    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order)=>{
        totalAmount+=order.totalPrice;
    })

    res.status(201).json({
        success : true,
        totalAmount,
        orders,
    });
});


//update order status -- admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Product Not found",404));
    }

    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("Aldready the product is delivered",400));
    }

    order.orderItems.forEach(async (o)=>{
        await UpdateStock(o.product,o.quantity);
    });

    order.orderStatus = req.body.status;
    
    if(req.body.status==="Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave : false});

    res.status(200).json({
        success : true
    });
});


async function UpdateStock (id,quantity){
    const product = await Product.findById(id);
    product.Stock-=quantity;

    await product.save({validateBeforeSave : false});
}


//delete Order  --admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Product Not found",404));
    }

    await Order.findByIdAndRemove(req.params.id);

    res.status(200).json({
        success : true,
    });
});
