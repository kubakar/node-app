const express = require("express");
const utils = require("../utils");

const adminController = require("../controllers/cAdmin");
const isAuth = require("../middleware/is-auth"); // protect routes

const { body } = require("express-validator"); // destructuring

// ===============================
// inner function - validation (request BODY)
// can be formatted as array
const validateProduct = () => {
  // second argument is specific error message
  return [
    // validators & sanitizers can be chained together
    body("title").toUpperCase(),
    body("description").isLength({ min: 5 }),
    body("price").isNumeric().trim(),
  ];
};

// ===============================
// ROUTER
// multiple routes can be assigned to 'router' group
const router = express.Router();

// paths are filtered via 'use()' method in 'app.js'

// own middleware 'isAuth' added (functions args)
// request travels from left to right
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST (FORM)
router.post(
  "/add-product",
  validateProduct(),
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct2);

// router.post("/del-product", isAuth, adminController.postDeleteProduct);

// action with client JS code (with parameter)
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

// ===============================
// EXPORT
module.exports = router;
