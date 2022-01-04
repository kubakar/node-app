const Product = require("../models/mProduct");
const utils = require("../utils");

// validation
const { body, validationResult } = require("express-validator"); // destructuring

// products etc...
// ===============================
// CONTROLLER
// logic linking model (data, core logic) and views

// "Add product" page with form (same as 'edit')
module.exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Products",
    buttonCaption: "Add Product",
    editing: false,
  });
};

// POST operation
module.exports.postAddProduct = (req, res) => {
  // create and add element to database

  // const [title, description, price] = req.body;
  const { title, description, price } = req.body;

  // *******************
  // validation handling
  const errros = validationResult(req);

  if (!errros.isEmpty()) {
    utils.warn(errros.array());

    return res.status(422).set("custom-header", "validation error").send("NOK");
  } else utils.log(errros);
  // *******************

  // create product via mongoose model
  const product = new Product({
    title: title,
    price: price,
    description: description,
    // userId: req.session.user._id,
    userId: req.userWithMethods,
    // 'userId: req.userWithMethods' works
    // mongoose would pick up only '_id' thanks to Schema def.
  });

  product
    .save() // this method is coming from mongoose
    // it saves data to MongoDB
    .then((result) => {
      // ...technically we do not have a Promise here
      utils.log(result);
      // res.redirect("admin/products");
      // response? not yet
      res && res.end();
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

module.exports.deleteProduct = (req, res) => {
  // utils.log(req.body);

  // 'delete' method has no 'body' part
  const prodId = req.params.productId; // destr.

  // Product.findByIdAndDelete(prodId) // similar method: findByIdAndRemove
  Product.deleteOne({ _id: prodId, userId: req.userWithMethods._id }) // this method also check if authorized user is deleting own product
    .then((result) => {
      utils.log(result);

      if (result.deletedCount !== 1) {
        return res.status(401).send();
      }
      // return valid data to page
      res.status(200).send(); // .json()
    })
    .catch((err) => {
      utils.err(err);

      // return error data to page
      res.status(500).json();
    });
};

module.exports.getProducts = (req, res) => {
  // important mongoose feature / method = 'populate()'
  // https://mongoosejs.com/docs/populate.html

  // populate will automatically replace the specified path in the document
  // with document(s) from other collection(s).

  // this method works ok becuase Product Schema has a 'ref' attr. pointed to 'User' model
  // which is used during population

  // find products only associated with user - AUTHORIZATION
  // Product.find({ userId: req.userWithMethods._id }) // full user object + inner methods
  Product.find() // full user object + inner methods
    // .select("title") // this method can filter seletcted attributes from a query
    .populate("userId") // cool!
    .then((products) => {
      // utils.log(products);
      res.render("admin/products", {
        pageTitle: "Products - Admin Panel",
        prods: products,
        cUser: req.userWithMethods._id,
      });
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

// increase price only
module.exports.getEditProduct2 = (req, res) => {
  // this is how you extract pars & query params

  // http://127.0.0.1:3000/admin/edit-product/qwe?v1=11&v2=22
  // const reqPar = req.params; // { adminProductId: 'qwe' }
  // const reqQuery = req.query; // { v1: '11', v2: '22' }

  // .../admin/edit-product/618e690410dac917212f1f89?editme=true

  // add special query par
  const editMode = req.query.editme; // '?editme' has to be there as query param
  if (!editMode) {
    // redundant (not really need here)
    return res.redirect("/");
  }

  const price = req.query.price; // '?price' has to be there as query param (?)

  // read prodID with additional '/: ... '
  const prodID = req.params.productId; // 'productId' is declared in routes

  // product which is fetched is not only JS object but a complete Mongo data
  // which is updated (query behind the scnenes)
  Product.findById(prodID)
    .then((product) => {
      // check if authorized user is deleting own product
      if (product.userId.toString() !== req.userWithMethods._id.toString())
        return false;

      product.price++; // data attribute is changed
      return product.save(); // BD data is updated
    })
    .then((result) => {
      if (result) {
        utils.log("Price has been increased.");
        utils.log(result);
      } else utils.warn("Unauthorized action!");

      res.redirect("/admin/products");
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });

  // there ale alternative ways to update data without fetching it to app:
  // eg. update(), findByIdAndUpdate()
};
