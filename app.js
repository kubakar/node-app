// claer console at init
console.clear();

// import libs/data
const express = require("express");
const app = express(); // it is a function!

const authData = require("./authData");
const utils = require("./utils");

// TEST
const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const path = require("path"); // detects Win/Linux directories structure (/ or \)
// 'nodemailer' imported in 'utils'
// ===============================
// Mongoose
const mongoose = require("mongoose");

const { pass, cluster } = authData.mongoPass;
utils.log(pass);
utils.log(cluster);

const uriMongo = `mongodb+srv://node-app:${pass}@cluster0.m87yt.mongodb.net/${cluster}?retryWrites=true&w=majority`;

// import session middleware
const session = require("express-session"); // used as an aqgument below in store
// set session store (DB)
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: uriMongo,
  collection: "sessions",
});

// CSRF token / middleware
// https://www.npmjs.com/package/csurf
const csrf = require("csurf");
const csrfProtection = csrf(); // token relies on session by default, some other option can be set as arg ({})

// The flash is a special area of the session used for storing messages
// https://www.npmjs.com/package/connect-flash
const flash = require("connect-flash");

// others
const errController = require("./controllers/cErrors");
const User = require("./models/mUser");

// import DB...

// ===============================
// TEMPLATING ENGINE - EJS
app.set("view engine", "ejs"); // select global temp. engine
app.set("views", "views"); // select directory with templates

// ===============================
// PARSING REQ. BODY
app.use(express.urlencoded({ extended: false })); // 'next()' call included internally
app.use(express.json());

// ===============================
// SERVE STATIC FILES (eg. css)
app.use(express.static(path.join(utils.rootDir, "public")));
// 'images' subfolder path (as if inside root folder)
app.use("/images", express.static(path.join(utils.rootDir, "images")));

// ===============================
// REGITER SESSION MIDDLEWARE
// https://www.npmjs.com/package/express-session
app.use(
  // cookie (with session ID) will be handled automatically
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    // cookie: { maxAge: 5 * 1000 }, // milliseconds
    store: store, // only solution in production
    /*
    in production, session should not be kept in memory
    but in database instead (hundreds of users eg.)
    For this use special middleware: 'connect-mongodb-session'
    only development or debugging!
    */
  })
);

// csrf token has to be initialized AFTER session is initiated (it depends on it)
app.use(csrfProtection);
// it will monitor every outgoing 'POST' request and stop it without valid token
// therefore

// flash has to be initialized AFTER session is initiated (it depends on it)
app.use(flash());

// ===============================
// GET USER MODEL TO USE ITS INNER METHODS (WITH USER)

app.use((req, res, next) => {
  if (!req.session.user) {
    // no valid session.user
    return next(); // quit function and pass req further
  }

  // if user is logged (pending session) - import user model functions with methods
  User.findById(req.session.user._id) // taken from session data (user must be logged in order to work)
    .then((user) => {
      // guard clause
      if (!user) return next(); // user does not exist

      // user = full mongoose model (with methods)
      req.userWithMethods = user; // used only for inner methods (has data as well)
      next(); // continue with handling request
    })
    .catch((err) => {
      // 'next' has to be used in async. code (inside a Promise)
      next(new Error(err)); // tech. issue
    });
});

// ===============================
// own middleware to add common input parameters to every rendered page with express
app.use((req, res, next) => {
  // append data that will be passed to every rendered view
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.currentUser = req.userWithMethods?.email;

  // requests must carry token in order to be passed by server
  // this token will be given to client controls (eg. login button)
  res.locals.csrfToken = req.csrfToken(); // method provied by 'csurf' middleware
  next();
});

// ===============================
// ROUTING
// filtered - all requests at '/admin/...'
app.use("/admin", adminData); // handle all admin routes
app.use(shopRoutes); // handle all shop routes
app.use(authRoutes);

// server error
app.get("/500", errController.get500);
// test error trigger
app.get("/trigger", errController.triggerError);

// no route taken, so there is a 404 problem
app.use(errController.get404);

// ===============================
// ERROR HANDLING MIDDLEWARE
// in case of error, all other middleware is skipped to land here
// special type with 4 arguments is recognized as 'error middleware' by express
app.use((error, req, res, next) => {
  // anytime when 'next(errorArg)' is called in code, this will fire
  // go to 'status 500' page
  utils.err(error);
  res.redirect("/500");
  // res.status(error.httpStatusCode).render( ... ); // example
});

mongoose
  .connect(uriMongo)
  .then((result) => {
    // utils.log(result);
    utils.log("Connected to DB, app started");
    app.listen(3000);
  })
  .catch((err) => utils.err(err));

// info
/// This is basic training
