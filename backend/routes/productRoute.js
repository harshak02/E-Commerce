const express = require("express");
//telling that use the controller from controller section
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetails } = require("../controllers/productController");

const router = express.Router();

//in the route of products we dedicate that to get req of getAllProducts of cntrler
router.route("/products").get(getAllProducts);

//route function for the creating the new product
router.route("/product/new").post(createProduct);

//route function for updating the product and deleting 
//as same url route so you can do this
router.route("/product/:id").put(updateProduct).delete(deleteProduct).get(getProductDetails);

module.exports = router