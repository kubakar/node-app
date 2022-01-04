const utils = require("../utils");

const express = require("express");
const { body } = require("express-validator"); // destructuring

const authController = require("../controllers/cAuth");

// inner function - validation (request BODY)
// can be formatted as array
const validateInputs = () => {
  // second argument is specific error message
  return [
    // validators & sanitizers can be chained together
    body("email", "This is wrong email format").isEmail().normalizeEmail(),
    body("password").isLength({ min: 5 }).trim(),
  ];
};

// check fields equality
const validateSignupPass = () => {
  // custom method is added ('custom()')
  return body("confirmPassword")
    .trim()
    .custom((value, { req, loc, path }) => {
      // we have access to 'req' object
      if (value !== req.body.password) {
        // trow error if passwords do not match
        throw new Error("Passwords don't match");
      } else {
        return true;
      }
    });
};

// ===============================
// ROUTER
const router = express.Router();

router.get("/login", authController.getLogin);

router.post("/login", validateInputs(), authController.postLogin);

router.post("/logout", authController.postLogout);

// signup

// add validation middleware
// router.post("/signup", body("email").isEmail(), authController.postSignup);
router.post(
  "/signup",
  validateInputs(),
  validateSignupPass(),
  authController.postSignup
);

router.get("/signup", authController.getSignup);

// ===============================
// EXPORT
module.exports = router;
