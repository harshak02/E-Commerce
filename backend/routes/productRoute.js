const express = require("express");

//telling that use the controller from controller section and importing 
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetails } = require("../controllers/productController");
const {isAuthenticatedUser,authorizeRoles} = require("../middleware/auth");

const router = express.Router();

//in the route of products we dedicate that to get req of getAllProducts of cntrler
//authorize roles have not been created yet
router.route("/products").get(getAllProducts);

//route function for the creating the new product
router.route("/admin/product/new").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);

//route function for updating the product and deleting 
//as same url route so you can do this
router.route("/admin/product/:id")
.put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct);

router.route("/product/:id").get(getProductDetails);

module.exports = router