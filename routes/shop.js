const express = require("express");
const utils = require("../utils");

const shopController = require("../controllers/cShop");
const isAuth = require("../middleware/is-auth"); // protect routes

// ===============================
// ROUTER
const router = express.Router();

// main page serves html/ejs
router.get("/", shopController.getIndex);

router.get("/product-list", shopController.getProducts);

// extract parameter from URL (dynamic URLs)
// ':' - will handle ALL 'product/' subroutes and extract it

router.get("/products/:productId", shopController.getProduct);

// own middleware 'isAuth' added (functions args)
router.post("/cart", isAuth, shopController.postCart);

router.get("/cart", isAuth, shopController.getCart);

// test email
router.get("/cart/:products", shopController.cartSummary);

// clean cart
router.get("/cart-reset", isAuth, shopController.cleanCart);

// delete from cart
router.post("/cart-del-item", isAuth, shopController.postCartDeleteItem);

// ===============================
// EXPORT
module.exports = router;
