const express = require("express");
const utils = require("../utils");

const adminController = require("../controllers/cAdmin");
const isAuth = require("../middleware/is-auth"); // protect routes
// ===============================
// ROUTER
// multiple routes can be assigned to 'router' group
const router = express.Router();

// paths are filtered via 'use()' method in 'app.js'

// own middleware 'isAuth' added (functions args)
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST (FORM)
router.post("/add-product", isAuth, adminController.postAddProduct);

// router.get("/edit-product/:productId", adminController.getEditProduct);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct2);
router.post("/del-product", isAuth, adminController.postDeleteProduct);

// ===============================
// EXPORT
module.exports = router;
