const express = require("express");

const authController = require("../controllers/cAuth");

// ===============================
// ROUTER
const router = express.Router();

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

// signup
router.post("/signup", authController.postSignup);
router.get("/signup", authController.getSignup);

// ===============================
// EXPORT
module.exports = router;
