// claer console at init
console.clear();

// import libs/data
const express = require("express");
const app = express();

const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const path = require("path");
// 'nodemailer' imported in 'utils'
// ===============================
// Mongoose
const mongoose = require("mongoose");

// connect with DB via mongoose
// PRIVATE !!

// import session middleware
const session = require("express-session"); // used as an aqgument below in store
// set session store (DB)
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: uriMongo,
  collection: "sessions",
});

// CSRF token / middleware
const csrf = require("csurf");
const csrfProtection = csrf();

// The flash is a special area of the session used for storing messages
const flash = require("connect-flash");

// others
const errController = require("./controllers/cErrors");
const User = require("./models/mUser");
const utils = require("./utils");

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

// ===============================
// REGITER SESSION MIDDLEWARE
app.use(
  // cookie (with session ID) will be handled automatically
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    // cookie: { maxAge: 5 * 1000 }, // milliseconds
    store: store, // only solution in production
  })
);

// csfr token has to be initialized AFTER session is initiated (it depends on it)
app.use(csrfProtection);
app.use(flash());

// ===============================
// GET USER MODEL TO USE ITS INNER METHODS (WITH USER)

app.use((req, res, next) => {
  if (!req.session.user) {
    return next(); // quit function and pass req further
  }

  User.findById(req.session.user._id) // taken from session data (user must be logged in order to work)
    .then((user) => {
      // user = full mongoose model (with methods)
      req.userMethods = user;
      next(); // continue with handling request
    })
    .catch((err) => console.log(err));
});

// ===============================
// own middleware to add common input parameters to every rendered page with express
app.use((req, res, next) => {
  // append data that will be passed to every rendered view
  res.locals.isAuthenticated = req.session.isLoggedIn;

  res.locals.csrfToken = req.csrfToken(); // method provied by 'csurf' middleware
  next();
});

// ===============================
// ROUTING
app.use("/admin", adminData); // handle all admin routes
app.use(shopRoutes); // handle all shop routes
app.use(authRoutes);

// no route taken, so there is a 404 problem
app.use(errController.get404);

mongoose
  .connect(uriMongo)
  .then((result) => {
    // utils.log(result);
    utils.log("Connected to DB, app started");
    app.listen(3000);
  })
  .catch((err) => utils.err(err));
