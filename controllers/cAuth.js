const utils = require("../utils");

// encryption
const bcrypt = require("bcrypt");
const bcryptSaltRounds = 10;

// test
const User = require("../models/mUser");

exports.getLogin = (req, res, next) => {
  // retrieved flash message, 'undefined' if array is empty
  const [errMessage] = req.flash("error"); // it returns array

  res.render("auth/login", {
    pageTitle: "Login",
    errorMessage: errMessage,
  });
};

exports.postLogin = (req, res) => {
  // create and add element to database
  const [email, password] = req.body;

  // look for email in DB
  User.findOne({ email: email }) // users collection
    .then((userDoc) => {
      // guard clause 1
      if (!userDoc) {
        utils.warn("No such user!");
        // data passed via 'flash' when redirected
        req.flash("error", "No such user!"); // key, value

        return res.send({ path: "/login" }); // special AJAX POST method applied on client side
      }

      return bcrypt
        .compare(password, userDoc.password)
        .then((validPass) => {
          if (!validPass) {
            utils.warn("Invalid password!");
            // data passed via 'flash' when redirected
            req.flash("error", "Invalid password!"); // key, value

            return res.send({ path: "/login" }); // special AJAX POST method applied on client side
          }

          // store user and 'loggedIn' bit in session now
          req.session.isLoggedIn = true;
          req.session.user = userDoc;

          req.session.save((err) => {
            res.send({ path: "/" });
          });
        })
        .catch((err) => utils.err(err));
    })
    .catch((err) => utils.err(err));
};

// log out
exports.postLogout = (req, res) => {
  // clear session
  req.session.destroy((err) => {
    // utils.err(err);
    res.redirect("/login");
  });
};

// =================================
// signup
exports.postSignup = (req, res) => {
  // standard HTML post form ('name' is base attribute)
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // check if user already exists
  User.findOne({ email: email }) // { document attr : value }
    .then((userDoc) => {
      if (userDoc) {
        // guard clause
        utils.warn("This user already exists!");
        // set 'flash' for redirect
        req.flash("error", "This user already exists!"); // key, value

        return res.redirect("/signup"); // TBD : error message
      }

      // encrypt password now
      return bcrypt
        .hash(password, bcryptSaltRounds)
        .then(function (hashPass) {
          // Store hash in your password DB

          // create new user (model)
          // TBD - validate input
          const user = new User({
            email: email,
            password: hashPass,
            cart: { items: [] },
          });

          return user.save(); // Mongo save
        })
        .then((userSaved) => {
          res.redirect("/login");
        })
        .catch((err) => utils.err(err));
    })
    .catch((err) => {
      utils.err(err);
    });
};

exports.getSignup = (req, res) => {
  // retrieved flash message, 'undefined' if array is empty
  const [errMessage] = req.flash("error"); // it returns array

  res.render("auth/signup", {
    pageTitle: "Signup",
    isAuthenticated: false, // override
    errorMessage: errMessage,
  });
};
