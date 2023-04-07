const ErrorHandler = require("../utils/errorhandler");
//async errors are handled
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto"); //for hashing (sha256)

//Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "This is sample id",
            url: "profilePicUrl",
        },
    });

    sendToken(user, 201, res);
});

//Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    //checking if valid email and password
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter email or password", 400));
    }
    //select se specify karna password ko
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401)); //unauthorized
    }

    sendToken(user, 200, res);
});

//logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

//forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found!", 404));
    }
    //get reset password token;
    const resetToken = user.getResetPasswordToken();

    //storing the resetpassword token generated into database
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you are not requested this email please ignore it`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent ot ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validationBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    //accessing the email url sent (hashing the token)
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    //now find the user who is trying to reset password
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHandler(
                "Reset password token is invalid or expired try again!",
                404
            )
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password not matches", 400));
    }

    user.password = req.body.password;
    //make undefined and save in DB
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    //log in the user and give him a token
    sendToken(user, 200, res);
});

//get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    //gives us the current user (if authenticated)
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    });
});

//after logged in update or change password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect", 401));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password is not matched", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

//update user Profile --user
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (!req.body.name || !req.body.email) {
        return next(new ErrorHandler("Enter the name and email", 400));
    }

    //we will add cloudinary change avatar later
    //req.user.id is inbuilt
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

//Get all users (admin ko sab ka details chahiye tho) --admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    if (!users) {
        return next(new ErrorHandler("No users yet!", 400));
    }
    res.status(200).json({
        success: true,
        users,
    });
});

//get single user by admin  --admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHandler(`User not found with id ${req.params.id}`, 400)
        );
    }
    res.status(200).json({
        success: true,
        user,
    });
});

//update user Profile --admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    if (!req.body.name || !req.body.email) {
        return next(new ErrorHandler("Enter the name and email", 400));
    }

    //req.user.id is inbuilt
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

//delete User Profile --admin
exports.deleteProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    //we will remove cloudinary change avatar later
    //req.user.id is inbuilt

    if (!user) {
        next(new ErrorHandler(`User not found with id : ${req.params.id}`, 400));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "User deleted Successfully",
    });
});

//Create new Review or update Review --user or admin
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    //if the user is aldready reviwed the product;
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user.id.toString()
    );
    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user.id.toString()) {
                (rev.rating = rating), (rev.comment = comment);
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({
        validateBeforeSave: false,
    });

    res.status(200).json({
        success: true,
    });
});

//GET all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler(`Product not found`, 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

//delete review
exports.deleteProductReviews = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler(`Product not found`, 404));
    }
    //query -> ? after
    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    const numOfReviews = reviews.length;

    const ratings =  avg / reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});
