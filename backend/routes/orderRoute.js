const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    deleteOrder,
    updateOrder,
} = require("../controllers/orderController");
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder); //for user

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

router
    .route("/admin/orders")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router
    .route("/admin/order/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
