const utils = require("../utils");

// encryption
const bcrypt = require("bcrypt");
const bcryptSaltRounds = 10;

// validation
const { body, validationResult } = require("express-validator"); // destructuring

// test
const User = require("../models/mUser");

exports.getLogin = (req, res, next) => {
  /*
  // preview cookies attached (initial method)
  // 'get()' returns the specified HTTP request header field
  // retrieve value
  const cookie = req.get("cookie")?.trim().split("=")[1];
  // "?." nullish operator forces undefined instead of error
  const isLoggedIn = cookie === "true";
  utils.log(isLoggedIn);
  */

  // retrieved flash message, 'undefined' if array is empty
  const [errMessage] = req.flash("error"); // it returns array

  res.render("auth/login", {
    pageTitle: "Login",
    errorMessage: errMessage,
    prevInput: { email: "" },
  });
};

exports.postLogin = (req, res) => {
  // create and add element to database

  /*
  // !! this will not work => "req" is no longer valid
  // since it will be terminated with "response"
  req.isLoggedIn = true;
  // cookies can be remedy for this (non-confidential data)
  */

  /*
  // set a cookie with "setHeader()"
  res.setHeader("Set-Cookie", "loggedIn=true; Max-Age=3600; HttpOnly");
  // "Set-Cookie" is reserved header tag
  // 2nd arg. is key/value pair
  // with 'Max-Age' expiration time is set [seconds]
  // 'HttpOnly' safes cookie values from client side JS (better security)

  // cookies can be previewed in browser dev. tools in Application tab
  // a cookie stays within current sessions on every request (visible in a headers)
  */

  const { email, password } = req.body;
  // utils.log([email, password]);

  // *******************
  // validation handling
  const errros = validationResult(req);

  if (!errros.isEmpty()) {
    utils.warn(errros.array());

    return res.status(422).render("auth/login", {
      pageTitle: "Login failed!",
      isAuthenticated: false, // override
      errorMessage: `${errros.array()[0].msg} - ${errros.array()[0].param}`,
      prevInput: { email: email === "@" ? "" : email }, // keep user input for better UX, avoid empty value
    });
  } else utils.log(errros);
  // *******************

  // look for email in DB
  User.findOne({ email: email }) // users collection
    .then((userDoc) => {
      // guard clause 1
      if (!userDoc) {
        utils.warn("No such user!");
        // data passed via 'flash' when redirected
        req.flash("error", "No such user!"); // key, value
        /* 
        // allternative
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*"); // accessible locally (CORS)
        res.end(JSON.stringify({ a: 1 }));  // standard node method (not express)
        */
        return res.redirect("/login");
      }
      // // guard clause 2 - user found, check password now (WITHOUT ENCRYTPION!)

      // check encrypted pass
      // nested promise! Specific case with conditional closure before
      return bcrypt
        .compare(password, userDoc.password)
        .then((validPass) => {
          if (!validPass) {
            utils.warn("Invalid password!");
            // data passed via 'flash' when redirected
            req.flash("error", "Invalid password!"); // key, value
            return res.redirect("/login");
          }

          // logging data is OK, proceed => ...

          // store user and 'loggedIn' bit in session now
          req.session.isLoggedIn = true;
          req.session.user = userDoc; // NOT full mongoose model
          // in sessions, methods (from mongoose model) are not preserved in next calls, data only

          // it is not mandatory to use 'save' method, but it keeps server from responsing to early
          // session would also save automatically without this method
          // especially the case with session stored in DB (production)
          req.session.save((err) => {
            res.redirect("/");
          });
        })
        .catch((err) => utils.err(err));
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

// log out
exports.postLogout = (req, res) => {
  // clear session
  req.session.destroy((err) => {
    // utils.err(err);
    res.redirect("/login");
    // browser cookie will be still visible but session storage will be cleared
    // in production (with session stored in DB, item will be deleted)
  });
};

// =================================
// signup
exports.postSignup = (req, res) => {
  // standard HTML post form ('name' is base attribute)
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // *******************
  // validation handling
  const errros = validationResult(req);

  if (!errros.isEmpty()) {
    utils.warn(errros.array());

    return res.status(422).render("auth/signup", {
      pageTitle: "Signup failed!",
      isAuthenticated: false, // override
      errorMessage: `${errros.array()[0].msg} - ${errros.array()[0].param}`,
      prevInput: { email: email === "@" ? "" : email }, // avoid empty value
      // prevInput: { email: email }, // keep user input for better UX
    });
  } else utils.log(errros);
  // *******************

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
      // nested promise! Specific case to avoid going to next 'then' if function already returned earlier)
      // there is no another "then" after this
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
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

exports.getSignup = (req, res) => {
  // retrieved flash message, 'undefined' if array is empty
  const [errMessage] = req.flash("error"); // it returns array

  res.render("auth/signup", {
    pageTitle: "Signup",
    isAuthenticated: false, // override
    errorMessage: errMessage,
    prevInput: { email: "" }, // no previous input, 1st call
  });
};

// ****
// Password recovery (email + token) is skipped in this app
// ****
exports.passwordRecovery_TBD = (req, res) => {};
